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
      activities: {
        Row: {
          actor_id: string | null
          contact_org_id: string
          created_at: string
          description: string | null
          id: string
          metadata: Json
          reference_id: string | null
          reference_type: string | null
          title: string
          type: string
        }
        Insert: {
          actor_id?: string | null
          contact_org_id: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json
          reference_id?: string | null
          reference_type?: string | null
          title: string
          type: string
        }
        Update: {
          actor_id?: string | null
          contact_org_id?: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json
          reference_id?: string | null
          reference_type?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_contact_org_id_fkey"
            columns: ["contact_org_id"]
            isOneToOne: false
            referencedRelation: "audit_results_enriched"
            referencedColumns: ["contact_org_id"]
          },
          {
            foreignKeyName: "activities_contact_org_id_fkey"
            columns: ["contact_org_id"]
            isOneToOne: false
            referencedRelation: "contact_orgs"
            referencedColumns: ["id"]
          },
        ]
      }
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
      contact_orgs: {
        Row: {
          contact_id: string
          created_at: string
          custom_fields: Json
          id: string
          journey_stage_id: string | null
          notes: string | null
          organization_id: string
          owner_id: string | null
          score: number | null
          score_breakdown: Json
          status: Database["public"]["Enums"]["contact_org_status"]
          updated_at: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          custom_fields?: Json
          id?: string
          journey_stage_id?: string | null
          notes?: string | null
          organization_id: string
          owner_id?: string | null
          score?: number | null
          score_breakdown?: Json
          status?: Database["public"]["Enums"]["contact_org_status"]
          updated_at?: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          custom_fields?: Json
          id?: string
          journey_stage_id?: string | null
          notes?: string | null
          organization_id?: string
          owner_id?: string | null
          score?: number | null
          score_breakdown?: Json
          status?: Database["public"]["Enums"]["contact_org_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_orgs_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "audit_results_enriched"
            referencedColumns: ["contact_id"]
          },
          {
            foreignKeyName: "contact_orgs_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
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
            foreignKeyName: "contact_orgs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_orgs_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_tags: {
        Row: {
          added_at: string
          added_by: string | null
          contact_org_id: string
          tag_id: string
        }
        Insert: {
          added_at?: string
          added_by?: string | null
          contact_org_id: string
          tag_id: string
        }
        Update: {
          added_at?: string
          added_by?: string | null
          contact_org_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_tags_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_tags_contact_org_id_fkey"
            columns: ["contact_org_id"]
            isOneToOne: false
            referencedRelation: "audit_results_enriched"
            referencedColumns: ["contact_org_id"]
          },
          {
            foreignKeyName: "contact_tags_contact_org_id_fkey"
            columns: ["contact_org_id"]
            isOneToOne: false
            referencedRelation: "contact_orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          profile_id: string | null
          source: Database["public"]["Enums"]["contact_source"]
          source_detail: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          phone?: string | null
          profile_id?: string | null
          source?: Database["public"]["Enums"]["contact_source"]
          source_detail?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          profile_id?: string | null
          source?: Database["public"]["Enums"]["contact_source"]
          source_detail?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      form_blocks: {
        Row: {
          created_at: string
          description: string | null
          form_id: string
          id: string
          name: string
          position: number
          show_title: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          form_id: string
          id?: string
          name: string
          position?: number
          show_title?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          form_id?: string
          id?: string
          name?: string
          position?: number
          show_title?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_blocks_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      form_classifications: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          emoji: string | null
          form_id: string
          id: string
          max_score: number
          message: string | null
          min_score: number
          name: string
          position: number
          slug: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          emoji?: string | null
          form_id: string
          id?: string
          max_score: number
          message?: string | null
          min_score: number
          name: string
          position?: number
          slug: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          emoji?: string | null
          form_id?: string
          id?: string
          max_score?: number
          message?: string | null
          min_score?: number
          name?: string
          position?: number
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_classifications_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      form_fields: {
        Row: {
          block_id: string | null
          conditions: Json | null
          created_at: string
          file_config: Json | null
          form_id: string
          help_text: string | null
          id: string
          key: string
          label: string
          options: Json | null
          pillar: string | null
          placeholder: string | null
          position: number
          required: boolean
          scale_config: Json | null
          scoring_weight: number | null
          type: string
          updated_at: string
          validation: Json | null
        }
        Insert: {
          block_id?: string | null
          conditions?: Json | null
          created_at?: string
          file_config?: Json | null
          form_id: string
          help_text?: string | null
          id?: string
          key: string
          label: string
          options?: Json | null
          pillar?: string | null
          placeholder?: string | null
          position?: number
          required?: boolean
          scale_config?: Json | null
          scoring_weight?: number | null
          type: string
          updated_at?: string
          validation?: Json | null
        }
        Update: {
          block_id?: string | null
          conditions?: Json | null
          created_at?: string
          file_config?: Json | null
          form_id?: string
          help_text?: string | null
          id?: string
          key?: string
          label?: string
          options?: Json | null
          pillar?: string | null
          placeholder?: string | null
          position?: number
          required?: boolean
          scale_config?: Json | null
          scoring_weight?: number | null
          type?: string
          updated_at?: string
          validation?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "form_fields_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "form_blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_fields_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submissions: {
        Row: {
          answers: Json
          classification_id: string | null
          completed_at: string | null
          computed_data: Json | null
          contact_id: string | null
          contact_org_id: string | null
          created_at: string
          current_field_key: string | null
          form_id: string
          id: string
          last_answered_at: string | null
          metadata: Json | null
          pillar_scores: Json | null
          progress_percentage: number | null
          respondent_email: string | null
          respondent_id: string | null
          score: number | null
          started_at: string
          status: string
          time_spent_seconds: number | null
          updated_at: string
        }
        Insert: {
          answers?: Json
          classification_id?: string | null
          completed_at?: string | null
          computed_data?: Json | null
          contact_id?: string | null
          contact_org_id?: string | null
          created_at?: string
          current_field_key?: string | null
          form_id: string
          id?: string
          last_answered_at?: string | null
          metadata?: Json | null
          pillar_scores?: Json | null
          progress_percentage?: number | null
          respondent_email?: string | null
          respondent_id?: string | null
          score?: number | null
          started_at?: string
          status?: string
          time_spent_seconds?: number | null
          updated_at?: string
        }
        Update: {
          answers?: Json
          classification_id?: string | null
          completed_at?: string | null
          computed_data?: Json | null
          contact_id?: string | null
          contact_org_id?: string | null
          created_at?: string
          current_field_key?: string | null
          form_id?: string
          id?: string
          last_answered_at?: string | null
          metadata?: Json | null
          pillar_scores?: Json | null
          progress_percentage?: number | null
          respondent_email?: string | null
          respondent_id?: string | null
          score?: number | null
          started_at?: string
          status?: string
          time_spent_seconds?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_classification_id_fkey"
            columns: ["classification_id"]
            isOneToOne: false
            referencedRelation: "form_classifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "audit_results_enriched"
            referencedColumns: ["contact_id"]
          },
          {
            foreignKeyName: "form_submissions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_contact_org_id_fkey"
            columns: ["contact_org_id"]
            isOneToOne: false
            referencedRelation: "audit_results_enriched"
            referencedColumns: ["contact_org_id"]
          },
          {
            foreignKeyName: "form_submissions_contact_org_id_fkey"
            columns: ["contact_org_id"]
            isOneToOne: false
            referencedRelation: "contact_orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      forms: {
        Row: {
          created_at: string
          created_by: string | null
          crm_config: Json | null
          description: string | null
          id: string
          name: string
          organization_id: string
          published_at: string | null
          scoring_config: Json | null
          scoring_enabled: boolean
          settings: Json
          slug: string
          status: string
          thank_you_screen: Json | null
          theme: Json
          updated_at: string
          welcome_screen: Json | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          crm_config?: Json | null
          description?: string | null
          id?: string
          name: string
          organization_id: string
          published_at?: string | null
          scoring_config?: Json | null
          scoring_enabled?: boolean
          settings?: Json
          slug: string
          status?: string
          thank_you_screen?: Json | null
          theme?: Json
          updated_at?: string
          welcome_screen?: Json | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          crm_config?: Json | null
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          published_at?: string | null
          scoring_config?: Json | null
          scoring_enabled?: boolean
          settings?: Json
          slug?: string
          status?: string
          thank_you_screen?: Json | null
          theme?: Json
          updated_at?: string
          welcome_screen?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "forms_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forms_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_actions: {
        Row: {
          created_at: string | null
          description: string | null
          due_date: string | null
          effort: number | null
          id: string
          impact: number | null
          owner: string | null
          position: number
          priority: Database["public"]["Enums"]["action_priority"] | null
          project_id: string
          status: Database["public"]["Enums"]["action_status"] | null
          title: string
          touchpoint_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          effort?: number | null
          id?: string
          impact?: number | null
          owner?: string | null
          position?: number
          priority?: Database["public"]["Enums"]["action_priority"] | null
          project_id: string
          status?: Database["public"]["Enums"]["action_status"] | null
          title: string
          touchpoint_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          effort?: number | null
          id?: string
          impact?: number | null
          owner?: string | null
          position?: number
          priority?: Database["public"]["Enums"]["action_priority"] | null
          project_id?: string
          status?: Database["public"]["Enums"]["action_status"] | null
          title?: string
          touchpoint_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journey_actions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "journey_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journey_actions_touchpoint_id_fkey"
            columns: ["touchpoint_id"]
            isOneToOne: false
            referencedRelation: "journey_touchpoints"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_intake_forms: {
        Row: {
          access_token: string | null
          answered_at: string | null
          answers: Json | null
          created_at: string | null
          description: string | null
          id: string
          project_id: string
          questions: Json
          stage_id: string | null
          status: Database["public"]["Enums"]["intake_form_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          access_token?: string | null
          answered_at?: string | null
          answers?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          project_id: string
          questions?: Json
          stage_id?: string | null
          status?: Database["public"]["Enums"]["intake_form_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          access_token?: string | null
          answered_at?: string | null
          answers?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          project_id?: string
          questions?: Json
          stage_id?: string | null
          status?: Database["public"]["Enums"]["intake_form_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journey_intake_forms_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "journey_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journey_intake_forms_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "journey_project_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_project_stages: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          is_custom: boolean | null
          name: string
          position: number
          project_id: string
          score: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          is_custom?: boolean | null
          name: string
          position?: number
          project_id: string
          score?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          is_custom?: boolean | null
          name?: string
          position?: number
          project_id?: string
          score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journey_project_stages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "journey_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_projects: {
        Row: {
          client_access_token: string | null
          client_email: string | null
          client_name: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
          organization_id: string
          overall_score: number | null
          status: Database["public"]["Enums"]["journey_project_status"] | null
          updated_at: string | null
        }
        Insert: {
          client_access_token?: string | null
          client_email?: string | null
          client_name: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          organization_id: string
          overall_score?: number | null
          status?: Database["public"]["Enums"]["journey_project_status"] | null
          updated_at?: string | null
        }
        Update: {
          client_access_token?: string | null
          client_email?: string | null
          client_name?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          overall_score?: number | null
          status?: Database["public"]["Enums"]["journey_project_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journey_projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journey_projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_stages: {
        Row: {
          color: string
          created_at: string
          description: string | null
          display_name: string
          id: string
          is_default: boolean
          name: string
          organization_id: string
          position: number
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          is_default?: boolean
          name: string
          organization_id: string
          position?: number
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          is_default?: boolean
          name?: string
          organization_id?: string
          position?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "journey_stages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_touchpoints: {
        Row: {
          created_at: string | null
          description: string | null
          evidence_screenshot: string | null
          evidence_url: string | null
          id: string
          is_critical: boolean | null
          name: string
          notes: string | null
          position: number
          score: number | null
          stage_id: string
          type: Database["public"]["Enums"]["touchpoint_type"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          evidence_screenshot?: string | null
          evidence_url?: string | null
          id?: string
          is_critical?: boolean | null
          name: string
          notes?: string | null
          position?: number
          score?: number | null
          stage_id: string
          type?: Database["public"]["Enums"]["touchpoint_type"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          evidence_screenshot?: string | null
          evidence_url?: string | null
          id?: string
          is_critical?: boolean | null
          name?: string
          notes?: string | null
          position?: number
          score?: number | null
          stage_id?: string
          type?: Database["public"]["Enums"]["touchpoint_type"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journey_touchpoints_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "journey_project_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      org_members: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          profile_id: string
          role: Database["public"]["Enums"]["org_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          profile_id: string
          role?: Database["public"]["Enums"]["org_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          profile_id?: string
          role?: Database["public"]["Enums"]["org_role"]
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
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          settings: Json
          slug: string
          status: Database["public"]["Enums"]["org_status"]
          type: Database["public"]["Enums"]["org_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          settings?: Json
          slug: string
          status?: Database["public"]["Enums"]["org_status"]
          type?: Database["public"]["Enums"]["org_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          settings?: Json
          slug?: string
          status?: Database["public"]["Enums"]["org_status"]
          type?: Database["public"]["Enums"]["org_type"]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          preferences: Json
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          preferences?: Json
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          preferences?: Json
          updated_at?: string
        }
        Relationships: []
      }
      stakeholder_interactions: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          impact_score: number | null
          interaction_type: Database["public"]["Enums"]["stakeholder_interaction_type"]
          occurred_at: string
          organization_id: string
          stakeholder_id: string
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          impact_score?: number | null
          interaction_type: Database["public"]["Enums"]["stakeholder_interaction_type"]
          occurred_at: string
          organization_id: string
          stakeholder_id: string
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          impact_score?: number | null
          interaction_type?: Database["public"]["Enums"]["stakeholder_interaction_type"]
          occurred_at?: string
          organization_id?: string
          stakeholder_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "stakeholder_interactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stakeholder_interactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stakeholder_interactions_stakeholder_id_fkey"
            columns: ["stakeholder_id"]
            isOneToOne: false
            referencedRelation: "stakeholders"
            referencedColumns: ["id"]
          },
        ]
      }
      stakeholder_relationships: {
        Row: {
          created_at: string
          description: string | null
          id: string
          organization_id: string
          relationship_type: Database["public"]["Enums"]["stakeholder_relationship_type"]
          stakeholder_a_id: string
          stakeholder_b_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          organization_id: string
          relationship_type: Database["public"]["Enums"]["stakeholder_relationship_type"]
          stakeholder_a_id: string
          stakeholder_b_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          organization_id?: string
          relationship_type?: Database["public"]["Enums"]["stakeholder_relationship_type"]
          stakeholder_a_id?: string
          stakeholder_b_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stakeholder_relationships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stakeholder_relationships_stakeholder_a_id_fkey"
            columns: ["stakeholder_a_id"]
            isOneToOne: false
            referencedRelation: "stakeholders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stakeholder_relationships_stakeholder_b_id_fkey"
            columns: ["stakeholder_b_id"]
            isOneToOne: false
            referencedRelation: "stakeholders"
            referencedColumns: ["id"]
          },
        ]
      }
      stakeholders: {
        Row: {
          avatar_url: string | null
          bio: string | null
          contact_id: string | null
          contribution_score: number | null
          created_at: string
          custom_fields: Json
          email: string | null
          expertise: string[] | null
          full_name: string
          id: string
          investment_amount: number | null
          joined_at: string | null
          linkedin_url: string | null
          organization_id: string
          participation_pct: number | null
          score_breakdown: Json
          sector: string | null
          stakeholder_type: Database["public"]["Enums"]["stakeholder_type"]
          status: Database["public"]["Enums"]["stakeholder_status"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          contact_id?: string | null
          contribution_score?: number | null
          created_at?: string
          custom_fields?: Json
          email?: string | null
          expertise?: string[] | null
          full_name: string
          id?: string
          investment_amount?: number | null
          joined_at?: string | null
          linkedin_url?: string | null
          organization_id: string
          participation_pct?: number | null
          score_breakdown?: Json
          sector?: string | null
          stakeholder_type?: Database["public"]["Enums"]["stakeholder_type"]
          status?: Database["public"]["Enums"]["stakeholder_status"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          contact_id?: string | null
          contribution_score?: number | null
          created_at?: string
          custom_fields?: Json
          email?: string | null
          expertise?: string[] | null
          full_name?: string
          id?: string
          investment_amount?: number | null
          joined_at?: string | null
          linkedin_url?: string | null
          organization_id?: string
          participation_pct?: number | null
          score_breakdown?: Json
          sector?: string | null
          stakeholder_type?: Database["public"]["Enums"]["stakeholder_type"]
          status?: Database["public"]["Enums"]["stakeholder_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stakeholders_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "audit_results_enriched"
            referencedColumns: ["contact_id"]
          },
          {
            foreignKeyName: "stakeholders_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stakeholders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          color: string
          created_at: string
          description: string | null
          id: string
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tags_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      audit_results_enriched: {
        Row: {
          ascensao_score: number | null
          autonomia_comunidade: string | null
          autonomia_score: number | null
          base_size: string | null
          base_value: number | null
          comunicacao_multiplier: number | null
          contact_id: string | null
          contact_org_id: string | null
          created_at: string | null
          email: string | null
          frequencia_comunicacao: string | null
          id: string | null
          identidade_comunidade: string | null
          identidade_score: number | null
          is_beginner: boolean | null
          journey_stage_display_name: string | null
          journey_stage_id: string | null
          journey_stage_name: string | null
          kosmos_asset_score: number | null
          lucro_oculto: number | null
          num_ofertas: string | null
          oferta_ascensao: string | null
          ofertas_multiplier: number | null
          razao_compra: string | null
          razao_compra_score: number | null
          recorrencia: string | null
          recorrencia_score: number | null
          rituais_jornada: string | null
          rituais_score: number | null
          score_causa: number | null
          score_cultura: number | null
          score_economia: number | null
          ticket_medio: string | null
          ticket_value: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_orgs_journey_stage_id_fkey"
            columns: ["journey_stage_id"]
            isOneToOne: false
            referencedRelation: "journey_stages"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculate_project_score: {
        Args: { p_project_id: string }
        Returns: number
      }
      calculate_stage_score: { Args: { p_stage_id: string }; Returns: number }
      create_default_journey_stages: {
        Args: { p_project_id: string }
        Returns: undefined
      }
      get_contact_activities: {
        Args: { p_contact_org_id: string; p_limit?: number; p_offset?: number }
        Returns: {
          actor_id: string
          actor_name: string
          created_at: string
          description: string
          id: string
          metadata: Json
          reference_id: string
          reference_type: string
          title: string
          type: string
        }[]
      }
      get_contact_stats: {
        Args: { p_organization_id?: string }
        Returns: {
          avg_score: number
          by_stage: Json
          contacts_this_month: number
          contacts_this_week: number
          total_contacts: number
        }[]
      }
      get_contact_tags: {
        Args: { p_contact_org_id: string }
        Returns: {
          added_at: string
          color: string
          id: string
          name: string
        }[]
      }
      get_contacts_by_tag: {
        Args: { p_tag_id: string }
        Returns: {
          added_at: string
          contact_id: string
          contact_org_id: string
          email: string
          full_name: string
          score: number
        }[]
      }
      get_current_profile_id: { Args: never; Returns: string }
      get_form_by_slug: {
        Args: { p_org_id: string; p_slug: string }
        Returns: {
          blocks: Json
          classifications: Json
          fields: Json
          form: Json
        }[]
      }
      get_form_stats: {
        Args: { p_form_id: string }
        Returns: {
          abandoned_submissions: number
          avg_score: number
          avg_time_seconds: number
          completed_submissions: number
          completion_rate: number
          in_progress_submissions: number
          submissions_this_month: number
          submissions_this_week: number
          submissions_today: number
          total_submissions: number
        }[]
      }
      get_form_with_fields: {
        Args: { p_form_id: string }
        Returns: {
          blocks: Json
          classifications: Json
          fields: Json
          form: Json
        }[]
      }
      get_org_stakeholder_overview: {
        Args: { p_organization_id: string }
        Returns: {
          active_stakeholders: number
          advisors_count: number
          avg_score: number
          cofounders_count: number
          investors_count: number
          partners_count: number
          total_investment: number
          total_participation: number
          total_stakeholders: number
        }[]
      }
      get_stakeholder_interactions: {
        Args: { p_limit?: number; p_offset?: number; p_stakeholder_id: string }
        Returns: {
          created_at: string
          created_by: string
          created_by_name: string
          description: string
          id: string
          impact_score: number
          interaction_type: Database["public"]["Enums"]["stakeholder_interaction_type"]
          occurred_at: string
          title: string
        }[]
      }
      get_stakeholder_relationships: {
        Args: { p_stakeholder_id: string }
        Returns: {
          description: string
          related_stakeholder_id: string
          related_stakeholder_name: string
          related_stakeholder_type: Database["public"]["Enums"]["stakeholder_type"]
          relationship_id: string
          relationship_type: Database["public"]["Enums"]["stakeholder_relationship_type"]
        }[]
      }
      get_stakeholder_stats: {
        Args: { p_organization_id: string }
        Returns: {
          active_stakeholders: number
          avg_contribution_score: number
          stakeholders_by_type: Json
          total_investment: number
          total_participation_pct: number
          total_stakeholders: number
        }[]
      }
      get_stakeholder_summary: {
        Args: { p_stakeholder_id: string }
        Returns: {
          contribution_score: number
          email: string
          full_name: string
          id: string
          interactions_count: number
          investment_amount: number
          last_interaction_at: string
          organization_id: string
          participation_pct: number
          relationships_count: number
          stakeholder_type: Database["public"]["Enums"]["stakeholder_type"]
          status: Database["public"]["Enums"]["stakeholder_status"]
        }[]
      }
      get_user_org_ids: { Args: never; Returns: string[] }
      has_org_role: {
        Args: {
          org_id: string
          required_role: Database["public"]["Enums"]["org_role"]
        }
        Returns: boolean
      }
      is_kosmos_master: { Args: never; Returns: boolean }
      is_org_member: { Args: { org_id: string }; Returns: boolean }
      upsert_contact_with_org: {
        Args: {
          p_email: string
          p_full_name?: string
          p_organization_id?: string
          p_phone?: string
          p_score?: number
          p_score_breakdown?: Json
          p_source?: Database["public"]["Enums"]["contact_source"]
          p_source_detail?: Json
        }
        Returns: string
      }
    }
    Enums: {
      action_priority: "high" | "medium" | "low"
      action_status: "pending" | "in_progress" | "done"
      contact_org_status: "active" | "archived" | "unsubscribed"
      contact_source:
        | "kosmos_score"
        | "landing_page"
        | "manual"
        | "import"
        | "referral"
      intake_form_status: "pending" | "answered"
      journey_project_status: "draft" | "in_progress" | "completed"
      org_role: "owner" | "admin" | "member" | "viewer"
      org_status: "active" | "suspended" | "churned"
      org_type: "master" | "client" | "community"
      stakeholder_interaction_type:
        | "meeting"
        | "mentoring"
        | "referral"
        | "decision"
        | "investment"
      stakeholder_relationship_type:
        | "co_investor"
        | "referral"
        | "mentor"
        | "partner"
      stakeholder_status: "active" | "inactive" | "exited"
      stakeholder_type: "investor" | "partner" | "co_founder" | "advisor"
      touchpoint_type:
        | "page"
        | "email"
        | "event"
        | "content"
        | "automation"
        | "whatsapp"
        | "call"
        | "other"
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
      action_priority: ["high", "medium", "low"],
      action_status: ["pending", "in_progress", "done"],
      contact_org_status: ["active", "archived", "unsubscribed"],
      contact_source: [
        "kosmos_score",
        "landing_page",
        "manual",
        "import",
        "referral",
      ],
      intake_form_status: ["pending", "answered"],
      journey_project_status: ["draft", "in_progress", "completed"],
      org_role: ["owner", "admin", "member", "viewer"],
      org_status: ["active", "suspended", "churned"],
      org_type: ["master", "client", "community"],
      stakeholder_interaction_type: [
        "meeting",
        "mentoring",
        "referral",
        "decision",
        "investment",
      ],
      stakeholder_relationship_type: [
        "co_investor",
        "referral",
        "mentor",
        "partner",
      ],
      stakeholder_status: ["active", "inactive", "exited"],
      stakeholder_type: ["investor", "partner", "co_founder", "advisor"],
      touchpoint_type: [
        "page",
        "email",
        "event",
        "content",
        "automation",
        "whatsapp",
        "call",
        "other",
      ],
    },
  },
} as const
