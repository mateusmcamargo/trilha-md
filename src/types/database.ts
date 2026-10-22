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
    PostgrestVersion: "14.17"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
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
  public: {
    Tables: {
      activities: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          edition_id: string
          ends_at: string | null
          id: string
          kind: string
          location: string | null
          parent_id: string | null
          points: number
          position: number | null
          starts_at: string | null
          title: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          edition_id: string
          ends_at?: string | null
          id?: string
          kind: string
          location?: string | null
          parent_id?: string | null
          points?: number
          position?: number | null
          starts_at?: string | null
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          edition_id?: string
          ends_at?: string | null
          id?: string
          kind?: string
          location?: string | null
          parent_id?: string | null
          points?: number
          position?: number | null
          starts_at?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_item_solutions: {
        Row: {
          explanation: string | null
          item_id: string
          solution: Json
        }
        Insert: {
          explanation?: string | null
          item_id: string
          solution: Json
        }
        Update: {
          explanation?: string | null
          item_id?: string
          solution?: Json
        }
        Relationships: [
          {
            foreignKeyName: "activity_item_solutions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: true
            referencedRelation: "activity_items"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_items: {
        Row: {
          activity_id: string
          content: Json
          created_at: string
          id: string
          position: number
          type: string
        }
        Insert: {
          activity_id: string
          content: Json
          created_at?: string
          id?: string
          position: number
          type: string
        }
        Update: {
          activity_id?: string
          content?: Json
          created_at?: string
          id?: string
          position?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_items_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_materials: {
        Row: {
          activity_id: string
          body: string | null
          created_at: string
          id: string
          kind: string
          position: number
          storage_path: string | null
          title: string
          url: string | null
        }
        Insert: {
          activity_id: string
          body?: string | null
          created_at?: string
          id?: string
          kind: string
          position?: number
          storage_path?: string | null
          title: string
          url?: string | null
        }
        Update: {
          activity_id?: string
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          position?: number
          storage_path?: string | null
          title?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_materials_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      attempt_answers: {
        Row: {
          answer: Json
          answered_at: string
          attempt_id: string
          is_correct: boolean
          item_id: string
        }
        Insert: {
          answer: Json
          answered_at?: string
          attempt_id: string
          is_correct: boolean
          item_id: string
        }
        Update: {
          answer?: Json
          answered_at?: string
          attempt_id?: string
          is_correct?: boolean
          item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attempt_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempt_answers_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "activity_items"
            referencedColumns: ["id"]
          },
        ]
      }
      attempts: {
        Row: {
          activity_id: string
          correct_count: number | null
          finished_at: string | null
          id: string
          mentee_id: string
          started_at: string
          total_count: number | null
          xp: number | null
        }
        Insert: {
          activity_id: string
          correct_count?: number | null
          finished_at?: string | null
          id?: string
          mentee_id: string
          started_at?: string
          total_count?: number | null
          xp?: number | null
        }
        Update: {
          activity_id?: string
          correct_count?: number | null
          finished_at?: string | null
          id?: string
          mentee_id?: string
          started_at?: string
          total_count?: number | null
          xp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "attempts_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempts_mentee_id_fkey"
            columns: ["mentee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          activity_id: string
          checked_in_at: string | null
          confirmed_by: string | null
          id: string
          mentee_id: string
          status: string
        }
        Insert: {
          activity_id: string
          checked_in_at?: string | null
          confirmed_by?: string | null
          id?: string
          mentee_id: string
          status?: string
        }
        Update: {
          activity_id?: string
          checked_in_at?: string | null
          confirmed_by?: string | null
          id?: string
          mentee_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_mentee_id_fkey"
            columns: ["mentee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          certificate_code: string
          edition_id: string
          file_url: string | null
          generated_at: string
          id: string
          mentee_id: string
          mentor_id: string
          signed_at: string | null
          status: string
        }
        Insert: {
          certificate_code: string
          edition_id: string
          file_url?: string | null
          generated_at?: string
          id?: string
          mentee_id: string
          mentor_id: string
          signed_at?: string | null
          status?: string
        }
        Update: {
          certificate_code?: string
          edition_id?: string
          file_url?: string | null
          generated_at?: string
          id?: string
          mentee_id?: string
          mentor_id?: string
          signed_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_mentee_id_fkey"
            columns: ["mentee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      checkin_codes: {
        Row: {
          activity_id: string
          code: string
          expires_at: string
        }
        Insert: {
          activity_id: string
          code: string
          expires_at: string
        }
        Update: {
          activity_id?: string
          code?: string
          expires_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkin_codes_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: true
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      editions: {
        Row: {
          access_code: string
          created_at: string
          created_by: string
          end_date: string | null
          id: string
          name: string
          start_date: string
          status: string
          subtitle: string | null
        }
        Insert: {
          access_code: string
          created_at?: string
          created_by: string
          end_date?: string | null
          id?: string
          name: string
          start_date: string
          status?: string
          subtitle?: string | null
        }
        Update: {
          access_code?: string
          created_at?: string
          created_by?: string
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string
          status?: string
          subtitle?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "editions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          edition_id: string
          enrolled_at: string
          id: string
          mentee_id: string
          mentor_id: string | null
          status: string
          team_id: string | null
        }
        Insert: {
          edition_id: string
          enrolled_at?: string
          id?: string
          mentee_id: string
          mentor_id?: string | null
          status?: string
          team_id?: string | null
        }
        Update: {
          edition_id?: string
          enrolled_at?: string
          id?: string
          mentee_id?: string
          mentor_id?: string | null
          status?: string
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_mentee_id_fkey"
            columns: ["mentee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          status: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          requester_id: string
          status?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "friendships_addressee_id_fkey"
            columns: ["addressee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          deleted_at: string | null
          deletion_reason: string | null
          full_name: string
          id: string
          role: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          deletion_reason?: string | null
          full_name: string
          id: string
          role?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          deletion_reason?: string | null
          full_name?: string
          id?: string
          role?: string
          username?: string
        }
        Relationships: []
      }
      reflections: {
        Row: {
          activity_id: string | null
          content: string
          created_at: string
          edition_id: string
          id: string
          mentee_id: string
          rating: number
        }
        Insert: {
          activity_id?: string | null
          content: string
          created_at?: string
          edition_id: string
          id?: string
          mentee_id: string
          rating: number
        }
        Update: {
          activity_id?: string | null
          content?: string
          created_at?: string
          edition_id?: string
          id?: string
          mentee_id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "reflections_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reflections_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reflections_mentee_id_fkey"
            columns: ["mentee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          edition_id: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          edition_id: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          edition_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          animations_enabled: boolean
          funny_messages_enabled: boolean
          profile_id: string
          sounds_enabled: boolean
          theme: string
        }
        Insert: {
          animations_enabled?: boolean
          funny_messages_enabled?: boolean
          profile_id: string
          sounds_enabled?: boolean
          theme?: string
        }
        Update: {
          animations_enabled?: boolean
          funny_messages_enabled?: boolean
          profile_id?: string
          sounds_enabled?: boolean
          theme?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stats: {
        Row: {
          last_active_on: string | null
          lives: number
          profile_id: string
          streak_days: number
        }
        Insert: {
          last_active_on?: string | null
          lives?: number
          profile_id: string
          streak_days?: number
        }
        Update: {
          last_active_on?: string | null
          lives?: number
          profile_id?: string
          streak_days?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_stats_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      xp_entries: {
        Row: {
          activity_id: string | null
          earned_at: string | null
          edition_id: string | null
          mentee_id: string | null
          xp: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      adopt_mentee: { Args: { p_enrollment_id: string }; Returns: undefined }
      bump_streak: { Args: { p_profile_id: string }; Returns: undefined }
      can_read_material: { Args: { p_activity_id: string }; Returns: boolean }
      check_access_code: { Args: { p_access_code: string }; Returns: string }
      check_answer: {
        Args: { p_answer: Json; p_attempt_id: string; p_item_id: string }
        Returns: {
          explanation: string
          is_correct: boolean
          solution: Json
        }[]
      }
      check_in: { Args: { p_code: string }; Returns: string }
      choose_mentor: { Args: { p_mentor_id: string }; Returns: undefined }
      deactivate_account: { Args: { p_reason?: string }; Returns: undefined }
      finish_attempt: {
        Args: { p_attempt_id: string }
        Returns: {
          correct: number
          total: number
          xp: number
        }[]
      }
      get_my_role: { Args: never; Returns: string }
      is_enrolled_in_activity: {
        Args: { p_activity_id: string }
        Returns: boolean
      }
      is_mentor_of: { Args: { p_mentee_id: string }; Returns: boolean }
      is_username_available: { Args: { p_username: string }; Returns: boolean }
      join_edition: {
        Args: { p_access_code: string; p_mentor_id?: string }
        Returns: string
      }
      list_friend_requests: {
        Args: never
        Returns: {
          created_at: string
          friendship_id: string
          full_name: string
          requester_id: string
          username: string
        }[]
      }
      list_friends: {
        Args: never
        Returns: {
          friendship_id: string
          full_name: string
          id: string
          total_xp: number
          username: string
        }[]
      }
      list_mentee_xp: {
        Args: never
        Returns: {
          edition_id: string
          mentee_id: string
          xp: number
        }[]
      }
      list_mentors: {
        Args: never
        Returns: {
          avatar_url: string
          full_name: string
          id: string
        }[]
      }
      open_checkin: {
        Args: { p_activity_id: string; p_minutes?: number }
        Returns: {
          code: string
          expires_at: string
        }[]
      }
      release_mentee: { Args: { p_enrollment_id: string }; Returns: undefined }
      reorder_activities: {
        Args: { p_activity_ids: string[]; p_edition_id: string }
        Returns: undefined
      }
      reorder_activity_items: {
        Args: { p_activity_id: string; p_item_ids: string[] }
        Returns: undefined
      }
      respond_friend_request: {
        Args: { p_accept: boolean; p_friendship_id: string }
        Returns: undefined
      }
      save_activity_item: {
        Args: {
          p_activity_id: string
          p_content: Json
          p_explanation: string
          p_item_id: string
          p_solution: Json
          p_type: string
        }
        Returns: string
      }
      search_profiles: {
        Args: { p_username: string }
        Returns: {
          full_name: string
          id: string
          username: string
        }[]
      }
      start_attempt: { Args: { p_activity_id: string }; Returns: string }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
