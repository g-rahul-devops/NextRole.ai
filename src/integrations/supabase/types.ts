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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      ai_cache: {
        Row: {
          cache_key: string
          created_at: string
          value: Json
        }
        Insert: {
          cache_key: string
          created_at?: string
          value: Json
        }
        Update: {
          cache_key?: string
          created_at?: string
          value?: Json
        }
        Relationships: []
      }
      ai_usage: {
        Row: {
          count: number
          day: string
          kind: string
          user_id: string
        }
        Insert: {
          count?: number
          day?: string
          kind: string
          user_id: string
        }
        Update: {
          count?: number
          day?: string
          kind?: string
          user_id?: string
        }
        Relationships: []
      }
      applications: {
        Row: {
          created_at: string
          id: string
          job_id: string
          notes: string | null
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          notes?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      cover_letters: {
        Row: {
          content: string
          created_at: string
          id: string
          job_id: string
          resume_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          job_id: string
          resume_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          job_id?: string
          resume_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cover_letters_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cover_letters_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      job_matches: {
        Row: {
          breakdown: Json
          created_at: string
          explanation: string | null
          id: string
          job_id: string
          resume_id: string
          score: number
          user_id: string
        }
        Insert: {
          breakdown?: Json
          created_at?: string
          explanation?: string | null
          id?: string
          job_id: string
          resume_id: string
          score?: number
          user_id: string
        }
        Update: {
          breakdown?: Json
          created_at?: string
          explanation?: string | null
          id?: string
          job_id?: string
          resume_id?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_matches_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_matches_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          apply_url: string
          company: string
          country: string | null
          created_at: string
          dedupe_key: string
          description: string
          embedding: string | null
          id: string
          location: string
          posted_date: string | null
          region: string
          remote_type: Database["public"]["Enums"]["remote_kind"]
          salary_currency: string | null
          salary_max: number | null
          salary_min: number | null
          skills: string[]
          source: string
          source_job_id: string
          title: string
          visa_sponsorship: Database["public"]["Enums"]["visa_status"]
        }
        Insert: {
          apply_url: string
          company?: string
          country?: string | null
          created_at?: string
          dedupe_key: string
          description?: string
          embedding?: string | null
          id?: string
          location?: string
          posted_date?: string | null
          region?: string
          remote_type?: Database["public"]["Enums"]["remote_kind"]
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          skills?: string[]
          source: string
          source_job_id: string
          title: string
          visa_sponsorship?: Database["public"]["Enums"]["visa_status"]
        }
        Update: {
          apply_url?: string
          company?: string
          country?: string | null
          created_at?: string
          dedupe_key?: string
          description?: string
          embedding?: string | null
          id?: string
          location?: string
          posted_date?: string | null
          region?: string
          remote_type?: Database["public"]["Enums"]["remote_kind"]
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          skills?: string[]
          source?: string
          source_job_id?: string
          title?: string
          visa_sponsorship?: Database["public"]["Enums"]["visa_status"]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      resumes: {
        Row: {
          created_at: string
          embedding: string | null
          file_name: string
          id: string
          parsed: Json
          raw_text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          embedding?: string | null
          file_name?: string
          id?: string
          parsed?: Json
          raw_text: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          embedding?: string | null
          file_name?: string
          id?: string
          parsed?: Json
          raw_text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_jobs: {
        Row: {
          created_at: string
          id: string
          job_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_jobs: {
        Args: { match_count?: number; query_embedding: string }
        Returns: {
          job_id: string
          similarity: number
        }[]
      }
    }
    Enums: {
      application_status: "applied" | "interview" | "rejected" | "offer"
      remote_kind: "remote" | "hybrid" | "onsite" | "unknown"
      visa_status: "yes" | "no" | "unclear"
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
      application_status: ["applied", "interview", "rejected", "offer"],
      remote_kind: ["remote", "hybrid", "onsite", "unknown"],
      visa_status: ["yes", "no", "unclear"],
    },
  },
} as const
