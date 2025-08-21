import { createClient } from "@supabase/supabase-js";

export const authSupabaseClient = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const publicSupabaseClient = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);
