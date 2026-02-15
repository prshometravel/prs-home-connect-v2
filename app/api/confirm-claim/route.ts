import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  session_id?: string;
  job_id?: string;
  pro_id?: string; // optional fallback if you pass it from client
};

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    const session_id = body.session_id?.trim();
    const job_id = body.job_id?.trim();

    if (!session_id || !job_id) {
      return jsonError("Missing session_id or job_id", 400);
    }

    // ✅ Stripe client created INSIDE handler (prevents build-time crash)
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) return jsonError("Missing STRIPE_SECRET_KEY", 500);

    const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });

    // Verify payment
    const session = await stripe.checkout.sessions.retrieve(session_id);

    // Stripe can show payment_status = "paid" when completed
    const paid =
      session.payment_status === "paid" ||
      session.status === "complete";

    if (!paid) {
      return jsonError("Payment not completed", 402);
    }

    // ✅ Supabase admin client created INSIDE handler
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) return jsonError("Missing SUPABASE URL env", 500);
    if (!serviceKey) return jsonError("Missing SUPABASE_SERVICE_ROLE_KEY", 500);

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    // pro_id: prefer Stripe metadata if you set it when creating checkout
    const pro_id =
      (session.metadata?.pro_id as string | undefined) ||
      body.pro_id;

    // Update job status to claimed (do NOT throw if pro_id missing)
    // If your table/columns differ, adjust ONLY here.
    const updatePayload: any = { status: "claimed" };
    if (pro_id) updatePayload.claimed_by = pro_id;

    const { error: jobErr } = await supabase
      .from("jobs")
      .update(updatePayload)
      .eq("id", job_id);

    if (jobErr) {
      return jsonError(`Supabase jobs update failed: ${jobErr.message}`, 500);
    }

    // Optional: record claim event if table exists (won’t break if it doesn’t)
    // Comment out if you don’t have this table.
    try {
      await supabase.from("lead_claims").insert({
        job_id,
        pro_id: pro_id || null,
        stripe_session_id: session_id,
        created_at: new Date().toISOString(),
      });
    } catch {
      // ignore if table doesn't exist
    }

    return NextResponse.json({
      ok: true,
      job_id,
      pro_id: pro_id || null,
      session_id,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
