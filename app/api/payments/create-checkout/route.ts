import Stripe from "stripe";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 1. Move the initialization into a helper function 
// This prevents it from running automatically during the build
const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, {
    apiVersion: "2024-06-20",
  });
};

function getBaseUrl() {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  return url.replace(/\/$/, "");
}

export async function POST(req: Request) {
  try {
    const stripe = getStripe();
    
    // 2. Add a guard: if the key is missing, don't crash, just return an error
    if (!stripe) {
      console.error("STRIPE_SECRET_KEY is missing from environment variables.");
      return NextResponse.json(
        { error: "Payment system not configured" },
        { status: 500 }
      );
    }

    const { jobId, proId } = await req.json();

    if (!jobId || !proId) {
      return NextResponse.json(
        { error: "Missing jobId or proId" },
        { status: 400 }
      );
    }

    const baseUrl = getBaseUrl();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "PRS Home Connect Lead ($10)" },
            unit_amount: 1000,
          },
          quantity: 1,
        },
      ],
      // Adding success/cancel URLs so it doesn't error
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel`,
      metadata: { jobId, proId },
    });

    return NextResponse.json({ url: session.url });

  } catch (err: any) {
    console.error("Stripe Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

