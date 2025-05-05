import { createClient } from "@supabase/supabase-js"
import { supabaseConfig } from "./config"
import type { Database } from "./database.types"

// Exportação direta do createClient para compatibilidade
export { createClient }

/**
 * Cliente Supabase singleton
 *
 * Implementa o padrão singleton para evitar múltiplas instâncias
 * do cliente Supabase, otimizando o uso de recursos.
 */
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null

/**
 * Obtém uma instância do cliente Supabase para uso no navegador
 *
 * @returns Cliente Supabase ou null se não configurado
 */
export function getSupabaseBrowser() {
  // Não executar no servidor
  if (typeof window === "undefined") return null

  try {
    // Retornar instância existente se disponível
    if (supabaseInstance) return supabaseInstance

    // Verificar se as variáveis de ambiente estão disponíveis
    if (!supabaseConfig.isConfigured()) {
      return null
    }

    // Criar nova instância
    supabaseInstance = createClient<Database>(supabaseConfig.url, supabaseConfig.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })

    return supabaseInstance
  } catch (error) {
    console.error("Erro ao criar cliente Supabase:", error)
    return null
  }
}

/**
 * Cria um novo cliente Supabase
 *
 * Útil quando precisamos de uma instância separada do cliente,
 * por exemplo, em contextos específicos ou para testes.
 *
 * @returns Cliente Supabase ou null se não configurado
 */
export function createSupabaseClient() {
  if (!supabaseConfig.isConfigured()) return null

  try {
    return createClient<Database>(supabaseConfig.url, supabaseConfig.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  } catch (error) {
    console.error("Erro ao criar cliente Supabase:", error)
    return null
  }
}
