import { createSupabaseClient } from "@/lib/supabase/client"
import { v4 as uuidv4 } from "uuid"

export class UploadService {
  /**
   * Faz upload de uma imagem para o Supabase Storage
   * @param file Arquivo a ser enviado
   * @param bucket Nome do bucket (pasta) no Storage
   * @returns URL pública da imagem
   */
  static async uploadImage(file: File, bucket = "images"): Promise<string> {
    try {
      const supabase = createSupabaseClient()
      if (!supabase) {
        throw new Error("Não foi possível criar o cliente Supabase")
      }

      // Gerar um nome único para o arquivo
      const fileExt = file.name.split(".").pop()
      const fileName = `${uuidv4()}.${fileExt}`
      const filePath = `${bucket}/${fileName}`

      // Fazer upload do arquivo
      const { data, error } = await supabase.storage.from("public").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (error) {
        console.error("Erro ao fazer upload da imagem:", error)
        throw error
      }

      // Obter a URL pública da imagem
      const { data: publicURL } = supabase.storage.from("public").getPublicUrl(filePath)

      return publicURL.publicUrl
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error)
      throw error
    }
  }

  /**
   * Exclui uma imagem do Supabase Storage
   * @param url URL pública da imagem
   * @returns true se a exclusão foi bem-sucedida
   */
  static async deleteImage(url: string): Promise<boolean> {
    try {
      const supabase = createSupabaseClient()
      if (!supabase) {
        throw new Error("Não foi possível criar o cliente Supabase")
      }

      // Extrair o caminho do arquivo da URL
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split("/")
      const filePath = pathParts.slice(pathParts.indexOf("public") + 1).join("/")

      // Excluir o arquivo
      const { error } = await supabase.storage.from("public").remove([filePath])

      if (error) {
        console.error("Erro ao excluir a imagem:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Erro ao excluir a imagem:", error)
      return false
    }
  }
}
