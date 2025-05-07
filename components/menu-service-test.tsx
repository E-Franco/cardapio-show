"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MenuService } from "@/lib/services/menu-service"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"

export default function MenuServiceTest() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<
    {
      method: string
      success: boolean
      message: string
      data?: any
    }[]
  >([])

  const runTests = async () => {
    if (!user) {
      setResults([
        {
          method: "Auth Check",
          success: false,
          message: "Usuário não autenticado. Faça login para executar os testes.",
        },
      ])
      return
    }

    setIsLoading(true)
    setResults([])
    const testResults = []

    // Teste 1: Verificar conexão
    try {
      const connected = await MenuService.testConnection()
      testResults.push({
        method: "testConnection",
        success: connected,
        message: connected ? "Conexão com Supabase estabelecida com sucesso" : "Falha ao conectar com Supabase",
      })
    } catch (error) {
      testResults.push({
        method: "testConnection",
        success: false,
        message: error instanceof Error ? error.message : "Erro desconhecido",
      })
    }

    // Teste 2: Obter cardápios do usuário
    try {
      const menus = await MenuService.getUserMenus(user.id)
      testResults.push({
        method: "getUserMenus",
        success: true,
        message: `Obtidos ${menus.length} cardápios do usuário`,
        data: { count: menus.length },
      })
    } catch (error) {
      testResults.push({
        method: "getUserMenus",
        success: false,
        message: error instanceof Error ? error.message : "Erro desconhecido",
      })
    }

    // Teste 3: Criar um cardápio de teste
    let testMenuId = ""
    try {
      const testMenu = await MenuService.createMenu({
        name: `Teste ${new Date().toISOString()}`,
        bannerColor: "#ff0000",
        backgroundColor: "#ffffff",
        textColor: "#000000",
        titlePosition: "banner",
        fontFamily: "Poppins",
        bodyBackgroundColor: "#f5f5f5",
        userId: user.id,
      })

      testMenuId = testMenu.id
      testResults.push({
        method: "createMenu",
        success: true,
        message: `Cardápio de teste criado com ID: ${testMenu.id}`,
        data: { id: testMenu.id },
      })
    } catch (error) {
      testResults.push({
        method: "createMenu",
        success: false,
        message: error instanceof Error ? error.message : "Erro desconhecido",
      })
    }

    // Teste 4: Obter cardápio público
    if (testMenuId) {
      try {
        const publicMenu = await MenuService.getPublicMenu(testMenuId)
        testResults.push({
          method: "getPublicMenu",
          success: !!publicMenu.menu,
          message: publicMenu.menu
            ? `Cardápio público obtido com sucesso: ${publicMenu.menu.name}`
            : "Falha ao obter cardápio público",
        })
      } catch (error) {
        testResults.push({
          method: "getPublicMenu",
          success: false,
          message: error instanceof Error ? error.message : "Erro desconhecido",
        })
      }
    }

    // Teste 5: Adicionar redes sociais
    if (testMenuId) {
      try {
        const socialMedia = await MenuService.upsertSocialMedia({
          menuId: testMenuId,
          instagram: "teste_instagram",
          facebook: "teste_facebook",
          twitter: "teste_twitter",
        })

        testResults.push({
          method: "upsertSocialMedia",
          success: true,
          message: "Redes sociais adicionadas com sucesso",
          data: { id: socialMedia.id },
        })
      } catch (error) {
        testResults.push({
          method: "upsertSocialMedia",
          success: false,
          message: error instanceof Error ? error.message : "Erro desconhecido",
        })
      }
    }

    // Teste 6: Obter redes sociais
    if (testMenuId) {
      try {
        const socialMedia = await MenuService.getMenuSocialMedia(testMenuId)
        testResults.push({
          method: "getMenuSocialMedia",
          success: !!socialMedia,
          message: socialMedia ? "Redes sociais obtidas com sucesso" : "Falha ao obter redes sociais",
        })
      } catch (error) {
        testResults.push({
          method: "getMenuSocialMedia",
          success: false,
          message: error instanceof Error ? error.message : "Erro desconhecido",
        })
      }
    }

    // Teste 7: Excluir cardápio de teste
    if (testMenuId) {
      try {
        await MenuService.deleteMenu(testMenuId)
        testResults.push({
          method: "deleteMenu",
          success: true,
          message: "Cardápio de teste excluído com sucesso",
        })
      } catch (error) {
        testResults.push({
          method: "deleteMenu",
          success: false,
          message: error instanceof Error ? error.message : "Erro desconhecido",
        })
      }
    }

    setResults(testResults)
    setIsLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Testes do MenuService</span>
          <Button onClick={runTests} disabled={isLoading} variant="outline" size="sm">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Executando...
              </>
            ) : (
              "Executar Testes"
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {results.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Clique em "Executar Testes" para verificar o funcionamento do MenuService
          </p>
        ) : (
          <div className="space-y-4">
            {results.map((result, index) => (
              <Alert key={index} variant={result.success ? "default" : "destructive"}>
                <div className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>{result.method}</AlertTitle>
                </div>
                <AlertDescription className="mt-1">
                  {result.message}
                  {result.data && (
                    <pre className="mt-2 text-xs bg-slate-100 p-2 rounded">{JSON.stringify(result.data, null, 2)}</pre>
                  )}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
