import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { jobId } = await req.json();

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
    } = await supabaseAdmin.auth.getUser(token);

    if (!user) {
      return NextResponse.json({ error: "Invalid user" }, { status: 401 });
    }

    // Count existing claims (max 2)
    const { count } = await supabaseAdmin
      .from("job_leads")
      .select("*", { count: "exact", head: true })
      .eq("job_id", jobId);

    if ((count ?? 0) >= 2) {
      return NextResponse.json(
        { error: "This job already has 2 pros" },
        { status: 400 }
      );
    }

    // Create Stripe Checkout
    const stripeRes = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/stripe/checkout`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId,
          proId: user.id,
        }),
      }
    );

    const stripeData = await stripeRes.json();

    if (!stripeRes.ok) {
      return NextResponse.json(
        { error: "Stripe checkout failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      checkoutUrl: stripeData.url,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
