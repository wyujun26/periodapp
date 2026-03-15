export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      periods: {
        Row: {
          id: string
          user_id: string
          start_date: string
          end_date: string | null
          flow_intensity: 'spotting' | 'light' | 'medium' | 'heavy' | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          start_date: string
          end_date?: string | null
          flow_intensity?: 'spotting' | 'light' | 'medium' | 'heavy' | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          start_date?: string
          end_date?: string | null
          flow_intensity?: 'spotting' | 'light' | 'medium' | 'heavy' | null
          notes?: string | null
          created_at?: string
        }
      }
      daily_logs: {
        Row: {
          id: string
          user_id: string
          date: string
          mood: 'happy' | 'calm' | 'anxious' | 'irritable' | 'sad' | null
          symptoms: string[] | null
          flow_intensity: 'spotting' | 'light' | 'medium' | 'heavy' | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          mood?: 'happy' | 'calm' | 'anxious' | 'irritable' | 'sad' | null
          symptoms?: string[] | null
          flow_intensity?: 'spotting' | 'light' | 'medium' | 'heavy' | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          mood?: 'happy' | 'calm' | 'anxious' | 'irritable' | 'sad' | null
          symptoms?: string[] | null
          flow_intensity?: 'spotting' | 'light' | 'medium' | 'heavy' | null
          notes?: string | null
          created_at?: string
        }
      }
      symptoms: {
        Row: {
          id: string
          user_id: string
          date: string
          symptom_type: string
          severity: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          symptom_type: string
          severity: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          symptom_type?: string
          severity?: number
          notes?: string | null
          created_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          avg_cycle_length: number
          avg_period_length: number
          reminder_period_enabled: boolean
          reminder_period_days_before: number
          reminder_fertile_enabled: boolean
          reminder_daily_log_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          avg_cycle_length?: number
          avg_period_length?: number
          reminder_period_enabled?: boolean
          reminder_period_days_before?: number
          reminder_fertile_enabled?: boolean
          reminder_daily_log_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          avg_cycle_length?: number
          avg_period_length?: number
          reminder_period_enabled?: boolean
          reminder_period_days_before?: number
          reminder_fertile_enabled?: boolean
          reminder_daily_log_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
