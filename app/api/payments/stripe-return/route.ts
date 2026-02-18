import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 1. MANDATORY: Prevents Vercel from crashing during build-time pre-rendering
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    // 2. MOVE STRIPE INIT INSIDE: Get the key ONLY when a user lands on this page
    const apiKey = process.env.STRIPE_SECRET_KEY;
    
    // Safety Guard for the Vercel build phase
    if (!apiKey) {
      console.warn("Stripe key missing - Build Guard active");
      return NextResponse.json({ error: "Configuration missing" }, { status: 500 });
    }

    const stripe = new Stripe(apiKey, {
      apiVersion: "2024-06-20",
    });

    const url = new URL(req.url);
    const jobId = url.searchParams.get("jobId");
    const proId = url.searchParams.get("proId");
    const sessionId = url.searchParams.get("session_id");

    if (!jobId || !proId || !sessionId) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // 3. VERIFY PAYMENT STATUS WITH STRIPE
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Get your production URL or default to localhost
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (session.payment_status !== "paid") {
      return NextResponse.redirect(`${baseUrl}/pro/dashboard?error=not_paid`);
    }

    // 4. UPDATE SUPABASE: Mark the lead as paid and claimed
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
      console.error("Supabase Error:", error);
      return NextResponse.redirect(`${baseUrl}/pro/dashboard?error=update_failed`);
    }

    // SUCCESS: Redirect the pro back to their dashboard
    return NextResponse.redirect(`${baseUrl}/pro/dashboard?success=claimed`);

  } catch (e: any) {
    console.error("Internal Server Error:", e.message);
    return NextResponse.json({ error: "Stripe return error" }, { status: 500 });
  }
}

