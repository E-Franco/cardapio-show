"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConnectionTest } from "@/components/connection-test"
import { MenuServiceTest } from "@/components/menu-service-test"
import { SupabaseDiagnostics } from "@/components/supabase-diagnostics"

export default function DiagnosticoPage() {
  const [activeTab, setActiveTab] = useState("connection")

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Diagnóstico do Sistema</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="connection">Conexão</TabsTrigger>
          <TabsTrigger value="supabase">Supabase</TabsTrigger>
          <TabsTrigger value="menu-service">Menu Service</TabsTrigger>
        </TabsList>

        <TabsContent value="connection" className="py-4">
          <ConnectionTest />
        </TabsContent>

        <TabsContent value="supabase" className="py-4">
          <SupabaseDiagnostics />
        </TabsContent>

        <TabsContent value="menu-service" className="py-4">
          <MenuServiceTest />
        </TabsContent>
      </Tabs>
    </div>
  )
}
