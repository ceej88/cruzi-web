import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// New Supabase project — same DB used by the Cruzi mobile app
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://rolbqirsfgfsuuxptmbh.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvbGJxaXJzZmdmc3V1eHB0bWJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzOTkzOTIsImV4cCI6MjA5MDk3NTM5Mn0.ShcYqkEGeVgWzGCdGhnP_tEc1aEwIEoUkiv7WXqWoF0';

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
