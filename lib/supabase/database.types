export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          is_admin: boolean
          menu_quota: number
          created_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          is_admin?: boolean
          menu_quota?: number
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          is_admin?: boolean
          menu_quota?: number
          created_at?: string
        }
      }
      menus: {
        Row: {
          id: string
          name: string
          banner_color: string
          banner_image: string | null
          banner_link: string | null
          show_link_button: boolean
          background_color: string | null
          text_color: string | null
          title_position: string | null
          font_family: string | null
          body_background_color: string | null
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          banner_color: string
          banner_image?: string | null
          banner_link?: string | null
          show_link_button?: boolean
          background_color?: string | null
          text_color?: string | null
          title_position?: string | null
          font_family?: string | null
          body_background_color?: string | null
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          banner_color?: string
          banner_image?: string | null
          banner_link?: string | null
          show_link_button?: boolean
          background_color?: string | null
          text_color?: string | null
          title_position?: string | null
          font_family?: string | null
          body_background_color?: string | null
          user_id?: string
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          image_url: string
          external_link: string | null
          menu_id: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          image_url: string
          external_link?: string | null
          menu_id: string
          order_index: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          image_url?: string
          external_link?: string | null
          menu_id?: string
          order_index?: number
          created_at?: string
        }
      }
      social_media: {
        Row: {
          id: string
          menu_id: string
          instagram: string | null
          facebook: string | null
          twitter: string | null
          created_at: string
        }
        Insert: {
          id?: string
          menu_id: string
          instagram?: string | null
          facebook?: string | null
          twitter?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          menu_id?: string
          instagram?: string | null
          facebook?: string | null
          twitter?: string | null
          created_at?: string
        }
      }
    }
  }
}
