/**
 * Configuração do Supabase
 *
 * Este arquivo centraliza as configurações do Supabase para facilitar
 * o gerenciamento e evitar duplicação de código.
 */
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",

  // Verifica se as credenciais estão configuradas
  isConfigured: () => {
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!hasUrl || !hasKey) {
      console.warn(`Supabase ${!hasUrl ? "URL" : "API Key"} não configurado.`)
      return false
    }

    return true
  },
}
