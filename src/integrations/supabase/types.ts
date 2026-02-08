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
      audit_results: {
        Row: {
          ascensao_score: number
          autonomia_comunidade: string
          autonomia_score: number
          base_size: string
          base_value: number
          comunicacao_multiplier: number
          created_at: string
          email: string
          frequencia_comunicacao: string
          id: string
          identidade_comunidade: string
          identidade_score: number
          is_beginner: boolean
          kosmos_asset_score: number
          lucro_oculto: number
          num_ofertas: string
          oferta_ascensao: string
          ofertas_multiplier: number
          razao_compra: string
          razao_compra_score: number
          recorrencia: string
          recorrencia_score: number
          rituais_jornada: string
          rituais_score: number
          score_causa: number
          score_cultura: number
          score_economia: number
          ticket_medio: string
          ticket_value: number
        }
        Insert: {
          ascensao_score: number
          autonomia_comunidade: string
          autonomia_score: number
          base_size: string
          base_value: number
          comunicacao_multiplier: number
          created_at?: string
          email: string
          frequencia_comunicacao: string
          id?: string
          identidade_comunidade: string
          identidade_score: number
          is_beginner?: boolean
          kosmos_asset_score: number
          lucro_oculto: number
          num_ofertas: string
          oferta_ascensao: string
          ofertas_multiplier: number
          razao_compra: string
          razao_compra_score: number
          recorrencia: string
          recorrencia_score: number
          rituais_jornada: string
          rituais_score: number
          score_causa: number
          score_cultura: number
          score_economia: number
          ticket_medio: string
          ticket_value: number
        }
        Update: {
          ascensao_score?: number
          autonomia_comunidade?: string
          autonomia_score?: number
          base_size?: string
          base_value?: number
          comunicacao_multiplier?: number
          created_at?: string
          email?: string
          frequencia_comunicacao?: string
          id?: string
          identidade_comunidade?: string
          identidade_score?: number
          is_beginner?: boolean
          kosmos_asset_score?: number
          lucro_oculto?: number
          num_ofertas?: string
          oferta_ascensao?: string
          ofertas_multiplier?: number
          razao_compra?: string
          razao_compra_score?: number
          recorrencia?: string
          recorrencia_score?: number
          rituais_jornada?: string
          rituais_score?: number
          score_causa?: number
          score_cultura?: number
          score_economia?: number
          ticket_medio?: string
          ticket_value?: number
        }
        Relationships: []
      }
      contacts: {
        Row: {
          id: string
          email: string
          phone: string | null
          full_name: string | null
          profile_id: string | null
          source: Database["public"]["Enums"]["contact_source"]
          source_detail: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          phone?: string | null
          full_name?: string | null
          profile_id?: string | null
          source?: Database["public"]["Enums"]["contact_source"]
          source_detail?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          phone?: string | null
          full_name?: string | null
          profile_id?: string | null
          source?: Database["public"]["Enums"]["contact_source"]
          source_detail?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      contact_orgs: {
        Row: {
          id: string
          contact_id: string
          organization_id: string
          journey_stage_id: string | null
          score: number | null
          score_breakdown: Json
          owner_id: string | null
          status: Database["public"]["Enums"]["contact_org_status"]
          notes: string | null
          custom_fields: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          contact_id: string
          organization_id: string
          journey_stage_id?: string | null
          score?: number | null
          score_breakdown?: Json
          owner_id?: string | null
          status?: Database["public"]["Enums"]["contact_org_status"]
          notes?: string | null
          custom_fields?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          contact_id?: string
          organization_id?: string
          journey_stage_id?: string | null
          score?: number | null
          score_breakdown?: Json
          owner_id?: string | null
          status?: Database["public"]["Enums"]["contact_org_status"]
          notes?: string | null
          custom_fields?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_orgs_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_orgs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_orgs_journey_stage_id_fkey"
            columns: ["journey_stage_id"]
            isOneToOne: false
            referencedRelation: "journey_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_orgs_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      journey_stages: {
        Row: {
          id: string
          organization_id: string
          name: string
          display_name: string
          description: string | null
          position: number
          color: string
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          display_name: string
          description?: string | null
          position?: number
          color?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          display_name?: string
          description?: string | null
          position?: number
          color?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "journey_stages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      organizations: {
        Row: {
          id: string
          slug: string
          name: string
          type: Database["public"]["Enums"]["org_type"]
          status: Database["public"]["Enums"]["org_status"]
          settings: Json
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          type?: Database["public"]["Enums"]["org_type"]
          status?: Database["public"]["Enums"]["org_status"]
          settings?: Json
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          type?: Database["public"]["Enums"]["org_type"]
          status?: Database["public"]["Enums"]["org_status"]
          settings?: Json
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      org_members: {
        Row: {
          id: string
          organization_id: string
          profile_id: string
          role: Database["public"]["Enums"]["org_role"]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          profile_id: string
          role?: Database["public"]["Enums"]["org_role"]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          profile_id?: string
          role?: Database["public"]["Enums"]["org_role"]
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      audit_results_enriched: {
        Row: {
          id: string
          email: string
          base_size: string
          base_value: number
          ticket_medio: string
          ticket_value: number
          num_ofertas: string
          ofertas_multiplier: number
          frequencia_comunicacao: string
          comunicacao_multiplier: number
          razao_compra: string
          razao_compra_score: number
          identidade_comunidade: string
          identidade_score: number
          autonomia_comunidade: string
          autonomia_score: number
          rituais_jornada: string
          rituais_score: number
          oferta_ascensao: string
          ascensao_score: number
          recorrencia: string
          recorrencia_score: number
          score_causa: number
          score_cultura: number
          score_economia: number
          kosmos_asset_score: number
          lucro_oculto: number
          is_beginner: boolean
          created_at: string
          contact_id: string | null
          contact_org_id: string | null
          journey_stage_id: string | null
          journey_stage_name: string | null
          journey_stage_display_name: string | null
        }
      }
    }
    Functions: {
      get_user_org_ids: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      is_org_member: {
        Args: { org_id: string }
        Returns: boolean
      }
      is_kosmos_master: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      has_org_role: {
        Args: { org_id: string; required_role: Database["public"]["Enums"]["org_role"] }
        Returns: boolean
      }
      get_current_profile_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      upsert_contact_with_org: {
        Args: {
          p_email: string
          p_full_name?: string | null
          p_phone?: string | null
          p_source?: Database["public"]["Enums"]["contact_source"]
          p_source_detail?: Json
          p_organization_id?: string
          p_score?: number | null
          p_score_breakdown?: Json
        }
        Returns: string
      }
      get_contact_stats: {
        Args: { p_organization_id?: string }
        Returns: {
          total_contacts: number
          contacts_this_month: number
          contacts_this_week: number
          avg_score: number
          by_stage: Json
        }[]
      }
    }
    Enums: {
      org_type: "master" | "client" | "community"
      org_status: "active" | "suspended" | "churned"
      org_role: "owner" | "admin" | "member" | "viewer"
      contact_source: "kosmos_score" | "landing_page" | "manual" | "import" | "referral"
      contact_org_status: "active" | "archived" | "unsubscribed"
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
    Enums: {
      org_type: ["master", "client", "community"] as const,
      org_status: ["active", "suspended", "churned"] as const,
      org_role: ["owner", "admin", "member", "viewer"] as const,
      contact_source: ["kosmos_score", "landing_page", "manual", "import", "referral"] as const,
      contact_org_status: ["active", "archived", "unsubscribed"] as const,
    },
  },
} as const

// Convenience type aliases
export type Organization = Tables<"organizations">
export type Profile = Tables<"profiles">
export type OrgMember = Tables<"org_members">
export type Contact = Tables<"contacts">
export type ContactOrg = Tables<"contact_orgs">
export type JourneyStage = Tables<"journey_stages">
export type AuditResult = Tables<"audit_results">

// Insert types
export type OrganizationInsert = TablesInsert<"organizations">
export type ProfileInsert = TablesInsert<"profiles">
export type OrgMemberInsert = TablesInsert<"org_members">
export type ContactInsert = TablesInsert<"contacts">
export type ContactOrgInsert = TablesInsert<"contact_orgs">
export type JourneyStageInsert = TablesInsert<"journey_stages">

// Update types
export type OrganizationUpdate = TablesUpdate<"organizations">
export type ProfileUpdate = TablesUpdate<"profiles">
export type OrgMemberUpdate = TablesUpdate<"org_members">
export type ContactUpdate = TablesUpdate<"contacts">
export type ContactOrgUpdate = TablesUpdate<"contact_orgs">
export type JourneyStageUpdate = TablesUpdate<"journey_stages">

// Enum types
export type OrgType = Database["public"]["Enums"]["org_type"]
export type OrgStatus = Database["public"]["Enums"]["org_status"]
export type OrgRole = Database["public"]["Enums"]["org_role"]
export type ContactSource = Database["public"]["Enums"]["contact_source"]
export type ContactOrgStatus = Database["public"]["Enums"]["contact_org_status"]

// KOSMOS Master Org ID constant
export const KOSMOS_ORG_ID = "c0000000-0000-0000-0000-000000000001"
