
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://zryhlwfkovkxtqiwzhai.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeWhsd2Zrb3ZreHRxaXd6aGFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2NTE3MTAsImV4cCI6MjA1NDIyNzcxMH0.EghUT_FFDEXBUrq02-k_xdlcnzV-zDcujRxpu9uqBrY";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-client',
    },
  },
});
