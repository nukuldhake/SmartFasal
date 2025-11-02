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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      crop_health_analysis: {
        Row: {
          analyzed_at: string | null
          confidence: number | null
          diagnosis: string | null
          field_id: string | null
          id: string
          image_url: string
          severity: string | null
          treatment_recommendation: string | null
          user_id: string
        }
        Insert: {
          analyzed_at?: string | null
          confidence?: number | null
          diagnosis?: string | null
          field_id?: string | null
          id?: string
          image_url: string
          severity?: string | null
          treatment_recommendation?: string | null
          user_id: string
        }
        Update: {
          analyzed_at?: string | null
          confidence?: number | null
          diagnosis?: string | null
          field_id?: string | null
          id?: string
          image_url?: string
          severity?: string | null
          treatment_recommendation?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crop_health_analysis_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
        ]
      }
      field_efficiency_metrics: {
        Row: {
          calculated_at: string | null
          efficiency_score: number | null
          fertilizer_usage: number | null
          field_id: string
          id: string
          regional_avg_score: number | null
          water_usage: number | null
        }
        Insert: {
          calculated_at?: string | null
          efficiency_score?: number | null
          fertilizer_usage?: number | null
          field_id: string
          id?: string
          regional_avg_score?: number | null
          water_usage?: number | null
        }
        Update: {
          calculated_at?: string | null
          efficiency_score?: number | null
          fertilizer_usage?: number | null
          field_id?: string
          id?: string
          regional_avg_score?: number | null
          water_usage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "field_efficiency_metrics_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
        ]
      }
      fields: {
        Row: {
          area_acres: number
          created_at: string | null
          crop_type: string
          id: string
          irrigation_type: string | null
          location_lat: number | null
          location_lng: number | null
          name: string
          planting_date: string
          soil_type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          area_acres: number
          created_at?: string | null
          crop_type: string
          id?: string
          irrigation_type?: string | null
          location_lat?: number | null
          location_lng?: number | null
          name: string
          planting_date: string
          soil_type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          area_acres?: number
          created_at?: string | null
          crop_type?: string
          id?: string
          irrigation_type?: string | null
          location_lat?: number | null
          location_lng?: number | null
          name?: string
          planting_date?: string
          soil_type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      harvest_schedules: {
        Row: {
          created_at: string | null
          field_id: string
          id: string
          ndvi_score: number | null
          optimal_end_date: string | null
          optimal_start_date: string | null
          recommendation: string | null
          weather_risk: string | null
        }
        Insert: {
          created_at?: string | null
          field_id: string
          id?: string
          ndvi_score?: number | null
          optimal_end_date?: string | null
          optimal_start_date?: string | null
          recommendation?: string | null
          weather_risk?: string | null
        }
        Update: {
          created_at?: string | null
          field_id?: string
          id?: string
          ndvi_score?: number | null
          optimal_end_date?: string | null
          optimal_start_date?: string | null
          recommendation?: string | null
          weather_risk?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "harvest_schedules_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      yield_predictions: {
        Row: {
          confidence: number | null
          factors: Json | null
          field_id: string
          id: string
          predicted_yield: number | null
          prediction_date: string | null
        }
        Insert: {
          confidence?: number | null
          factors?: Json | null
          field_id: string
          id?: string
          predicted_yield?: number | null
          prediction_date?: string | null
        }
        Update: {
          confidence?: number | null
          factors?: Json | null
          field_id?: string
          id?: string
          predicted_yield?: number | null
          prediction_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "yield_predictions_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
