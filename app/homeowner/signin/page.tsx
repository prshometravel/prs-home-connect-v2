"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase =
  supabaseUrl && supabaseAnon ? createClient(supabaseUrl, supabaseAnon) : null;

export default function HomeownerSignInPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    // If already signed in, go to homeowner dashboard
    (async () => {
      if (!supabase) return;
      const { data } = await supabase.auth.getUser();
      if (data?.user) router.push("/homeowner/dashboard");
    })();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!supabase) {
      setMsg("Missing Supabase env vars (NEXT_PUBLIC_SUPABASE_URL / ANON_KEY).");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        router.push("/homeowner/dashboard");
      } else {
        // signup
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;

        // Some projects require email confirmation; we still send them to dashboard
        setMsg("Account created. If email confirmation is enabled, check your email.");
        router.push("/homeowner/dashboard");
      }
    } catch (err: any) {
      setMsg(err?.message || "Error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-950 to-slate-950 text-white">
      {/* Top Bar */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/20 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-lg border border-white/10 bg-white/5" />
            <div className="leading-tight">
              <div className="text-sm font-semibold">PRS Home Connect</div>
              <div className="text-[11px] text-white/70">
                by PRS Home Improvement and Security LLC
              </div>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 transition"
            >
              Go Home
            </Link>
            <Link
              href="/jobs"
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 transition"
            >
              Browse Jobs
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left info */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
            <h1 className="text-3xl font-bold">Homeowner Access</h1>
            <p className="mt-2 text-white/80">
              Sign in to post jobs, manage your profile, and hire pros.
            </p>

            <div className="mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4">
              <div className="text-sm font-semibold">Tip</div>
              <div className="mt-1 text-sm text-white/80">
                After signing in, you’ll land on your Homeowner Dashboard to create your profile
                before posting jobs.
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/homeowner/dashboard"
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition"
              >
                Homeowner Dashboard
              </Link>
              <Link
                href="/homeowner/post-job"
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400 transition"
              >
                Post a Job
              </Link>
            </div>
          </section>

          {/* Form */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {mode === "signin" ? "Sign In" : "Create Account"}
              </h2>

              <button
                type="button"
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 transition"
              >
                {mode === "signin" ? "Switch to Sign Up" : "Switch to Sign In"}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="text-sm text-white/80">Email</label>
                <input
                  className="mt-2 w-full rounded-xl bg-black/30 px-4 py-3 text-white placeholder-white/40 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-emerald-400/60"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="text-sm text-white/80">Password</label>
                <input
                  className="mt-2 w-full rounded-xl bg-black/30 px-4 py-3 text-white placeholder-white/40 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-emerald-400/60"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  type="password"
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                />
              </div>

              {msg ? (
                <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/80">
                  {msg}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-base font-semibold text-black shadow-lg hover:bg-emerald-400 transition disabled:opacity-60"
              >
                {loading
                  ? "Please wait..."
                  : mode === "signin"
                  ? "Sign In"
                  : "Create Account"}
              </button>

              <div className="text-center text-sm text-white/70">
                Pro?{" "}
                <Link href="/signin" className="text-emerald-300 hover:text-emerald-200">
                  Go to Pro Sign In
                </Link>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
