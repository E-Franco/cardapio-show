import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/database.types"
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase/config"

export interface Menu {
  id: string
  name: string
  bannerColor?: string
  bannerImage?: string
  bannerLink?: string
  showLinkButton?: boolean
  backgroundColor?: string
  textColor?: string
  titlePosition?: TitlePosition
  fontFamily?: string
  bodyBackgroundColor?: string
  userId: string
  createdAt?: string
}

export interface Product {
  id: string
  name: string
  description?: string | null
  price?: number | null
  imageUrl?: string | null
  externalLink?: string | null
  menuId: string
  orderIndex: number
  type: "product" | "image"
}

export interface SocialMedia {
  menuId: string
  instagram?: string | null
  facebook?: string | null
  twitter?: string | null
}

export type TitlePosition = "banner" | "below" | "hidden"

export class MenuService {
  private static getSupabaseClient() {
    // Verificar se as credenciais estão disponíveis
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error("Credenciais do Supabase não configuradas")
      throw new Error("supabaseUrl is required")
    }

    // Criar cliente Supabase
    return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
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
          type: product.type,
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
        type: data.type as "product" | "image",
      }
    } catch (error) {
      console.error("Error adding product:", error)
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
        description: data.description,
        price: data.price,
        imageUrl: data.image_url,
        externalLink: data.external_link,
        menuId: data.menu_id,
        orderIndex: data.order_index,
        type: data.type as "product" | "image",
      }
    } catch (error) {
      console.error("Error adding image:", error)
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
        type: data.type as "product" | "image",
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
        type: product.type as "product" | "image",
      }))
    } catch (error) {
      console.error("Error getting menu products:", error)
      throw error
    }
  }

  static async getMenuSocialMedia(menuId: string): Promise<SocialMedia | null> {
    try {
      const supabase = this.getSupabaseClient()

      const { data, error } = await supabase.from("social_media").select("*").eq("menu_id", menuId).maybeSingle()

      if (error) {
        console.error("Error getting menu social media:", error)
        throw error
      }

      if (!data) {
        return null
      }

      return {
        menuId: data.menu_id,
        instagram: data.instagram,
        facebook: data.facebook,
        twitter: data.twitter,
      }
    } catch (error) {
      console.error("Error getting menu social media:", error)
      throw error
    }
  }

  static async upsertSocialMedia(socialMedia: SocialMedia): Promise<SocialMedia> {
    try {
      const supabase = this.getSupabaseClient()

      // Verificar se já existe
      const { data: existingData } = await supabase
        .from("social_media")
        .select("*")
        .eq("menu_id", socialMedia.menuId)
        .maybeSingle()

      let result

      if (existingData) {
        // Update
        const { data, error } = await supabase
          .from("social_media")
          .update({
            instagram: socialMedia.instagram,
            facebook: socialMedia.facebook,
            twitter: socialMedia.twitter,
          })
          .eq("menu_id", socialMedia.menuId)
          .select()
          .single()

        if (error) {
          console.error("Error updating social media:", error)
          throw error
        }

        result = data
      } else {
        // Insert
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
        menuId: result.menu_id,
        instagram: result.instagram,
        facebook: result.facebook,
        twitter: result.twitter,
      }
    } catch (error) {
      console.error("Error upserting social media:", error)
      throw error
    }
  }
}
