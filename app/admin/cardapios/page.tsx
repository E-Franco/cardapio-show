"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Search, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Tipos
type User = {
  id: string
  name: string
  email: string
  isAdmin: boolean
  menuQuota: number
}

type Menu = {
  id: string
  name: string
  color: string
  productCount: number
  ownerId: string
  ownerEmail?: string
  ownerName?: string
  createdAt: string
}

// Dados de exemplo
const mockUsers: User[] = [
  {
    id: "1",
    name: "Administrador",
    email: "admin@exemplo.com",
    isAdmin: true,
    menuQuota: 999,
  },
  {
    id: "2",
    name: "Usuário Teste",
    email: "usuario@exemplo.com",
    isAdmin: false,
    menuQuota: 3,
  },
  {
    id: "3",
    name: "João Silva",
    email: "joao@exemplo.com",
    isAdmin: false,
    menuQuota: 5,
  },
  {
    id: "4",
    name: "Maria Oliveira",
    email: "maria@exemplo.com",
    isAdmin: false,
    menuQuota: 2,
  },
]

const mockMenus: Menu[] = [
  {
    id: "1",
    name: "Cardápio de Verão",
    color: "#FF5722",
    productCount: 10,
    ownerId: "2",
    createdAt: "2023-05-15",
  },
  {
    id: "2",
    name: "Cardápio de Inverno",
    color: "#2196F3",
    productCount: 8,
    ownerId: "2",
    createdAt: "2023-06-20",
  },
  {
    id: "3",
    name: "Cardápio Executivo",
    color: "#4CAF50",
    productCount: 5,
    ownerId: "3",
    createdAt: "2023-07-10",
  },
  {
    id: "4",
    name: "Cardápio de Sobremesas",
    color: "#9C27B0",
    productCount: 12,
    ownerId: "1",
    createdAt: "2023-08-05",
  },
  {
    id: "5",
    name: "Menu Especial",
    color: "#FF9800",
    productCount: 7,
    ownerId: "4",
    createdAt: "2023-09-12",
  },
  {
    id: "6",
    name: "Cardápio Vegano",
    color: "#8BC34A",
    productCount: 9,
    ownerId: "3",
    createdAt: "2023-10-18",
  },
  {
    id: "7",
    name: "Cardápio Fitness",
    color: "#00BCD4",
    productCount: 6,
    ownerId: "2",
    createdAt: "2023-11-25",
  },
  {
    id: "8",
    name: "Menu Infantil",
    color: "#E91E63",
    productCount: 8,
    ownerId: "4",
    createdAt: "2023-12-30",
  },
  {
    id: "9",
    name: "Cardápio de Bebidas",
    color: "#673AB7",
    productCount: 15,
    ownerId: "3",
    createdAt: "2024-01-15",
  },
  {
    id: "10",
    name: "Cardápio de Café da Manhã",
    color: "#795548",
    productCount: 10,
    ownerId: "2",
    createdAt: "2024-02-20",
  },
  {
    id: "11",
    name: "Menu de Lanches",
    color: "#607D8B",
    productCount: 12,
    ownerId: "1",
    createdAt: "2024-03-10",
  },
  {
    id: "12",
    name: "Cardápio Premium",
    color: "#FFC107",
    productCount: 8,
    ownerId: "4",
    createdAt: "2024-04-05",
  },
]

