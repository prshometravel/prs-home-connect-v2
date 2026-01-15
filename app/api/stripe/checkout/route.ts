import Stripe from "stripe";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      return NextResponse.json(
        { error: "Missing STRIPE_SECRET_KEY (check .env.local and Vercel env vars)" },
        { status: 500 }
      );
    }

    // ✅ No apiVersion here (avoids TypeScript mismatch)
    const stripe = new Stripe(secretKey);

    const body = await req.json().catch(() => ({} as any));
    const jobId = body?.jobId ? String(body.jobId) : "";

    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const successUrl = `${origin}/pro/dashboard?paid=1${jobId ? `&jobId=${encodeURIComponent(jobId)}` : ""}`;
    const cancelUrl = `${origin}/pro/dashboard?paid=0${jobId ? `&jobId=${encodeURIComponent(jobId)}` : ""}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Lead Access — PRS Home Connect",
            },
            unit_amount: 1000, // $10.00
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: jobId ? { jobId } : undefined,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Stripe checkout failed" }, { status: 500 });
  }
}

