"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { createSupabaseClient } from "@/lib/supabase/client"
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase/config"

export function SupabaseDiagnostics() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<{
    configCheck: boolean | null
    clientCheck: boolean | null
    connectionCheck: boolean | null
    tablesCheck: { [key: string]: boolean | null }
    error?: string
  }>({
    configCheck: null,
    clientCheck: null,
    connectionCheck: null,
    tablesCheck: {
      menus: null,
      products: null,
      social_media: null,
    },
  })

  const runDiagnostics = async () => {
    setIsLoading(true)
    setResults({
      configCheck: null,
      clientCheck: null,
      connectionCheck: null,
      tablesCheck: {
        menus: null,
        products: null,
        social_media: null,
      },
    })

    try {
      // Verificar configuração
      const configCheck = !!(SUPABASE_URL && SUPABASE_ANON_KEY)
      setResults((prev) => ({ ...prev, configCheck }))

      if (!configCheck) {
        throw new Error("Configuração do Supabase incompleta")
      }

      // Criar cliente
      const supabase = createSupabaseClient()
      const clientCheck = !!supabase
      setResults((prev) => ({ ...prev, clientCheck }))

      if (!clientCheck || !supabase) {
        throw new Error("Não foi possível criar o cliente Supabase")
      }

      // Verificar conexão
      try {
        const { error } = await supabase.from("menus").select("count").limit(1)
        const connectionCheck = !error
        setResults((prev) => ({ ...prev, connectionCheck }))

        if (error) {
          throw error
        }
      } catch (error) {
        setResults((prev) => ({ ...prev, connectionCheck: false }))
        throw error
      }

      // Verificar tabelas
      const tables = ["menus", "products", "social_media"]
      const tablesCheck: { [key: string]: boolean | null } = {}

      for (const table of tables) {
        try {
          const { error } = await supabase.from(table).select("count").limit(1)
          tablesCheck[table] = !error
        } catch (error) {
          tablesCheck[table] = false
        }
      }

      setResults((prev) => ({ ...prev, tablesCheck }))
    } catch (error) {
      console.error("Erro durante diagnóstico:", error)
      setResults((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : String(error),
      }))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Diagnóstico do Supabase</CardTitle>
        <CardDescription>Verifique a conexão com o Supabase e as tabelas necessárias</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span>Configuração</span>
            {results.configCheck === null ? (
              <span className="text-muted-foreground">Não verificado</span>
            ) : results.configCheck ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
          </div>

          <div className="flex items-center justify-between">
            <span>Cliente Supabase</span>
            {results.clientCheck === null ? (
              <span className="text-muted-foreground">Não verificado</span>
            ) : results.clientCheck ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
          </div>

          <div className="flex items-center justify-between">
            <span>Conexão</span>
            {results.connectionCheck === null ? (
              <span className="text-muted-foreground">Não verificado</span>
            ) : results.connectionCheck ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
          </div>

          <div className="pt-2">
            <h4 className="text-sm font-medium mb-2">Tabelas</h4>
            {Object.entries(results.tablesCheck).map(([table, status]) => (
              <div key={table} className="flex items-center justify-between pl-4">
                <span>{table}</span>
                {status === null ? (
                  <span className="text-muted-foreground">Não verificado</span>
                ) : status ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            ))}
          </div>

          {results.error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md flex items-start gap-2">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{results.error}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={runDiagnostics} disabled={isLoading} className="w-full bg-[#E5324B] hover:bg-[#d02a41]">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verificando...
            </>
          ) : (
            "Executar Diagnóstico"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
