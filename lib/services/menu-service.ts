// Vamos corrigir apenas o método getPublicMenu que está faltando
import { createSupabaseClient } from "@/lib/supabase/client"

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

export class MenuService {
  private static getSupabaseClient() {
    const supabase = createSupabaseClient()
    if (!supabase) {
      throw new Error("Não foi possível criar o cliente Supabase. Verifique as variáveis de ambiente.")
    }
    return supabase
  }

  static async createMenu(menu: Omit<Menu, "id" | "createdAt">): Promise<Menu> {
    try {
      const supabase = this.getSupabaseClient()

      const { data, error } = await supabase
        .from("menus")
        .insert({
          name: menu.name,
          banner_color: menu.bannerColor,
          banner_image: menu.bannerImage,
          banner_link: menu.bannerLink,
          show_link_button: menu.showLinkButton,
          background_color: menu.backgroundColor,
          text_color: menu.textColor,
          title_position: menu.titlePosition,
          font_family: menu.fontFamily,
          body_background_color: menu.bodyBackgroundColor,
          user_id: menu.userId,
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating menu:", error)
        throw error
      }

      return {
        id: data.id,
        name: data.name,
        bannerColor: data.banner_color || undefined,
        bannerImage: data.banner_image || undefined,
        bannerLink: data.banner_link || undefined,
        showLinkButton: data.show_link_button,
        backgroundColor: data.background_color || undefined,
        textColor: data.text_color || undefined,
        titlePosition: (data.title_position as TitlePosition) || "banner",
        fontFamily: data.font_family || undefined,
        bodyBackgroundColor: data.body_background_color || undefined,
        userId: data.user_id,
        createdAt: data.created_at,
      }
    } catch (error) {
      console.error("Error creating menu:", error)
      throw error
    }
  }

  static async getMenu(id: string): Promise<Menu> {
    try {
      const supabase = this.getSupabaseClient()

      const { data, error } = await supabase.from("menus").select("*").eq("id", id).single()

      if (error) {
        console.error("Error getting menu:", error)
        throw error
      }

      return {
        id: data.id,
        name: data.name,
        bannerColor: data.banner_color || undefined,
        bannerImage: data.banner_image || undefined,
        bannerLink: data.banner_link || undefined,
        showLinkButton: data.show_link_button,
        backgroundColor: data.background_color || undefined,
        textColor: data.text_color || undefined,
        titlePosition: (data.title_position as TitlePosition) || "banner",
        fontFamily: data.font_family || undefined,
        bodyBackgroundColor: data.body_background_color || undefined,
        userId: data.user_id,
        createdAt: data.created_at,
      }
    } catch (error) {
      console.error("Error getting menu:", error)
      throw error
    }
  }

  static async updateMenu(id: string, menu: Partial<Menu>): Promise<Menu> {
    try {
      const supabase = this.getSupabaseClient()

      const { data, error } = await supabase
        .from("menus")
        .update({
          name: menu.name,
          banner_color: menu.bannerColor,
          banner_image: menu.bannerImage,
          banner_link: menu.bannerLink,
          show_link_button: menu.showLinkButton,
          background_color: menu.backgroundColor,
          text_color: menu.textColor,
          title_position: menu.titlePosition,
          font_family: menu.fontFamily,
          body_background_color: menu.bodyBackgroundColor,
          user_id: menu.userId,
        })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error("Error updating menu:", error)
        throw error
      }

      return {
        id: data.id,
        name: data.name,
        bannerColor: data.banner_color || undefined,
        bannerImage: data.banner_image || undefined,
        bannerLink: data.banner_link || undefined,
        showLinkButton: data.show_link_button,
        backgroundColor: data.background_color || undefined,
        textColor: data.text_color || undefined,
        titlePosition: (data.title_position as TitlePosition) || "banner",
        fontFamily: data.font_family || undefined,
        bodyBackgroundColor: data.body_background_color || undefined,
        userId: data.user_id,
        createdAt: data.created_at,
      }
    } catch (error) {
      console.error("Error updating menu:", error)
      throw error
    }
  }

  static async deleteMenu(id: string): Promise<void> {
    try {
      const supabase = this.getSupabaseClient()

      const { error } = await supabase.from("menus").delete().eq("id", id)

      if (error) {
        console.error("Error deleting menu:", error)
        throw error
      }
    } catch (error) {
      console.error("Error deleting menu:", error)
      throw error
    }
  }

