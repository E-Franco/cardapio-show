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
import { Lock, ArrowRight, CheckCircle, AlertTriangle } from "lucide-react"

export default function RedefinirSenhaPage({ params }: { params: { token: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { token } = params

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Simulação de redefinição de senha - em uma aplicação real, você faria uma chamada à API
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Verificar se o token é válido
      if (token === "invalid") {
        toast({
          title: "Token inválido",
          description: "O link de redefinição de senha é inválido ou expirou.",
          variant: "destructive",
        })
        return
      }

      setIsSubmitted(true)

      toast({
        title: "Senha redefinida",
        description: "Sua senha foi redefinida com sucesso.",
      })

      // Redirecionar para a página de login após alguns segundos
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao redefinir sua senha. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Verificar se o token é válido
  if (token === "invalid") {
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
            <CardContent className="pt-6 pb-6 text-center">
              <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <CardTitle className="mb-2 text-xl">Link inválido</CardTitle>
              <CardDescription className="mb-6">O link de redefinição de senha é inválido ou expirou.</CardDescription>
              <Button
                onClick={() => router.push("/esqueci-senha")}
                className="bg-[#E5324B] hover:bg-[#d02a41] text-white"
              >
                Solicitar novo link
              </Button>
            </CardContent>
          </Card>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} CardápioShow. Todos os direitos reservados.
          </p>
        </div>
      </div>
    )
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
            <CardTitle className="text-2xl font-bold text-center">Redefinir senha</CardTitle>
            <CardDescription className="text-center">
              {isSubmitted ? "Sua senha foi redefinida com sucesso." : "Digite sua nova senha abaixo."}
            </CardDescription>
          </CardHeader>

          {isSubmitted ? (
            <CardContent className="pt-4 pb-6 text-center">
              <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="mb-6 rounded-md bg-slate-50 p-4 text-sm">
                <p>
                  Sua senha foi redefinida com sucesso. Você será redirecionado para a página de login em alguns
                  segundos.
                </p>
              </div>
              <Button onClick={() => router.push("/login")} className="bg-[#E5324B] hover:bg-[#d02a41] text-white">
                Ir para o login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Nova senha
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
                    Confirmar nova senha
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
                        <span className="ml-2">Redefinindo...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <span>Redefinir senha</span>
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col border-t pt-6">
                <div className="flex items-center justify-center">
                  <Link href="/login" className="flex items-center text-sm text-[#E5324B] hover:underline">
                    Voltar para o login
                  </Link>
                </div>
              </CardFooter>
            </form>
          )}
        </Card>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} CardápioShow. Todos os direitos reservados.
        </p>
      </div>
    </div>
  )
}
