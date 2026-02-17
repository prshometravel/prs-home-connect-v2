import Stripe from "stripe";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getBaseUrl() {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  return url.replace(/\/$/, "");
}

export async function POST(req: Request) {
  // 1. Check for the key first
  const apiKey = process.env.STRIPE_SECRET_KEY;

  if (!apiKey) {
    console.error("CRITICAL: STRIPE_SECRET_KEY is missing.");
    return NextResponse.json(
      { error: "Payment system is not configured on the server." },
      { status: 500 }
    );
  }

  // 2. Initialize Stripe INSIDE the POST function
  const stripe = new Stripe(apiKey, {
    apiVersion: "2024-06-20",
  });

  try {
    const { jobId, proId } = await req.json();

    if (!jobId || !proId) {
      return NextResponse.json(
        { error: "Missing jobId or proId" },
        { status: 400 }
      );
    }

    const baseUrl = getBaseUrl();

    // 3. Create the checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: "PRS Home Connect Lead ($10)",
              description: "Connection fee for professional services" 
            },
            unit_amount: 1000, // $10.00
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel`,
      metadata: { 
        jobId: String(jobId), 
        proId: String(proId) 
      },
    });

    return NextResponse.json({ url: session.url });

  } catch (err: any) {
    console.error("Stripe Error:", err.message);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message }, 
      { status: 500 }
    );
  }
}

