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

  // Restante dos métodos...
  // (Mantendo os mesmos métodos, apenas substituindo a criação do cliente)
}
