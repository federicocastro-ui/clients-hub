export type SubAccountStatus = 'onboarding' | 'adoption' | 'success' | 'renewal' | 'churn_risk' | 'churned'
export type TipoDeMora = 'B0' | 'B1' | 'B2' | 'B3' | 'B4' | 'Judicial'
export type AgentStage =
  | 'backlog'
  | 'nuevo'
  | 'en_construccion'
  | 'entregado_qa'
  | 'iterando_qa'
  | 'listo_para_mostrar'
  | 'en_produccion'
  | 'iterando_cliente'
export type DocumentKind = 'link' | 'file'

export interface Database {
  public: {
    Tables: {
      team_members: {
        Row: {
          id: string
          name: string
          email: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['team_members']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['team_members']['Insert']>
      }
      clients: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['clients']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['clients']['Insert']>
      }
      sub_accounts: {
        Row: {
          id: string
          client_id: string
          name: string
          tier: number
          status: SubAccountStatus
          vendedor_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['sub_accounts']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['sub_accounts']['Insert']>
      }
      countries: {
        Row: {
          id: string
          name: string
        }
        Insert: Omit<Database['public']['Tables']['countries']['Row'], 'id'> & { id?: string }
        Update: Partial<Database['public']['Tables']['countries']['Insert']>
      }
      agents: {
        Row: {
          id: string
          sub_account_id: string
          tipo_de_mora: TipoDeMora
          country_id: string
          current_stage: AgentStage
          onb_id: string | null
          cs_id: string | null
          ie_id: string | null
          is_live: boolean
          is_active: boolean
          linear_url: string | null
          notion_url: string | null
          figma_url: string | null
          qa_form_url: string | null
          manual_url: string | null
          metadata: Record<string, unknown>
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['agents']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['agents']['Insert']>
      }
      agent_documents: {
        Row: {
          id: string
          agent_id: string
          kind: DocumentKind
          label: string
          url: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['agent_documents']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['agent_documents']['Insert']>
      }
      agent_stage_logs: {
        Row: {
          id: string
          agent_id: string
          from_stage: AgentStage | null
          to_stage: AgentStage
          changed_at: string
          changed_by: string | null
        }
        Insert: Omit<Database['public']['Tables']['agent_stage_logs']['Row'], 'id' | 'changed_at'> & {
          id?: string
          changed_at?: string
        }
        Update: Partial<Database['public']['Tables']['agent_stage_logs']['Insert']>
      }
      sub_account_notes: {
        Row: {
          id: string
          sub_account_id: string
          body: string
          author: string | null
          created_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['sub_account_notes']['Row'],
          'id' | 'created_at'
        > & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['sub_account_notes']['Insert']>
      }
      contacts: {
        Row: {
          id: string
          client_id: string
          name: string
          email: string | null
          phone: string | null
          role: string | null
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['contacts']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['contacts']['Insert']>
      }
      contact_sub_accounts: {
        Row: {
          contact_id: string
          sub_account_id: string
        }
        Insert: Database['public']['Tables']['contact_sub_accounts']['Row']
        Update: Partial<Database['public']['Tables']['contact_sub_accounts']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      sub_account_status: SubAccountStatus
      tipo_de_mora: TipoDeMora
      agent_stage: AgentStage
      document_kind: DocumentKind
    }
  }
}
