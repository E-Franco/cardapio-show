import { createClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase/config"

export class UploadService {
  // Nome do bucket no Supabase Storage - deve ser criado previamente pelo administrador
  private static BUCKET_NAME = "images" // Bucket padrão que deve existir

  // Verifica se podemos usar o Supabase ou se devemos usar URLs locais
  private static async canUseSupabase() {
    try {
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.warn("Credenciais do Supabase não configuradas")
        return false
      }

      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

      // Verificar se o usuário está autenticado
      const { data: sessionData, error } = await supabase.auth.getSession()
      if (error) {
        console.error("Erro ao verificar sessão:", error)
        return false
      }

      if (!sessionData.session) {
        console.warn("Usuário não autenticado")
        return false
      }

      // Verificar se o bucket existe fazendo uma operação de lista
      try {
        const { data, error } = await supabase.storage.from(this.BUCKET_NAME).list("")
        if (error) {
          console.error("Erro ao verificar bucket:", error)
          return false
        }
        // Se chegou aqui, o bucket existe e podemos acessá-lo
        return true
      } catch (e) {
        console.error("Erro ao verificar acesso ao bucket:", e)
        return false
      }
    } catch (error) {
      console.error("Erro ao verificar Supabase:", error)
      return false
    }
  }

  static async uploadImage(file: File, folder: string): Promise<string> {
    try {
      // Primeiro, verificamos se podemos usar o Supabase
      const canUseSupabase = await this.canUseSupabase()

      if (!canUseSupabase) {
        console.log("Não é possível usar o Supabase, utilizando URL local")
        return URL.createObjectURL(file)
      }

      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

      // Gerar nome de arquivo único
      const fileExt = file.name.split(".").pop() || "jpg"
      const fileName = `${uuidv4()}.${fileExt}`
      const filePath = `${folder}/${fileName}`

      console.log(`Iniciando upload para ${this.BUCKET_NAME}/${filePath}`)

      // Tentar fazer o upload
      const { data, error } = await supabase.storage.from(this.BUCKET_NAME).upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      })

      if (error) {
        console.error("Erro ao fazer upload:", error)
        // Se houver qualquer erro, usamos URL local como fallback
        return URL.createObjectURL(file)
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage.from(this.BUCKET_NAME).getPublicUrl(filePath)
      console.log("Upload bem-sucedido, URL:", urlData.publicUrl)

      // Verificar se a URL foi gerada corretamente
      if (!urlData.publicUrl) {
        console.error("URL pública não gerada")
        return URL.createObjectURL(file)
      }

      return urlData.publicUrl
    } catch (error) {
      console.error("Erro inesperado no upload:", error)
      // Fallback para URL de objeto local em caso de erro
      return URL.createObjectURL(file)
    }
  }

  static async deleteImage(url: string): Promise<void> {
    // Se for URL blob local, apenas revoga
    if (url.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(url)
        console.log("URL blob revogada com sucesso")
      } catch (error) {
        console.error("Erro ao revogar URL blob:", error)
      }
      return
    }

    try {
      // Verificar se podemos usar o Supabase
      const canUseSupabase = await this.canUseSupabase()
      if (!canUseSupabase) {
        console.warn("Não é possível usar o Supabase para excluir a imagem")
        return
      }

      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

      // Verificar se a URL é do Supabase
      if (!url.includes(this.BUCKET_NAME)) {
        console.warn("URL não parece ser do Supabase Storage, ignorando exclusão:", url)
        return
      }

      // Extrair o caminho do arquivo da URL pública
      let filePath = null

      // Tenta extrair o caminho usando várias estratégias
      if (url.includes(`/${this.BUCKET_NAME}/`)) {
        filePath = url.split(`/${this.BUCKET_NAME}/`)[1]
      } else {
        // Tenta extrair usando uma expressão regular para encontrar o caminho
        const match = url.match(/\/([^/]+\/[^/]+)$/)
        if (match && match[1]) {
          filePath = match[1]
        }
      }

      if (!filePath) {
        console.warn("Não foi possível extrair o caminho do arquivo da URL:", url)
        return
      }

      console.log(`Tentando excluir arquivo: ${filePath}`)
      const { error } = await supabase.storage.from(this.BUCKET_NAME).remove([filePath])

      if (error) {
        console.error("Erro ao excluir imagem:", error)
      } else {
        console.log("Imagem excluída com sucesso")
      }
    } catch (error) {
      console.error("Erro inesperado na exclusão:", error)
    }
  }
}
