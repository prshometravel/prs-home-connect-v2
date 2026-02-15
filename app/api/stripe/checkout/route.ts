import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs"; // Stripe needs Node runtime

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

function baseUrl(req: Request) {
  const url = new URL(req.url);
  // Works local + Vercel behind proxy
  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto");
  if (forwardedHost) {
    return `${forwardedProto || "https"}://${forwardedHost}`;
  }
  return `${url.protocol}//${url.host}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const jobId = String(body?.jobId || "");
    const proUserId = String(body?.proUserId || "");

    if (!jobId || !proUserId) {
      return NextResponse.json(
        { error: "Missing jobId or proUserId" },
        { status: 400 }
      );
    }

    const origin = baseUrl(req);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "PRS Home Connect Lead",
              description: `Job ID: ${jobId}`,
            },
            unit_amount: 1000, // $10
          },
          quantity: 1,
        },
      ],
      // We'll finalize claim AFTER Stripe success (webhook or success page call)
      metadata: {
        jobId,
        proUserId,
        type: "lead_payment",
      },
     success_url: `${origin}/pro/claim/success?session_id={CHECKOUT_SESSION_ID}&job_id=${jobId}`,
      cancel_url: `${origin}/pro/dashboard?checkout=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: err?.message || "Stripe checkout failed" },
      { status: 500 }
    );
  }
}
