"use client";

import { createSupabaseBrowser } from "@/app/_shared/supabase-browser";

export async function getOrCreateConversationId(params: {
  jobId: string;
  homeownerId: string;
  proId: string;
}) {
  const supabase = createSupabaseBrowser();

  // Try existing
  const { data: existing, error: selErr } = await supabase
    .from("conversations")
    .select("id")
    .eq("job_id", params.jobId)
    .eq("homeowner_id", params.homeownerId)
    .eq("pro_id", params.proId)
    .maybeSingle();

  if (selErr) throw selErr;
  if (existing?.id) return existing.id as string;

  // Create
  const { data: created, error: insErr } = await supabase
    .from("conversations")
    .insert({
      job_id: params.jobId,
      homeowner_id: params.homeownerId,
      pro_id: params.proId,
    })
    .select("id")
    .single();

  if (insErr) throw insErr;
  return created.id as string;
}
