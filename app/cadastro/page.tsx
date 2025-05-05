"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { AtSign, User, Lock, ArrowRight, ArrowLeft } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

export default function CadastroPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { signup } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({
        title: "Erro de validação",
        description: "As senhas não coincidem.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const { error } = await signup(email, password, name)

      if (error) {
        toast({
          title: "Erro ao criar conta",
          description: error.message || "Ocorreu um erro ao tentar criar sua conta. Tente novamente.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Cadastro realizado com sucesso",
        description: "Sua conta foi criada. Você já pode fazer login.",
      })

      router.push("/login")
    } catch (error) {
      toast({
        title: "Erro ao criar conta",
        description: "Ocorreu um erro ao tentar criar sua conta. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Image
            src="/images/logo.png"
            alt="CardápioShow"
            width={240}
            height={60}
            className="object-contain"
            priority
          />
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center">Criar uma conta</CardTitle>
            <CardDescription className="text-center">Preencha os campos abaixo para se cadastrar</CardDescription>
          </CardHeader>
          <form onSubmit={handleRegister}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nome completo
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-sm font-medium">
                  Confirmar Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full bg-[#E5324B] hover:bg-[#d02a41] text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent"></div>
                      <span className="ml-2">Criando conta...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span>Criar conta</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col border-t pt-6">
              <div className="flex items-center justify-center">
                <Link href="/login" className="flex items-center text-sm text-[#E5324B] hover:underline">
                  <ArrowLeft className="mr-1 h-3 w-3" />
                  Voltar para o login
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} CardápioShow. Todos os direitos reservados.
        </p>
      </div>
    </div>
  )
}
