import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params?.id;

    if (!id) {
      return NextResponse.json(
        { error: "Missing job id" },
        { status: 400 }
      );
    }

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || "";

    const anonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    // 🔴 IMPORTANT: NEVER CRASH BUILD
    if (!supabaseUrl || !anonKey) {
      console.error("Missing Supabase env vars");
      return NextResponse.json(
        { error: "Server not configured" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, anonKey);

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
