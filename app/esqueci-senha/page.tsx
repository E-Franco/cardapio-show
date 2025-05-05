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
import { AtSign, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react"

export default function EsqueciSenhaPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulação de envio de email - em uma aplicação real, você faria uma chamada à API
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setIsSubmitted(true)

      toast({
        title: "Email enviado",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao enviar o email. Tente novamente.",
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
            <CardTitle className="text-2xl font-bold text-center">Recuperar senha</CardTitle>
            <CardDescription className="text-center">
              {isSubmitted
                ? "Enviamos um email com instruções para redefinir sua senha."
                : "Digite seu email para receber um link de redefinição de senha."}
            </CardDescription>
          </CardHeader>

          {isSubmitted ? (
            <CardContent className="pt-4 pb-6 text-center">
              <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="mb-6 rounded-md bg-slate-50 p-4 text-sm">
                <p className="mb-2">
                  Um email foi enviado para <strong>{email}</strong> com instruções para redefinir sua senha.
                </p>
                <p>Se você não receber o email em alguns minutos, verifique sua pasta de spam ou tente novamente.</p>
              </div>
              <Button onClick={() => router.push("/login")} className="bg-[#E5324B] hover:bg-[#d02a41] text-white">
                Voltar para o login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
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

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full bg-[#E5324B] hover:bg-[#d02a41] text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent"></div>
                        <span className="ml-2">Enviando...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <span>Enviar link de redefinição</span>
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
          )}
        </Card>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} CardápioShow. Todos os direitos reservados.
        </p>
      </div>
    </div>
  )
}
