import { supabase } from "@/lib/supabaseClient";

export async function requireUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) return { user: null, error: error.message };
  return { user: data.user ?? null, error: null };
}
