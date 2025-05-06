import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config"

// Variável para armazenar a instância única do cliente
let supabaseClient: ReturnType<typeof createClient<Database>> | null = null

/**
 * Cria ou retorna uma instância existente do cliente Supabase
 * Implementa o padrão singleton para evitar múltiplas instâncias
 */
export function createSupabaseClient() {
  // Se já temos uma instância, retorna ela
  if (supabaseClient) {
    return supabaseClient
  }

  // Verifica se as variáveis de ambiente estão definidas
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("Credenciais do Supabase não configuradas")
    return null
  }

  // Cria uma nova instância
  supabaseClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
  return supabaseClient
}
