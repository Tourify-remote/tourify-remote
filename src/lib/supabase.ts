import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          created_at: string
        }
        Insert: {
          id: string
          email?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          created_at?: string
        }
      }
      memberships: {
        Row: {
          user_id: string
          org_id: string
          role: string
        }
        Insert: {
          user_id: string
          org_id: string
          role?: string
        }
        Update: {
          user_id?: string
          org_id?: string
          role?: string
        }
      }
      subscriptions: {
        Row: {
          org_id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          plan: string | null
          current_period_end: string | null
          updated_at: string
        }
        Insert: {
          org_id: string
          status: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan?: string | null
          current_period_end?: string | null
          updated_at?: string
        }
        Update: {
          org_id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan?: string | null
          current_period_end?: string | null
          updated_at?: string
        }
      }
      sites: {
        Row: {
          id: string
          org_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          name?: string
          created_at?: string
        }
      }
    }
  }
}