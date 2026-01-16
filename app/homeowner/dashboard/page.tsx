"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function HomeownerDashboardPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [state, setState] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) {
        setUserEmail(user.email);
      }
    };

    loadUser();
  }, []);

  const handleCreateProfile = async () => {
    if (!fullName || !state) {
      alert("Please fill out all fields");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Not authenticated");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("homeowners").insert({
      user_id: user.id,
      full_name: fullName,
      state,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Profile created successfully");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1d2a] via-[#102c3c] to-[#0b1d2a] px-6 py-10 text-white">
      <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-black/40 p-8 shadow-xl">
        <h1 className="mb-2 text-3xl font-bold">Homeowner Profile</h1>

        <p className="mb-6 text-white/70">
          Create this once before posting jobs.
        </p>

        {/* EMAIL — FIXED (NO BLEED-THROUGH) */}
        {userEmail && (
          <div className="mb-6 inline-block rounded-md bg-black/60 px-4 py-2 text-sm font-semibold text-white">
            Signed in as {userEmail}
          </div>
        )}

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-lg bg-black/60 px-4 py-3 text-white placeholder-white/60 outline-none focus:ring-2 focus:ring-green-400"
          />

          <input
            type="text"
            placeholder="State"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full rounded-lg bg-black/60 px-4 py-3 text-white placeholder-white/60 outline-none focus:ring-2 focus:ring-green-400"
          />

          <button
            onClick={handleCreateProfile}
            disabled={loading}
            className="w-full rounded-lg bg-green-500 py-3 font-bold text-black transition hover:bg-green-400 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}
