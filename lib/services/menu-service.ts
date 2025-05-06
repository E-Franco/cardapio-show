import { createClient } from "@/lib/supabase/client"
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase/config"

export type TitlePosition = "banner" | "below" | "hidden"
export type ProductType = "product" | "image"

export interface Product {
  id: string
  name: string
  description?: string | null
  price?: number | null
  imageUrl?: string | null
  externalLink?: string | null
  menuId: string
  orderIndex: number
  type?: ProductType
}

export interface Menu {
  id: string
  name: string
  bannerColor?: string | null
  bannerImage?: string | null
  bannerLink?: string | null
  showLinkButton?: boolean
  backgroundColor?: string | null
  textColor?: string | null
  titlePosition?: TitlePosition
  fontFamily?: string | null
  bodyBackgroundColor?: string | null
  userId: string
  createdAt?: string
}

export interface SocialMedia {
  id?: string
  menuId: string
  instagram?: string | null
  facebook?: string | null
  twitter?: string | null
}

export const MenuService = {
  // Função para criar um novo cardápio
  async createMenu(menu: Omit<Menu, "id" | "createdAt">): Promise<Menu> {
    try {
      // Verificar se temos as variáveis de ambiente necessárias
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        throw new Error("Supabase configuration is missing. Check your environment variables.")
      }

      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
      const { data, error } = await supabase.from("menus").insert(menu).select().single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error creating menu:", error)
      throw error
    }
  },

  // Função para obter um cardápio pelo ID
  async getMenu(id: string): Promise<Menu> {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
      const { data, error } = await supabase.from("menus").select("*").eq("id", id).single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error getting menu:", error)
      throw error
    }
  },

  // Função para atualizar um cardápio
  async updateMenu(id: string, menu: Partial<Menu>): Promise<Menu> {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
      const { data, error } = await supabase.from("menus").update(menu).eq("id", id).select().single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error updating menu:", error)
      throw error
    }
  },

  // Função para excluir um cardápio
  async deleteMenu(id: string): Promise<void> {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
      const { error } = await supabase.from("menus").delete().eq("id", id)

      if (error) throw error
    } catch (error) {
      console.error("Error deleting menu:", error)
      throw error
    }
  },

  // Função para obter todos os cardápios de um usuário
  async getUserMenus(userId: string): Promise<Menu[]> {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
      const { data, error } = await supabase
        .from("menus")
        .select("*")
        .eq("userId", userId)
        .order("createdAt", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error getting user menus:", error)
      throw error
    }
  },

  // Função para adicionar um produto ao cardápio
  async addProduct(product: Omit<Product, "id">): Promise<Product> {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
      const { data, error } = await supabase.from("products").insert(product).select().single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error adding product:", error)
      throw error
    }
  },

  // Função para adicionar uma imagem avulsa ao cardápio
  async addImage(image: { imageUrl: string; menuId: string; orderIndex: number }): Promise<Product> {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
      const product = {
        name: "Imagem",
        imageUrl: image.imageUrl,
        menuId: image.menuId,
        orderIndex: image.orderIndex,
        type: "image" as ProductType,
      }

      const { data, error } = await supabase.from("products").insert(product).select().single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error adding image:", error)
      throw error
    }
  },

  // Função para atualizar um produto
  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
      const { data, error } = await supabase.from("products").update(product).eq("id", id).select().single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error updating product:", error)
      throw error
    }
  },

  // Função para excluir um produto
  async deleteProduct(id: string): Promise<void> {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
      const { error } = await supabase.from("products").delete().eq("id", id)

      if (error) throw error
    } catch (error) {
      console.error("Error deleting product:", error)
      throw error
    }
  },

  // Função para obter todos os produtos de um cardápio
  async getMenuProducts(menuId: string): Promise<Product[]> {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("menuId", menuId)
        .order("orderIndex", { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error getting menu products:", error)
      throw error
    }
  },

  // Função para adicionar ou atualizar as redes sociais de um cardápio
  async upsertSocialMedia(socialMedia: SocialMedia): Promise<SocialMedia> {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

      // Verificar se já existe registro para este menuId
      const { data: existingData } = await supabase
        .from("social_media")
        .select("id")
        .eq("menuId", socialMedia.menuId)
        .maybeSingle()

      if (existingData?.id) {
        // Atualizar registro existente
        const { data, error } = await supabase
          .from("social_media")
          .update({
            instagram: socialMedia.instagram,
            facebook: socialMedia.facebook,
            twitter: socialMedia.twitter,
          })
          .eq("id", existingData.id)
          .select()
          .single()

        if (error) throw error
        return data
      } else {
        // Criar novo registro
        const { data, error } = await supabase.from("social_media").insert(socialMedia).select().single()

        if (error) throw error
        return data
      }
    } catch (error) {
      console.error("Error upserting social media:", error)
      throw error
    }
  },

  // Função para obter as redes sociais de um cardápio
  async getMenuSocialMedia(menuId: string): Promise<SocialMedia | null> {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
      const { data, error } = await supabase.from("social_media").select("*").eq("menuId", menuId).maybeSingle()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error getting menu social media:", error)
      throw error
    }
  },

  // Função para obter todos os cardápios (para admin)
  async getAllMenus(page = 1, limit = 10, search?: string): Promise<{ menus: any[]; count: number }> {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
      const offset = (page - 1) * limit

      let query = supabase.from("menus").select("*, users!inner(email, name)", { count: "exact" })

      // Adicionar filtro de busca se fornecido
      if (search) {
        query = query.or(`name.ilike.%${search}%,users.email.ilike.%${search}%,users.name.ilike.%${search}%`)
      }

      const { data, error, count } = await query
        .order("createdAt", { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return { menus: data || [], count: count || 0 }
    } catch (error) {
      console.error("Error getting all menus:", error)
      throw error
    }
  },
}
