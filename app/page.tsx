"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PlusCircle, Edit, Trash2, ExternalLink, MenuIcon, LayoutGrid, Loader2 } from "lucide-react"
import ShareMenuDialog from "@/components/share-menu-dialog"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { useErrorHandler } from "@/hooks/use-error-handler"
import { useErrorContext } from "@/components/error-provider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { MenuService, type Menu } from "@/lib/services/menu-service"
import { ErrorBoundary } from "@/components/error-boundary"
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase/config"
import ConnectionTest from "@/components/connection-test"

/**
 * Página inicial da aplicação
 *
 * Exibe os cardápios do usuário e fornece opções para criar,
 * editar, compartilhar e excluir cardápios.
 */
export default function Home() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  const { handleError } = useErrorHandler()
  const { captureError } = useErrorContext()
  const [menus, setMenus] = useState<Menu[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [configError, setConfigError] = useState<string | null>(null)
  const [menusLoaded, setMenusLoaded] = useState(false)
  const [showConnectionTest, setShowConnectionTest] = useState(false)

  // Verificar configuração do Supabase
  useEffect(() => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      setConfigError("Configuração do Supabase incompleta. Verifique as variáveis de ambiente.")
      setIsLoading(false)
    }
  }, [])

  // Verificar autenticação apenas uma vez após o carregamento inicial
  useEffect(() => {
    if (!authLoading) {
      setAuthChecked(true)
    }
  }, [authLoading])

  // Carregar menus apenas quando a autenticação for verificada e o usuário estiver presente
  useEffect(() => {
    // Evitar carregar menus se já foram carregados, se não há usuário,
    // se a autenticação ainda não foi verificada ou se há erro de configuração
    if (menusLoaded || !authChecked || !user || configError) {
      return
    }

    const loadMenus = async () => {
      let isMounted = true
      setIsLoading(true)

      try {
        let userMenus: Menu[] = []

        try {
          console.log("Carregando cardápios para o usuário:", user.id)

          if (user.isAdmin) {
            // Administrators can see all menus
            userMenus = await MenuService.getAllMenus()
          } else {
            // Regular users see only their own menus
            userMenus = await MenuService.getUserMenus(user.id)
          }

          if (!isMounted) return

          console.log("Cardápios carregados com sucesso:", userMenus.length)
          setMenus(userMenus)
          setMenusLoaded(true) // Marcar que os menus foram carregados
        } catch (error) {
          console.error("Erro ao carregar cardápios:", error)

          if (!isMounted) return

          // Usar dados vazios em caso de erro
          setMenus([])
          setMenusLoaded(true) // Marcar que os menus foram carregados, mesmo com erro
          captureError(error, {
            title: "Erro ao carregar cardápios",
            description: "Não foi possível carregar seus cardápios. Tente novamente mais tarde.",
            severity: "error",
            action: {
              label: "Tentar novamente",
              onClick: () => {
                setMenusLoaded(false) // Permitir nova tentativa
                window.location.reload()
              },
            },
          })

          // Mostrar o teste de conexão em caso de erro
          setShowConnectionTest(true)
        }
      } catch (error) {
        console.error("Erro inesperado:", error)

        if (!isMounted) return

        setMenus([])
        setMenusLoaded(true) // Marcar que os menus foram carregados, mesmo com erro
        setShowConnectionTest(true)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }

      return () => {
        isMounted = false
      }
    }

    loadMenus()

    // Timeout de segurança para evitar loading infinito
    const safetyTimeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false)
        setMenus([]) // Definir menus como array vazio em caso de timeout
        setMenusLoaded(true) // Marcar que os menus foram carregados, mesmo com timeout
        setShowConnectionTest(true)
      }
    }, 5000) // 5 segundos de timeout

    return () => clearTimeout(safetyTimeout)
  }, [user, authChecked, captureError, configError, menusLoaded, isLoading])

  /**
   * Verifica se o usuário pode criar um novo cardápio
   */
  const canCreateMenu = () => {
    if (!user) return false
    if (user.isAdmin) return true

    // Check if the user has reached their menu quota
    return menus.length < user.menuQuota
  }

  /**
   * Manipula o clique no botão de criar cardápio
   */
  const handleCreateMenuClick = () => {
    if (!canCreateMenu()) {
      handleError("Limite de cardápios atingido", {
        title: "Limite atingido",
        description: "Você atingiu o limite de cardápios permitidos para sua conta.",
        severity: "warning",
      })
      return
    }

    // Redirect to the menu creation page
    router.push("/criar-cardapio")
  }

  /**
   * Manipula o clique no botão de excluir cardápio
   */
  const handleDeleteClick = (menu: Menu) => {
    setSelectedMenu(menu)
    setIsDeleteDialogOpen(true)
  }

  /**
   * Exclui o cardápio selecionado
   */
  const handleDeleteMenu = async () => {
    if (!selectedMenu) return

    try {
      await MenuService.deleteMenu(selectedMenu.id)

      // Update the menu list
      setMenus(menus.filter((menu) => menu.id !== selectedMenu.id))

      toast({
        title: "Cardápio excluído",
        description: `O cardápio "${selectedMenu.name}" foi removido com sucesso.`,
      })

      setIsDeleteDialogOpen(false)
    } catch (error) {
      captureError(error, {
        title: "Erro ao excluir cardápio",
        description: "Não foi possível excluir o cardápio. Tente novamente mais tarde.",
        severity: "error",
        action: {
          label: "Tentar novamente",
          onClick: () => handleDeleteMenu(),
        },
      })
    }
  }

  // Mostrar erro de configuração
  if (configError) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
            <h3 className="font-bold">Erro de Configuração</h3>
            <p>{configError}</p>
          </div>
          <p className="text-muted-foreground mb-4">
            Entre em contato com o administrador do sistema para resolver este problema.
          </p>
        </div>
      </div>
    )
  }

  // Mostrar estado de carregamento enquanto verifica autenticação
  if (authLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-[#E5324B]" />
          <p className="mt-4 text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Mostrar estado de carregamento enquanto busca os cardápios
  if (authChecked && user && isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-[#E5324B]" />
          <p className="mt-4 text-muted-foreground">Carregando cardápios...</p>
        </div>
      </div>
    )
  }

  // Mostrar mensagem de login se não estiver autenticado
  if (authChecked && !user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">Faça login para visualizar seus cardápios.</p>
          <Button onClick={() => router.push("/login")} className="bg-[#E5324B] hover:bg-[#d02a41]">
            Ir para o Login
          </Button>
        </div>
      </div>
    )
  }

  // Calcular a porcentagem de uso da cota
  const quotaPercentage = user && !user.isAdmin ? (menus.length / user.menuQuota) * 100 : 100
  const quotaColor = quotaPercentage > 80 ? "text-amber-600" : "text-green-600"

  return (
    <ErrorBoundary>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#E5324B]">Seus Cardápios</h1>
              <p className="text-muted-foreground mt-1">Crie, gerencie e compartilhe seus cardápios digitais</p>
            </div>
            <Button
              onClick={handleCreateMenuClick}
              disabled={!canCreateMenu()}
              size="lg"
              className="bg-[#E5324B] hover:bg-[#d02a41] transition-all shadow-md hover:shadow-lg"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Criar Novo Cardápio
            </Button>
          </div>

          {/* Teste de conexão (mostrado apenas se houver erro) */}
          {showConnectionTest && (
            <div className="mb-4">
              <ConnectionTest />
            </div>
          )}

          {/* Contador de cardápios com destaque */}
          {user && !user.isAdmin && (
            <div className="bg-white border rounded-lg p-4 shadow-sm">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center text-[#E5324B]">
                    <LayoutGrid className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Limite de Cardápios</h3>
                    <p className="text-sm text-muted-foreground">
                      Você está utilizando <span className={quotaColor}>{menus.length}</span> de{" "}
                      <span className="font-medium">{user.menuQuota}</span> cardápios disponíveis
                    </p>
                  </div>
                </div>
                <div className="w-full md:w-1/3">
                  <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#E5324B] rounded-full transition-all duration-500"
                      style={{ width: `${quotaPercentage}%` }}
                      role="progressbar"
                      aria-valuenow={Math.round(quotaPercentage)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                    <span>0</span>
                    <span>{Math.round(quotaPercentage)}%</span>
                    <span>{user.menuQuota}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {menus.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {menus.map((menu) => (
                <div
                  key={menu.id}
                  className="group relative overflow-hidden border rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div
                    className="h-32 flex items-center justify-center relative overflow-hidden"
                    style={{ backgroundColor: menu.bannerColor }}
                  >
                    {menu.bannerImage && (
                      <Image
                        src={menu.bannerImage || "/placeholder.svg"}
                        alt={menu.name}
                        fill
                        className="object-cover"
                        unoptimized={menu.bannerImage.startsWith("blob:") || menu.bannerImage.startsWith("data:")}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent"></div>
                    <MenuIcon className="absolute top-3 left-3 h-6 w-6 text-white/80" />
                    <h3 className="text-white font-bold text-xl text-center px-4 drop-shadow-sm z-10">{menu.name}</h3>
                  </div>

                  <div className="p-5">
                    <div className="flex justify-between items-center mb-4">
                      <Badge variant="outline" className="bg-slate-50 text-slate-700">
                        Cardápio
                      </Badge>
                      <Link
                        href={`/cardapio/${menu.id}`}
                        target="_blank"
                        className="text-slate-500 hover:text-slate-700 transition-colors"
                        aria-label={`Abrir cardápio ${menu.name} em nova aba`}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>

                    <div className="flex gap-2">
                      <ShareMenuDialog menuId={menu.id} menuName={menu.name} />
                      <Link href={`/editar-cardapio/${menu.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteClick(menu)}
                        aria-label={`Excluir cardápio ${menu.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4 border rounded-xl bg-slate-50">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <MenuIcon className="h-10 w-10 text-[#E5324B]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Nenhum cardápio encontrado</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Você ainda não possui nenhum cardápio. Crie seu primeiro cardápio para começar.
              </p>
              <Button
                onClick={handleCreateMenuClick}
                disabled={!canCreateMenu()}
                className="bg-[#E5324B] hover:bg-[#d02a41]"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Criar Meu Primeiro Cardápio
              </Button>
            </div>
          )}
        </div>

        {/* Dialog to confirm deletion */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Excluir cardápio</DialogTitle>
              <DialogDescription>
                <p className="mb-2">Tem certeza que deseja excluir o cardápio &quot;{selectedMenu?.name}&quot;?</p>
                <p className="text-red-500 font-medium">Esta ação é irreversível e não poderá ser desfeita.</p>
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="sm:justify-between">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteMenu} className="bg-[#E5324B] hover:bg-[#d02a41]">
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ErrorBoundary>
  )
}
