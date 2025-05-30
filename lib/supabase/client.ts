import { createClient } from "@supabase/supabase-js"
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config"

// Variável para armazenar a instância do cliente Supabase
let supabaseClient: ReturnType<typeof createClient> | null = null

/**
 * Cria e retorna um cliente Supabase
 *
 * Esta função implementa o padrão Singleton para evitar
 * a criação de múltiplas instâncias do cliente Supabase.
 */
export function createSupabaseClient() {
  // Verificar se as variáveis de ambiente estão definidas
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("Supabase URL or Anon Key is missing")
    return null
  }

  try {
    // Se o cliente já existe, retorná-lo
    if (supabaseClient) {
      return supabaseClient
    }

    // Criar um novo cliente
    console.log("Creating new Supabase client")
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })

    // Verificar se o cliente foi criado com sucesso
    if (!supabaseClient) {
      console.error("Failed to create Supabase client")
      return null
    }

    return supabaseClient
  } catch (error) {
    console.error("Error creating Supabase client:", error)
    return null
  }
}

/**
 * Cria um cliente Supabase para uso no lado do cliente
 *
 * Esta função deve ser usada apenas em componentes do lado do cliente.
 */
export function createClientSupabaseClient() {
  // Verificar se estamos no lado do cliente
  if (typeof window === "undefined") {
    console.error("createClientSupabaseClient should only be used on the client side")
    return null
  }

  return createSupabaseClient()
}
