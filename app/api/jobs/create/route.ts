import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // get body
    const body = await req.json();
    const { title, description, category, location } = body;

    // get env variables (SAFE)
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // prevent build crash
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Missing Supabase environment variables" },
        { status: 500 }
      );
    }

    // create client INSIDE function (IMPORTANT)
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // insert job
    const { data, error } = await supabase.from("jobs").insert([
      {
        title,
        description,
        category,
        location,
      },
    ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
