"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MenuService } from "@/lib/services/menu-service"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

export default function ConnectionTest() {
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)

  const testConnection = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const connected = await MenuService.testConnection()
      setIsConnected(connected)

      if (!connected) {
        setError("Não foi possível conectar ao Supabase. Verifique as credenciais e a conexão com a internet.")
      }
    } catch (err) {
      setIsConnected(false)
      setError(err instanceof Error ? err.message : "Erro desconhecido ao testar conexão")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Testar conexão automaticamente ao montar o componente
    testConnection()
  }, [])

  return (
    <div className="p-4 border rounded-lg bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Status da Conexão</h3>
        <Button variant="outline" size="sm" onClick={testConnection} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testando...
            </>
          ) : (
            "Testar Novamente"
          )}
        </Button>
      </div>

      {isConnected === null && !error ? (
        <div className="flex items-center text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Verificando conexão...
        </div>
      ) : isConnected ? (
        <div className="flex items-center text-green-600">
          <CheckCircle className="mr-2 h-5 w-5" />
          Conectado ao Supabase com sucesso
        </div>
      ) : (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Erro de Conexão</AlertTitle>
          <AlertDescription>
            {error || "Não foi possível conectar ao Supabase. Verifique as credenciais e a conexão com a internet."}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
