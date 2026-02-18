import Stripe from "stripe";
import { NextResponse } from "next/server";

// 1. Force this route to NEVER be pre-built statically
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // 2. ONLY get the key when a real user triggers this function
  const apiKey = process.env.STRIPE_SECRET_KEY;

  // 3. THE BUILD GUARD: If the key is missing (like during a Vercel build),
  // we return a 500 instead of letting the Stripe library crash the deployment.
  if (!apiKey) {
    console.error("Build Guard: Stripe Key not found. Skipping initialization.");
    return NextResponse.json({ error: "Configuration missing" }, { status: 500 });
  }

  // 4. Initialize Stripe INSIDE the function so it's "lazy"
  const stripe = new Stripe(apiKey, {
    apiVersion: "2024-06-20",
  });

  try {
    const { jobId, proId } = await req.json();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: "PRS Home Connect Lead ($10)",
              description: `Lead for Job ID: ${jobId}`
            },
            unit_amount: 1000,
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
    console.error("Stripe Checkout Error:", err.message);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}

