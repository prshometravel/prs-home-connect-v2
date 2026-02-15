import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET" }, { status: 500 });
    }

    const sig = req.headers.get("stripe-signature");
    if (!sig) return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });

    const rawBody = await req.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
      return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 });
    }

    const supabase = createClient();

    // We only care about successful checkout completions
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const type = session.metadata?.type;
      const proId = session.metadata?.pro_id;

      if (!type || !proId) {
        return NextResponse.json({ ok: true, ignored: true });
      }

      // ✅ 1) Setup session: card on file complete → billing_ready true
      if (type === "setup") {
        // Optional: ensure customer has default payment method
        // Stripe Setup Checkout generally results in a payment method attached to the customer.
        const { error } = await supabase
          .from("pro_profiles")
          .update({ billing_ready: true })
          .eq("user_id", proId);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        return NextResponse.json({ received: true });
      }

      // ✅ 2) Lead payment: mark purchase paid and create claim
      if (type === "lead") {
        const jobId = session.metadata?.job_id;
        if (!jobId) return NextResponse.json({ ok: true, ignored: true });

        // Mark lead purchase paid
        const { error: updErr } = await supabase
          .from("lead_purchases")
          .update({ paid: true })
          .eq("stripe_session_id", session.id);

        if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

        // Ensure pro is billing-ready after first successful payment too
        await supabase.from("pro_profiles").update({ billing_ready: true }).eq("user_id", proId);

        // Create claim row (if you use job_claims)
        // NOTE: If you enforce "one pro only", you must enforce that rule in DB or in a transaction.
        const { error: claimErr } = await supabase.from("job_claims").insert({
          job_id: jobId,
          pro_id: proId,
          claim_status: "claimed",
        });

        // If claim already exists (unique constraint), ignore
        if (claimErr && !String(claimErr.message).toLowerCase().includes("duplicate")) {
          // Don’t fail the webhook if claim insert errors; purchase is already marked paid.
          // But you should log this in your own logs table later.
        }

        // Optionally update job status to claimed (only if you want one-pro-per-job)
        // await supabase.from("jobs").update({ status: "claimed" }).eq("id", jobId);

        return NextResponse.json({ received: true });
      }
    }

    return NextResponse.json({ received: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "webhook error" }, { status: 500 });
  }
}
