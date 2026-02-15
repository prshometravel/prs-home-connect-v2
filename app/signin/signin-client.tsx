"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function SignInClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);

  const next = searchParams.get("next") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSignIn() {
    setErr(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push(next);
      router.refresh();
    } catch (e: any) {
      setErr(e?.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0B1B3A] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl shadow-lg p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-white text-2xl font-semibold">PRS Home Connect</h1>
            <p className="text-white/70 text-sm mt-1">Sign in to your account</p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/homeowner/signup")}
            className="shrink-0 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-white hover:bg-white/10"
          >
            Home
          </button>
        </div>

        <div className="mt-6 space-y-3">
          <div>
            <label className="text-white/80 text-sm">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 px-4 py-3 outline-none focus:border-[#22c55e]"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-white/80 text-sm">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              type="password"
              className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 px-4 py-3 outline-none focus:border-[#22c55e]"
              autoComplete="current-password"
            />
          </div>

          {err ? (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-200 text-sm">
              {err}
            </div>
          ) : null}

          <button
            type="button"
            onClick={onSignIn}
            disabled={loading || !email || !password}
            className="w-full rounded-xl bg-[#22c55e] text-[#0B1B3A] font-semibold py-3 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <div className="pt-3">
            <p className="text-white/70 text-sm mb-3">Need an account?</p>

            <div className="grid gap-3">
              <button
                type="button"
                onClick={() => router.push("/pro/create")}
                className="w-full rounded-xl bg-white/5 border border-white/10 text-white py-3 hover:bg-white/10"
              >
                Create Pro Account
              </button>

              <button
                type="button"
                onClick={() => router.push("/homeowner/signup")}
                className="w-full rounded-xl bg-white/5 border border-white/10 text-white py-3 hover:bg-white/10"
              >
                Create Homeowner Account
              </button>
            </div>
          </div>

          <p className="text-white/40 text-xs mt-4">
            By continuing, you agree to use the platform respectfully.
          </p>
        </div>
      </div>
    </div>
  );
}
