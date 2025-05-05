"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createSupabaseClient } from "@/lib/supabase/client"
import type { Session, User as SupabaseUser } from "@supabase/supabase-js"

/**
 * Tipo de usuário da aplicação
 */
type User = {
  id: string
  name: string
  email: string
  isAdmin: boolean
  menuQuota: number
}

/**
 * Tipo do contexto de autenticação
 */
type AuthContextType = {
  user: User | null
  supabaseUser: SupabaseUser | null
  session: Session | null
  login: (email: string, password: string) => Promise<{ error: any | null; user: User | null }>
  signup: (email: string, password: string, name: string) => Promise<{ error: any | null }>
  logout: () => Promise<void>
  isLoading: boolean
}

// Chave para armazenamento local dos dados do usuário
const USER_STORAGE_KEY = "cardapio_user_data"

// Contexto de autenticação com valores padrão
const AuthContext = createContext<AuthContextType>({
  user: null,
  supabaseUser: null,
  session: null,
  login: async () => ({ error: null, user: null }),
  signup: async () => ({ error: null }),
  logout: async () => {},
  isLoading: true,
})

/**
 * Hook para acessar o contexto de autenticação
 */
export const useAuth = () => useContext(AuthContext)

/**
 * Função auxiliar para obter usuário do localStorage com validação
 */
const getUserFromStorage = (): User | null => {
  if (typeof window === "undefined") return null

  try {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY)
    if (!storedUser) return null

    const parsedUser = JSON.parse(storedUser)

    // Validação completa da estrutura do objeto
    if (
      parsedUser &&
      typeof parsedUser === "object" &&
      typeof parsedUser.id === "string" &&
      typeof parsedUser.email === "string" &&
      typeof parsedUser.name === "string" &&
      typeof parsedUser.isAdmin === "boolean" &&
      typeof parsedUser.menuQuota === "number"
    ) {
      return parsedUser
    }

    // Se não tiver a estrutura esperada, remover do localStorage
    localStorage.removeItem(USER_STORAGE_KEY)
  } catch (error) {
    localStorage.removeItem(USER_STORAGE_KEY)
  }
  return null
}

