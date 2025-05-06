export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabaseConfig = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,

  isConfigured: () => {
    const hasUrl = !!SUPABASE_URL
    const hasKey = !!SUPABASE_ANON_KEY

    if (!hasUrl || !hasKey) {
      console.warn(`Supabase ${!hasUrl ? "URL" : "API Key"} não configurado.`)
      return false
    }

    return true
  },
}
