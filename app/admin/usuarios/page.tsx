"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Pencil, Trash2, Users, Search, UserPlus, UserCog } from "lucide-react"

type User = {
  id: string
  name: string
  email: string
  isAdmin: boolean
  menuQuota: number
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

// Dados de exemplo para cardápios
const mockMenus = [
  {
    id: "1",
    name: "Cardápio de Verão",
    color: "#FF5722",
    productCount: 10,
    ownerId: "2",
  },
  {
    id: "2",
    name: "Cardápio de Inverno",
    color: "#2196F3",
    productCount: 8,
    ownerId: "2",
  },
  {
    id: "3",
    name: "Cardápio Executivo",
    color: "#4CAF50",
    productCount: 5,
    ownerId: "3",
  },
  {
    id: "4",
    name: "Cardápio de Sobremesas",
    color: "#9C27B0",
    productCount: 12,
    ownerId: "1",
  },
]

export default function UsuariosPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [menuCounts, setMenuCounts] = useState<Record<string, number>>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    isAdmin: false,
    menuQuota: 3,
  })

  useEffect(() => {
    // Simulação de carregamento de dados
    const loadUsers = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Contar cardápios por usuário
      const counts: Record<string, number> = {}
      mockMenus.forEach((menu) => {
        counts[menu.ownerId] = (counts[menu.ownerId] || 0) + 1
      })

      setMenuCounts(counts)
      setUsers(mockUsers)
      setFilteredUsers(mockUsers)
      setIsLoading(false)
    }

    loadUsers()
  }, [])

  // Filtrar usuários quando o termo de pesquisa mudar
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users)
    } else {
      const lowercaseSearchTerm = searchTerm.toLowerCase()
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(lowercaseSearchTerm) ||
          user.email.toLowerCase().includes(lowercaseSearchTerm),
      )
      setFilteredUsers(filtered)
    }
  }, [searchTerm, users])

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setSelectedUser(user)
      setFormData({
        name: user.name,
        email: user.email,
        password: "",
        isAdmin: user.isAdmin,
        menuQuota: user.menuQuota,
      })
    } else {
      setSelectedUser(null)
      setFormData({
        name: "",
        email: "",
        password: "",
        isAdmin: false,
        menuQuota: 3,
      })
    }

    setIsDialogOpen(true)
  }

  const handleOpenDeleteDialog = (user: User) => {
    setSelectedUser(user)
    setIsDeleteDialogOpen(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target

    setFormData({
      ...formData,
      [name]: type === "number" ? Number.parseInt(value) : value,
    })
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData({
      ...formData,
      isAdmin: checked,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Simulação de salvamento
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (selectedUser) {
        // Atualizar usuário existente
        setUsers(
          users.map((user) =>
            user.id === selectedUser.id
              ? {
                  ...user,
                  name: formData.name,
                  email: formData.email,
                  isAdmin: formData.isAdmin,
                  menuQuota: formData.menuQuota,
                }
              : user,
          ),
        )

        toast({
          title: "Usuário atualizado",
          description: `As informações de ${formData.name} foram atualizadas com sucesso.`,
        })
      } else {
        // Criar novo usuário
        const newUser: User = {
          id: Date.now().toString(),
          name: formData.name,
          email: formData.email,
          isAdmin: formData.isAdmin,
          menuQuota: formData.menuQuota,
        }

        setUsers([...users, newUser])

        toast({
          title: "Usuário criado",
          description: `${formData.name} foi adicionado com sucesso.`,
        })
      }

      setIsDialogOpen(false)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar as informações do usuário.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!selectedUser) return

    try {
      // Simulação de exclusão
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Em uma aplicação real, você excluiria os cardápios do usuário aqui
      const userMenuCount = menuCounts[selectedUser.id] || 0

      setUsers(users.filter((user) => user.id !== selectedUser.id))

      toast({
        title: "Usuário excluído",
        description: `${selectedUser.name} foi removido com sucesso${
          userMenuCount > 0 ? `, junto com ${userMenuCount} cardápio(s)` : ""
        }.`,
      })

      setIsDeleteDialogOpen(false)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir o usuário.",
        variant: "destructive",
      })
    }
  }

  // Função para criar um cabeçalho de seção
  const SectionHeader = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
    <div className="flex items-center gap-3 mb-5">
      <div className="h-8 w-8 rounded-full bg-red-50 flex items-center justify-center text-[#E5324B]">{icon}</div>
      <h2 className="text-xl font-semibold">{title}</h2>
    </div>
  )

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#E5324B]">Gerenciamento de Usuários</h1>
          <p className="text-muted-foreground text-sm">Gerencie os usuários do sistema e suas permissões</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-[#E5324B] hover:bg-[#d02a41] w-full md:w-auto">
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <SectionHeader icon={<Users className="h-4 w-4" />} title="Usuários do Sistema" />

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 border-4 border-t-[#E5324B] border-r-transparent border-b-[#E5324B] border-l-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-muted-foreground">Carregando usuários...</p>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Limite de Cardápios</TableHead>
                    <TableHead>Cardápios Criados</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div
                            className={`w-2 h-2 rounded-full mr-2 ${user.isAdmin ? "bg-[#E5324B]" : "bg-slate-400"}`}
                          ></div>
                          {user.isAdmin ? "Administrador" : "Usuário"}
                        </div>
                      </TableCell>
                      <TableCell>{user.isAdmin ? "Ilimitado" : user.menuQuota}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-2">
                            <div
                              className="bg-[#E5324B] h-2 rounded-full"
                              style={{
                                width: user.isAdmin
                                  ? "100%"
                                  : `${Math.min(100, ((menuCounts[user.id] || 0) / user.menuQuota) * 100)}%`,
                              }}
                            ></div>
                          </div>
                          <span>{menuCounts[user.id] || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleOpenDialog(user)}
                            className="h-8 w-8 text-slate-600 hover:text-[#E5324B] hover:border-[#E5324B]"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleOpenDeleteDialog(user)}
                            className="h-8 w-8 text-[#E5324B] hover:bg-red-50 hover:border-[#E5324B]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-slate-50">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-[#E5324B]" />
                </div>
                <h4 className="font-medium mb-2">Nenhum usuário encontrado</h4>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "Tente usar termos diferentes na busca." : "Adicione um novo usuário para começar."}
                </p>
                {!searchTerm && (
                  <Button onClick={() => handleOpenDialog()} className="bg-[#E5324B] hover:bg-[#d02a41]">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Adicionar Usuário
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para criar/editar usuário */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedUser ? (
                <>
                  <UserCog className="h-5 w-5 text-[#E5324B]" />
                  Editar Usuário
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5 text-[#E5324B]" />
                  Novo Usuário
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedUser
                ? "Edite as informações do usuário abaixo."
                : "Preencha os campos para criar um novo usuário."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {!selectedUser && (
                <div className="grid gap-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!selectedUser}
                  />
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="menuQuota">Limite de Cardápios</Label>
                <Input
                  id="menuQuota"
                  name="menuQuota"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.menuQuota}
                  onChange={handleInputChange}
                  disabled={formData.isAdmin}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="isAdmin" checked={formData.isAdmin} onCheckedChange={handleSwitchChange} />
                <Label htmlFor="isAdmin">Usuário Administrador</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#E5324B] hover:bg-[#d02a41]">
                {selectedUser ? "Salvar Alterações" : "Criar Usuário"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para confirmar exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-[#E5324B]" />
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription>
              <p className="mb-2">Tem certeza que deseja excluir o usuário {selectedUser?.name}?</p>
              {menuCounts[selectedUser?.id || ""] > 0 && (
                <p className="mb-2 font-medium">
                  Este usuário possui {menuCounts[selectedUser?.id || ""]} cardápio(s) que também serão excluídos.
                </p>
              )}
              <p className="text-[#E5324B] font-medium">Esta ação é irreversível e não poderá ser desfeita.</p>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="bg-[#E5324B] hover:bg-[#d02a41] border-none"
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