export default function AdminCardapiosPage() {
  const { toast } = useToast()
  const [menus, setMenus] = useState<Menu[]>([])
  const [filteredMenus, setFilteredMenus] = useState<Menu[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("name")
  const [currentPage, setCurrentPage] = useState(1)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null)
  const itemsPerPage = 5

  useEffect(() => {
    // Simulação de carregamento de dados
    const loadMenus = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Adicionar informações do usuário aos cardápios
      const menusWithUserInfo = mockMenus.map((menu) => {
        const owner = mockUsers.find((user) => user.id === menu.ownerId)
        return {
          ...menu,
          ownerEmail: owner?.email || "Usuário não encontrado",
          ownerName: owner?.name || "Usuário não encontrado",
        }
      })

      setMenus(menusWithUserInfo)
      setFilteredMenus(menusWithUserInfo)
      setIsLoading(false)
    }

    loadMenus()
  }, [])

  useEffect(() => {
    // Filtrar cardápios com base no termo de pesquisa e tipo de filtro
    if (searchTerm.trim() === "") {
      setFilteredMenus(menus)
    } else {
      const lowercaseSearchTerm = searchTerm.toLowerCase()
      const filtered = menus.filter((menu) => {
        switch (filterType) {
          case "name":
            return menu.name.toLowerCase().includes(lowercaseSearchTerm)
          case "ownerEmail":
            return menu.ownerEmail?.toLowerCase().includes(lowercaseSearchTerm)
          case "ownerId":
            return menu.ownerId.includes(searchTerm)
          default:
            return true
        }
      })
      setFilteredMenus(filtered)
    }
    setCurrentPage(1) // Resetar para a primeira página ao filtrar
  }, [searchTerm, filterType, menus])

  // Paginação
  const totalPages = Math.ceil(filteredMenus.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedMenus = filteredMenus.slice(startIndex, startIndex + itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleOpenDeleteDialog = (menu: Menu) => {
    setSelectedMenu(menu)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteMenu = async () => {
    if (!selectedMenu) return

    try {
      // Simulação de exclusão
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setMenus(menus.filter((menu) => menu.id !== selectedMenu.id))
      setFilteredMenus(filteredMenus.filter((menu) => menu.id !== selectedMenu.id))

      toast({
        title: "Cardápio excluído",
        description: `O cardápio "${selectedMenu.name}" foi removido com sucesso.`,
      })

      setIsDeleteDialogOpen(false)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir o cardápio.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Todos os Cardápios</h1>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Label htmlFor="search" className="mb-2 block">
            Pesquisar
          </Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              type="text"
              placeholder="Pesquisar cardápios..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="w-full md:w-48">
          <Label htmlFor="filter-type" className="mb-2 block">
            Filtrar por
          </Label>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger id="filter-type">
              <SelectValue placeholder="Filtrar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nome do Cardápio</SelectItem>
              <SelectItem value="ownerEmail">Email do Usuário</SelectItem>
              <SelectItem value="ownerId">ID do Usuário</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Carregando cardápios...</div>
      ) : filteredMenus.length > 0 ? (
        <>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Produtos</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMenus.map((menu) => (
                  <TableRow key={menu.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: menu.color }}></div>
                        {menu.name}
                      </div>
                    </TableCell>
                    <TableCell>{menu.productCount}</TableCell>
                    <TableCell>{menu.ownerName}</TableCell>
                    <TableCell>{menu.ownerEmail}</TableCell>
                    <TableCell>{menu.createdAt}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/preview-cardapio/${menu.id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDeleteDialog(menu)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage > 1) handlePageChange(currentPage - 1)
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }).map((_, index) => {
                  const page = index + 1
                  // Mostrar apenas páginas próximas à atual
                  if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            handlePageChange(page)
                          }}
                          isActive={page === currentPage}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  } else if (
                    (page === currentPage - 2 && currentPage > 3) ||
                    (page === currentPage + 2 && currentPage < totalPages - 2)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )
                  }
                  return null
                })}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage < totalPages) handlePageChange(currentPage + 1)
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-muted/40">
          <p className="text-muted-foreground">Nenhum cardápio encontrado com os filtros atuais.</p>
        </div>
      )}

      {/* Dialog para confirmar exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              <p className="mb-2">Tem certeza que deseja excluir o cardápio &quot;{selectedMenu?.name}&quot;?</p>
              <p className="text-destructive font-medium">Esta ação é irreversível e não poderá ser desfeita.</p>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteMenu}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
