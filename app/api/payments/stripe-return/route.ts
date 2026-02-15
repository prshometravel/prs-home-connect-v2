import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const jobId = url.searchParams.get("jobId");
    const proId = url.searchParams.get("proId");
    const sessionId = url.searchParams.get("session_id");

    if (!jobId || !proId || !sessionId) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // VERIFY PAYMENT
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.redirect("http://localhost:3000/pro/dashboard?error=not_paid");
    }

    // UPDATE SUPABASE
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase
      .from("jobs")
      .update({
        status: "claimed",
        claimed_by: proId,
        claimed_at: new Date().toISOString(),
        lead_fee_paid: true,
        lead_payment_id: sessionId,
      })
      .eq("id", jobId);

    if (error) {
      console.error(error);
      return NextResponse.redirect("http://localhost:3000/pro/dashboard?error=update_failed");
    }

    return NextResponse.redirect("http://localhost:3000/pro/dashboard?success=claimed");

  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Stripe return error" }, { status: 500 });
  }
}
