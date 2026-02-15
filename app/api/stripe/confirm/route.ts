import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    // Pull the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed. Job not claimed." },
        { status: 400 }
      );
    }

    const jobId = session.metadata?.jobId;
    const proUserId = session.metadata?.proUserId;

    if (!jobId || !proUserId) {
      return NextResponse.json(
        { error: "Missing jobId or proUserId in Stripe session metadata." },
        { status: 400 }
      );
    }

    const admin = supabaseAdmin();

    // Create/confirm claim AFTER payment
    const { error: claimErr } = await admin
      .from("claims")
      .upsert(
        {
          job_id: jobId,
          pro_user_id: proUserId,
          lead_fee_paid: true,
        },
        { onConflict: "job_id,pro_user_id" }
      );

    if (claimErr) {
      return NextResponse.json(
        { error: `Supabase claim insert failed: ${claimErr.message}` },
        { status: 500 }
      );
    }

    // Optional: set status if you want (keeps your Start/Complete/Close flow)
    await admin.from("jobs").update({ status: "open" }).eq("id", jobId);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Confirm failed" },
      { status: 500 }
    );
  }
}
