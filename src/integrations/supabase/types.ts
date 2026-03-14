export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      keys: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          key: string
          type: string
          used: boolean | null
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          key: string
          type: string
          used?: boolean | null
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          key?: string
          type?: string
          used?: boolean | null
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean | null
          category: string | null
          commission: string | null
          created_at: string | null
          created_by: string | null
          id: string
          image_url: string | null
          name: string
          price_text: string | null
          rating: number | null
          receita_est: string | null
          score_viral: number | null
          tiktok_url: string | null
          vendidos: number | null
        }
        Insert: {
          active?: boolean | null
          category?: string | null
          commission?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_url?: string | null
          name: string
          price_text?: string | null
          rating?: number | null
          receita_est?: string | null
          score_viral?: number | null
          tiktok_url?: string | null
          vendidos?: number | null
        }
        Update: {
          active?: boolean | null
          category?: string | null
          commission?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price_text?: string | null
          rating?: number | null
          receita_est?: string | null
          score_viral?: number | null
          tiktok_url?: string | null
          vendidos?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          access_until: string | null
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          name: string | null
          plan: string
          user_id: string
        }
        Insert: {
          access_until?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id?: string
          name?: string | null
          plan?: string
          user_id: string
        }
        Update: {
          access_until?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          plan?: string
          user_id?: string
        }
        Relationships: []
      }
      user_prompts: {
        Row: {
          avatar_name: string | null
          created_at: string | null
          hashtags: string[] | null
          id: string
          product_name: string | null
          prompt: string
          title: string | null
          type: string | null
          user_id: string
        }
        Insert: {
          avatar_name?: string | null
          created_at?: string | null
          hashtags?: string[] | null
          id?: string
          product_name?: string | null
          prompt: string
          title?: string | null
          type?: string | null
          user_id: string
        }
        Update: {
          avatar_name?: string | null
          created_at?: string | null
          hashtags?: string[] | null
          id?: string
          product_name?: string | null
          prompt?: string
          title?: string | null
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          activated_at: string | null
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          key_used: string | null
          name: string
          password: string
          plan_type: string
        }
        Insert: {
          activated_at?: string | null
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          key_used?: string | null
          name: string
          password: string
          plan_type: string
        }
        Update: {
          activated_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          key_used?: string | null
          name?: string
          password?: string
          plan_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_key_used_fkey"
            columns: ["key_used"]
            isOneToOne: false
            referencedRelation: "keys"
            referencedColumns: ["key"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_update_profile: {
        Args: {
          p_access_until: string
          p_admin_id: string
          p_plan: string
          p_user_id: string
        }
        Returns: boolean
      }
      login_user: {
        Args: { p_email: string; p_password_hash: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
