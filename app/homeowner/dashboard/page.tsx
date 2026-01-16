"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function HomeownerDashboardPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [state, setState] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) setUserEmail(user.email);
    };

    loadUser();
  }, []);

  const createProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // If you have a "homeowners" table, this will save the profile.
      // If your table name is different, tell me and I’ll adjust.
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");

      const { error } = await supabase
        .from("homeowners")
        .upsert(
          {
            user_id: user.id,
            full_name: fullName,
            state: state,
            email: user.email,
          },
          { onConflict: "user_id" }
        );

      if (error) throw error;

      alert("Profile created!");
    } catch (err: any) {
      alert(err?.message || "Error creating profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1c2c] text-white">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8 rounded-2xl bg-white/10 p-6 shadow">
          <h1 className="text-3xl font-bold">Homeowner Dashboard</h1>
          <p className="mt-2 text-white/80">
            Create this once before posting jobs.
          </p>
          <p className="mt-2 text-white/80">
            Signed in as{" "}
            <span className="font-semibold">{userEmail ?? "..."}</span>
          </p>
        </div>

        <form
          onSubmit={createProfile}
          className="rounded-2xl bg-white/10 p-6 shadow"
        >
          <h2 className="text-2xl font-semibold">Homeowner Profile</h2>

          <div className="mt-6 space-y-4">
            <input
              className="w-full rounded-full bg-black/30 px-5 py-4 text-white placeholder-white/60 outline-none ring-1 ring-white/15 focus:ring-2 focus:ring-emerald-400"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <input
              className="w-full rounded-full bg-black/30 px-5 py-4 text-white placeholder-white/60 outline-none ring-1 ring-white/15 focus:ring-2 focus:ring-emerald-400"
              placeholder="State"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full rounded-full bg-emerald-400 px-6 py-4 text-lg font-semibold text-black shadow-lg hover:bg-emerald-300 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Create Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
