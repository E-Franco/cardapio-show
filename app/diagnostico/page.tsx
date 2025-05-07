"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth-provider"
import ConnectionTest from "@/components/connection-test"
import MenuServiceTest from "@/components/menu-service-test"
import { SUPABASE_URL } from "@/lib/supabase/config"

export default function DiagnosticoPage() {
  const { user } = useAuth()
  const [showEnvVars, setShowEnvVars] = useState(false)

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold text-[#E5324B] mb-2">Diagnóstico do Sistema</h1>
          <p className="text-muted-foreground">
            Esta página permite verificar o funcionamento do sistema e identificar possíveis problemas.
          </p>
        </div>

        <Tabs defaultValue="connection">
          <TabsList>
            <TabsTrigger value="connection">Conexão</TabsTrigger>
            <TabsTrigger value="tests">Testes</TabsTrigger>
            <TabsTrigger value="config">Configuração</TabsTrigger>
          </TabsList>

          <TabsContent value="connection" className="mt-4">
            <ConnectionTest />
          </TabsContent>

          <TabsContent value="tests" className="mt-4">
            <MenuServiceTest />
          </TabsContent>

          <TabsContent value="config" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Configuração do Sistema</span>
                  <Button onClick={() => setShowEnvVars(!showEnvVars)} variant="outline" size="sm">
                    {showEnvVars ? "Ocultar Variáveis" : "Mostrar Variáveis"}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Status de Autenticação</h3>
                    {user ? (
                      <div className="bg-green-50 text-green-700 p-3 rounded-md">
                        <p className="font-medium">Usuário autenticado</p>
                        <p className="text-sm mt-1">ID: {user.id}</p>
                        <p className="text-sm">Email: {user.email}</p>
                        <p className="text-sm">Tipo: {user.isAdmin ? "Administrador" : "Usuário comum"}</p>
                      </div>
                    ) : (
                      <div className="bg-amber-50 text-amber-700 p-3 rounded-md">
                        <p>Usuário não autenticado</p>
                      </div>
                    )}
                  </div>

                  {showEnvVars && (
                    <div>
                      <h3 className="font-medium mb-2">Variáveis de Ambiente</h3>
                      <div className="bg-slate-50 p-3 rounded-md">
                        <p className="text-sm font-mono">
                          SUPABASE_URL: {SUPABASE_URL ? "✓ Definido" : "✗ Não definido"}
                        </p>
                        <p className="text-sm font-mono">
                          SUPABASE_ANON_KEY:{" "}
                          {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓ Definido" : "✗ Não definido"}
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="font-medium mb-2">Informações do Navegador</h3>
                    <div className="bg-slate-50 p-3 rounded-md">
                      <p className="text-sm">
                        User Agent: {typeof window !== "undefined" ? window.navigator.userAgent : "N/A"}
                      </p>
                      <p className="text-sm">
                        Plataforma: {typeof window !== "undefined" ? window.navigator.platform : "N/A"}
                      </p>
                      <p className="text-sm">
                        Online: {typeof window !== "undefined" && navigator.onLine ? "Sim" : "Não"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
