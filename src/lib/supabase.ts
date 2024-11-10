import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'networking-crm'
    }
  }
});

// Add response type checking
export type Database = {
  public: {
    Tables: {
      contacts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          job_title: string | null;
          image_url: string | null;
          about: string | null;
          website: string | null;
          calendar_link: string | null;
          tags: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          name: string;
          job_title?: string | null;
          image_url?: string | null;
          about?: string | null;
          website?: string | null;
          calendar_link?: string | null;
          tags?: string[] | null;
        };
        Update: {
          name?: string;
          job_title?: string | null;
          image_url?: string | null;
          about?: string | null;
          website?: string | null;
          calendar_link?: string | null;
          tags?: string[] | null;
        };
      };
      contact_methods: {
        Row: {
          id: string;
          contact_id: string;
          type: string;
          value: string;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          contact_id: string;
          type: string;
          value: string;
          is_primary?: boolean;
        };
        Update: {
          type?: string;
          value?: string;
          is_primary?: boolean;
        };
      };
      social_links: {
        Row: {
          id: string;
          contact_id: string;
          platform: string;
          url: string;
          created_at: string;
        };
        Insert: {
          contact_id: string;
          platform: string;
          url: string;
        };
        Update: {
          platform?: string;
          url?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          contact_id: string;
          date: string;
          summary: string;
          transcript: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          contact_id: string;
          date: string;
          summary: string;
          transcript?: string | null;
        };
        Update: {
          date?: string;
          summary?: string;
          transcript?: string | null;
        };
      };
    };
  };
};