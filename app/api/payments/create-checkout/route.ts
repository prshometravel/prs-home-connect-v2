import Stripe from "stripe";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

function getBaseUrl() {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  return url.replace(/\/$/, "");
}

export async function POST(req: Request) {
  try {
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

      // verify using session_id on return
      success_url: `${baseUrl}/api/payments/stripe-return?jobId=${jobId}&proId=${proId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/jobs`,

      metadata: { jobId, proId },
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Checkout error" }, { status: 500 });
  }
}
	
