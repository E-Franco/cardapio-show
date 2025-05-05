"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogOut, Users, FileText, Home, List, MenuIcon } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState, useCallback, useEffect } from "react"
import { createSupabaseClient } from "@/lib/supabase/client"

export function MainNav() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [menuCount, setMenuCount] = useState(0) // Initialize state here

  // Se não houver usuário, não renderiza a navegação
  if (!user) return null

  const isAdmin = user.isAdmin

  // Função para lidar com o logout
  const handleLogout = useCallback(async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }, [logout])

  // Componente de links de navegação
  const NavLinks = () => (
    <>
      {isAdmin ? (
        <>
          <Link href="/admin/usuarios">
            <Button
              variant={pathname?.includes("/admin/usuarios") ? "default" : "ghost"}
              className={pathname?.includes("/admin/usuarios") ? "bg-[#E5324B] hover:bg-[#d02a41]" : ""}
            >
              <Users className="mr-2 h-4 w-4" />
              <span>Usuários</span>
            </Button>
          </Link>
          <Link href="/admin/cardapios">
            <Button
              variant={pathname?.includes("/admin/cardapios") ? "default" : "ghost"}
              className={pathname?.includes("/admin/cardapios") ? "bg-[#E5324B] hover:bg-[#d02a41]" : ""}
            >
              <List className="mr-2 h-4 w-4" />
              <span>Todos Cardápios</span>
            </Button>
          </Link>
          <Link href="/">
            <Button
              variant={pathname === "/" ? "default" : "ghost"}
              className={pathname === "/" ? "bg-[#E5324B] hover:bg-[#d02a41]" : ""}
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>Meus Cardápios</span>
            </Button>
          </Link>
        </>
      ) : (
        <Link href="/">
          <Button
            variant={pathname === "/" ? "default" : "ghost"}
            className={pathname === "/" ? "bg-[#E5324B] hover:bg-[#d02a41]" : ""}
          >
            <Home className="mr-2 h-4 w-4" />
            <span>Meus Cardápios</span>
          </Button>
        </Link>
      )}
    </>
  )

  // Função para buscar menus do usuário
  const fetchUserMenus = async () => {
    try {
      const supabase = createSupabaseClient()
      if (!supabase || !user) return []

      const { data, error } = await supabase.from("menus").select("id").eq("user_id", user.id)

      if (error) {
        console.error("Erro ao buscar menus:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Erro ao buscar menus:", error)
      return []
    }
  }

  // Estado para armazenar a contagem de menus

  // Efeito para buscar a contagem de menus ao montar o componente
  useEffect(() => {
    const getMenuCount = async () => {
      const menus = await fetchUserMenus()
      setMenuCount(menus.length)
    }

    if (user && !isAdmin) {
      getMenuCount()
    }
  }, [user, isAdmin])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container mx-auto px-4 sm:px-6 flex h-16 items-center">
        <div className="mr-4 flex items-center">
          <Link href={isAdmin ? "/admin/usuarios" : "/"} className="flex items-center">
            <div className="h-10 w-auto relative">
              <Image
                src="/images/logo.png"
                alt="CardápioShow"
                width={180}
                height={40}
                className="object-contain"
                priority
              />
            </div>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {/* Mobile menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <MenuIcon className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] sm:w-[300px]">
                <div className="flex flex-col gap-4 py-4">
                  <Link
                    href={isAdmin ? "/admin/usuarios" : "/"}
                    className="flex items-center px-4"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="h-10 w-auto relative">
                      <Image
                        src="/images/logo.png"
                        alt="CardápioShow"
                        width={180}
                        height={40}
                        className="object-contain"
                      />
                    </div>
                  </Link>
                  <div className="flex flex-col space-y-1 px-2">
                    <NavLinks />
                  </div>
                  {/* Botão de logout para mobile */}
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="mt-4 text-[#E5324B] hover:bg-red-50 hover:text-[#E5324B] justify-start px-2"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop menu */}
          <nav className="hidden md:flex items-center space-x-2">
            <NavLinks />
          </nav>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-[#E5324B]" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {!isAdmin && (
                <DropdownMenuItem className="text-xs">
                  <div className="flex items-center gap-2 w-full">
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-[#E5324B] h-2 rounded-full"
                        style={{
                          width: `${(menuCount / user.menuQuota) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-muted-foreground whitespace-nowrap">
                      {menuCount}/{user.menuQuota}
                    </span>
                  </div>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-[#E5324B] focus:text-[#E5324B] focus:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
