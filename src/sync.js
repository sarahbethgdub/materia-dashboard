import { createClient } from "@supabase/supabase-js";

/* ─── Supabase client (only created if env vars are set) ─── */

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = url && key ? createClient(url, key) : null;

export const cloudEnabled = !!supabase;

/* ─── Load state from cloud ─── */

export async function loadCloud() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("materia_state")
      .select("data, updated_at")
      .eq("id", "default")
      .single();
    if (error) throw error;
    return data?.data || null;
  } catch (e) {
    console.warn("Materia: cloud load failed —", e.message);
    return null;
  }
}

/* ─── Save state to cloud (debounced externally) ─── */

export async function saveCloud(state) {
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from("materia_state")
      .upsert({
        id: "default",
        data: state,
        updated_at: new Date().toISOString(),
      });
    if (error) throw error;
  } catch (e) {
    console.warn("Materia: cloud save failed —", e.message);
  }
}