/**
 * Provedor de autenticação
 *
 * Gerencia o estado de autenticação do usuário e fornece
 * métodos para login, cadastro e logout.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getUserFromStorage())
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  /**
   * Atualiza os dados do usuário no estado e no localStorage
   */
  const updateUserData = useCallback((userData: User) => {
    setUser(userData)
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData))
  }, [])

  /**
   * Limpa os dados do usuário do estado e do localStorage
   */
  const clearUserData = useCallback(() => {
    setUser(null)
    setSupabaseUser(null)
    setSession(null)
    localStorage.removeItem(USER_STORAGE_KEY)
  }, [])

  // Efeito para verificar a sessão do usuário
  useEffect(() => {
    let isMounted = true
    const supabase = createSupabaseClient()

    if (!supabase) {
      setIsLoading(false)
      return () => {
        isMounted = false
      }
    }

    // Verificar sessão atual
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error || !data.session) {
          if (isMounted) {
            clearUserData()
            setIsLoading(false)
          }
          return
        }

        if (isMounted) {
          setSession(data.session)
          setSupabaseUser(data.session.user)

          // Tentar obter dados do usuário do localStorage primeiro
          const storedUser = getUserFromStorage()
          if (storedUser) {
            setUser(storedUser)
            setIsLoading(false)
          }

          // Buscar dados atualizados do usuário
          try {
            const { data: userData, error: userError } = await supabase
              .from("users")
              .select("*")
              .eq("id", data.session.user.id)
              .single()

            if (!userError && userData && isMounted) {
              const userWithDetails: User = {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                isAdmin: userData.is_admin,
                menuQuota: userData.menu_quota,
              }

              updateUserData(userWithDetails)
            }
          } catch (e) {
            console.error("Erro ao buscar dados do usuário:", e)
          }

          if (isMounted) setIsLoading(false)
        }
      } catch (e) {
        console.error("Erro ao verificar sessão:", e)
        if (isMounted) setIsLoading(false)
      }
    }

    checkSession()

    // Configurar listener para mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return

      if (newSession) {
        setSession(newSession)
        setSupabaseUser(newSession.user)

        try {
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("id", newSession.user.id)
            .single()

          if (!userError && userData && isMounted) {
            const userWithDetails: User = {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              isAdmin: userData.is_admin,
              menuQuota: userData.menu_quota,
            }

            updateUserData(userWithDetails)
          }
        } catch (e) {
          console.error("Erro ao buscar dados do usuário:", e)
        }
      } else if (event === "SIGNED_OUT") {
        clearUserData()
      }

      if (isMounted) setIsLoading(false)
    })

    // Timeout de segurança
    const timeout = setTimeout(() => {
      if (isMounted && isLoading) setIsLoading(false)
    }, 5000)

    return () => {
      isMounted = false
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [clearUserData, updateUserData, isLoading])

  // Redirecionamento baseado no estado de autenticação
  useEffect(() => {
    if (isLoading) return

    const publicRoutes = ["/login", "/cadastro", "/esqueci-senha", "/redefinir-senha"]
    const isPublicRoute = publicRoutes.some((route) => pathname?.startsWith(route))
    const isMenuRoute = pathname?.startsWith("/cardapio/")
    const isCreateRoute = pathname === "/criar-cardapio"
    const isEditRoute = pathname?.startsWith("/editar-cardapio/")
    const isPreviewRoute = pathname?.startsWith("/preview-cardapio/")
    const isRootRoute = pathname === "/"

    // Não redirecionar em rotas públicas de cardápio ou preview
    if (isMenuRoute || isPreviewRoute) {
      return
    }

    // Não redirecionar se estiver na página de criação ou edição e o usuário estiver autenticado
    if ((isCreateRoute || isEditRoute) && user) {
      return
    }

    // Redirecionar usuário não autenticado para login (exceto em rotas públicas)
    if (!user && !isPublicRoute && !isRootRoute) {
      router.push("/login")
    }
    // Redirecionar usuário autenticado para fora de rotas públicas
    else if (user && isPublicRoute) {
      if (user.isAdmin) {
        router.push("/admin/usuarios")
      } else {
        router.push("/")
      }
    }
    // Redirecionar usuário regular para fora de área admin
    else if (user && !user.isAdmin && pathname?.startsWith("/admin")) {
      router.push("/")
    }
  }, [user, isLoading, pathname, router])

  /**
   * Função de login
   */
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const supabase = createSupabaseClient()

      if (!supabase) {
        setIsLoading(false)
        return { error: { message: "Serviço de autenticação não disponível" }, user: null }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setIsLoading(false)
        return { error, user: null }
      }

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single()

      if (userError) {
        setIsLoading(false)
        return { error: userError, user: null }
      }

      const userWithDetails: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        isAdmin: userData.is_admin,
        menuQuota: userData.menu_quota,
      }

      setSession(data.session)
      setSupabaseUser(data.user)
      updateUserData(userWithDetails)
      setIsLoading(false)

      return { error: null, user: userWithDetails }
    } catch (error) {
      setIsLoading(false)
      return { error, user: null }
    }
  }

  /**
   * Função de cadastro
   */
  const signup = async (email: string, password: string, name: string) => {
    try {
      const supabase = createSupabaseClient()

      if (!supabase) {
        return { error: { message: "Serviço de autenticação não disponível" } }
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        return { error }
      }

      if (data.user) {
        const { error: insertError } = await supabase.from("users").insert({
          id: data.user.id,
          email,
          name,
          is_admin: false,
          menu_quota: 3,
        })

        if (insertError) {
          return { error: insertError }
        }
      }

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  /**
   * Função de logout
   */
  const logout = async () => {
    try {
      clearUserData()

      const supabase = createSupabaseClient()
      if (supabase) {
        await supabase.auth.signOut()
      }

      router.push("/login")
    } catch (error) {
      clearUserData()
      router.push("/login")
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        session,
        login,
        signup,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
