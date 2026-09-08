import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://cupilmloaqlhgjnkejvb.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1cGlsbWxvYXFsaGdqbmtlanZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5MDEwMDAsImV4cCI6MjEwNDQ3NzAwMH0.nTlYEydlaKr5WVKBIXwiHFoSbw24erbf1LrTUAeNmVc";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
