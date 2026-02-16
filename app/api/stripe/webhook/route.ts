export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

export async function POST(req: Request) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing webhook secret" }, { status: 500 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const jobId = session.metadata?.job_id;
      const proId = session.metadata?.pro_id;

      if (!jobId || !proId) {
        return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
      }

      const supabase = await createClient();

      // ✅ 1. Mark job as claimed
      await supabase
        .from("jobs")
        .update({
          status: "claimed",
          claimed_by: proId,
        })
        .eq("id", jobId);

      // ✅ 2. Save payment record
      await supabase.from("payments").insert({
        job_id: jobId,
        pro_id: proId,
        amount: session.amount_total,
        status: "paid",
      });

      // 👉 THIS is what unlocks homeowner info
      // Your UI should show homeowner info ONLY if job.status === "claimed"
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