  static async getUserMenus(userId: string): Promise<Menu[]> {
    try {
      console.log("Getting user menus for user:", userId)
      const supabase = this.getSupabaseClient()

      const { data, error } = await supabase
        .from("menus")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error getting user menus:", error)
        throw error
      }

      return data.map((menu) => ({
        id: menu.id,
        name: menu.name,
        bannerColor: menu.banner_color || undefined,
        bannerImage: menu.banner_image || undefined,
        bannerLink: menu.banner_link || undefined,
        showLinkButton: menu.show_link_button,
        backgroundColor: menu.background_color || undefined,
        textColor: menu.text_color || undefined,
        titlePosition: (menu.title_position as TitlePosition) || "banner",
        fontFamily: menu.font_family || undefined,
        bodyBackgroundColor: menu.body_background_color || undefined,
        userId: menu.user_id,
        createdAt: menu.created_at,
      }))
    } catch (error) {
      console.error("Error getting user menus:", error)
      throw error
    }
  }

  static async getAllMenus(): Promise<Menu[]> {
    try {
      const supabase = this.getSupabaseClient()

      const { data, error } = await supabase.from("menus").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error getting all menus:", error)
        throw error
      }

      return data.map((menu) => ({
        id: menu.id,
        name: menu.name,
        bannerColor: menu.banner_color || undefined,
        bannerImage: menu.banner_image || undefined,
        bannerLink: menu.banner_link || undefined,
        showLinkButton: menu.show_link_button,
        backgroundColor: menu.background_color || undefined,
        textColor: menu.text_color || undefined,
        titlePosition: (menu.title_position as TitlePosition) || "banner",
        fontFamily: menu.font_family || undefined,
        bodyBackgroundColor: menu.body_background_color || undefined,
        userId: menu.user_id,
        createdAt: menu.created_at,
      }))
    } catch (error) {
      console.error("Error getting all menus:", error)
      throw error
    }
  }

  static async upsertSocialMedia(socialMedia: SocialMedia): Promise<SocialMedia> {
    try {
      const supabase = this.getSupabaseClient()

      // Verificar se já existe um registro para este menuId
      const { data: existingData, error: fetchError } = await supabase
        .from("social_media")
        .select("*")
        .eq("menu_id", socialMedia.menuId)
        .maybeSingle()

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error fetching social media:", fetchError)
        throw fetchError
      }

      let result

      if (existingData) {
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

        if (error) {
          console.error("Error updating social media:", error)
          throw error
        }

        result = data
      } else {
        // Inserir novo registro
        const { data, error } = await supabase
          .from("social_media")
          .insert({
            menu_id: socialMedia.menuId,
            instagram: socialMedia.instagram,
            facebook: socialMedia.facebook,
            twitter: socialMedia.twitter,
          })
          .select()
          .single()

        if (error) {
          console.error("Error inserting social media:", error)
          throw error
        }

        result = data
      }

      return {
        id: result.id,
        menuId: result.menu_id,
        instagram: result.instagram || undefined,
        facebook: result.facebook || undefined,
        twitter: result.twitter || undefined,
      }
    } catch (error) {
      console.error("Error upserting social media:", error)
      throw error
    }
  }

  static async getMenuSocialMedia(menuId: string): Promise<SocialMedia | null> {
    try {
      const supabase = this.getSupabaseClient()

      const { data, error } = await supabase.from("social_media").select("*").eq("menu_id", menuId).maybeSingle()

      if (error && error.code !== "PGRST116") {
        console.error("Error getting menu social media:", error)
        throw error
      }

      if (!data) {
        return null
      }

      return {
        id: data.id,
        menuId: data.menu_id,
        instagram: data.instagram || undefined,
        facebook: data.facebook || undefined,
        twitter: data.twitter || undefined,
      }
    } catch (error) {
      console.error("Error getting menu social media:", error)
      throw error
    }
  }

  static async getMenuProducts(menuId: string): Promise<Product[]> {
    try {
      const supabase = this.getSupabaseClient()

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("menu_id", menuId)
        .order("order_index", { ascending: true })

      if (error) {
        console.error("Error getting menu products:", error)
        throw error
      }

      return data.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.image_url,
        externalLink: product.external_link,
        menuId: product.menu_id,
        orderIndex: product.order_index,
        type: product.type || "product",
      }))
    } catch (error) {
      console.error("Error getting menu products:", error)
      throw error
    }
  }

  static async addProduct(product: Omit<Product, "id">): Promise<Product> {
    try {
      const supabase = this.getSupabaseClient()

      const { data, error } = await supabase
        .from("products")
        .insert({
          name: product.name,
          description: product.description,
          price: product.price,
          image_url: product.imageUrl,
          external_link: product.externalLink,
          menu_id: product.menuId,
          order_index: product.orderIndex,
          type: product.type || "product",
        })
        .select()
        .single()

      if (error) {
        console.error("Error adding product:", error)
        throw error
      }

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        price: data.price,
        imageUrl: data.image_url,
        externalLink: data.external_link,
        menuId: data.menu_id,
        orderIndex: data.order_index,
        type: data.type || "product",
      }
    } catch (error) {
      console.error("Error adding product:", error)
      throw error
    }
  }

  static async updateProduct(
    id: string,
    product: Partial<Omit<Product, "id" | "menuId" | "orderIndex">>,
  ): Promise<Product> {
    try {
      const supabase = this.getSupabaseClient()

      const { data, error } = await supabase
        .from("products")
        .update({
          name: product.name,
          description: product.description,
          price: product.price,
          image_url: product.imageUrl,
          external_link: product.externalLink,
          type: product.type,
        })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error("Error updating product:", error)
        throw error
      }

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        price: data.price,
        imageUrl: data.image_url,
        externalLink: data.external_link,
        menuId: data.menu_id,
        orderIndex: data.order_index,
        type: data.type || "product",
      }
    } catch (error) {
      console.error("Error updating product:", error)
      throw error
    }
  }

  static async deleteProduct(id: string): Promise<void> {
    try {
      const supabase = this.getSupabaseClient()

      const { error } = await supabase.from("products").delete().eq("id", id)

      if (error) {
        console.error("Error deleting product:", error)
        throw error
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      throw error
    }
  }

  static async addImage(image: { imageUrl: string; menuId: string; orderIndex: number }): Promise<Product> {
    try {
      const supabase = this.getSupabaseClient()

      const { data, error } = await supabase
        .from("products")
        .insert({
          name: "Imagem",
          image_url: image.imageUrl,
          menu_id: image.menuId,
          order_index: image.orderIndex,
          type: "image",
        })
        .select()
        .single()

      if (error) {
        console.error("Error adding image:", error)
        throw error
      }

      return {
        id: data.id,
        name: data.name,
        imageUrl: data.image_url,
        menuId: data.menu_id,
        orderIndex: data.order_index,
        type: "image",
      }
    } catch (error) {
      console.error("Error adding image:", error)
      throw error
    }
  }

  // Método getPublicMenu corrigido
  static async getPublicMenu(
    id: string,
  ): Promise<{ menu: Menu | null; products: Product[]; socialMedia: SocialMedia | null }> {
    try {
      const supabase = this.getSupabaseClient()

      // Buscar o menu
      const { data: menuData, error: menuError } = await supabase.from("menus").select("*").eq("id", id).maybeSingle()

      if (menuError) {
        console.error("Error getting public menu:", menuError)
        throw menuError
      }

      if (!menuData) {
        console.log("Menu not found:", id)
        return { menu: null, products: [], socialMedia: null }
      }

      // Converter dados do menu
      const menu: Menu = {
        id: menuData.id,
        name: menuData.name,
        bannerColor: menuData.banner_color || undefined,
        bannerImage: menuData.banner_image || undefined,
        bannerLink: menuData.banner_link || undefined,
        showLinkButton: menuData.show_link_button !== false, // Default to true if undefined
        backgroundColor: menuData.background_color || undefined,
        textColor: menuData.text_color || undefined,
        titlePosition: (menuData.title_position as TitlePosition) || "banner",
        fontFamily: menuData.font_family || undefined,
        bodyBackgroundColor: menuData.body_background_color || undefined,
        userId: menuData.user_id,
        createdAt: menuData.created_at,
      }

      // Buscar produtos
      let products: Product[] = []
      try {
        products = await this.getMenuProducts(id)
      } catch (error) {
        console.error("Error getting menu products for public menu:", error)
        // Não lançar erro, apenas retornar array vazio
      }

      // Buscar redes sociais
      let socialMedia: SocialMedia | null = null
      try {
        socialMedia = await this.getMenuSocialMedia(id)
      } catch (error) {
        console.error("Error getting social media for public menu:", error)
        // Não lançar erro, apenas retornar null
      }

      return { menu, products, socialMedia }
    } catch (error) {
      console.error("Error getting public menu:", error)
      throw error
    }
  }
}
