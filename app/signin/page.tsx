"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Role = "homeowner" | "pro";

export default function SignInPage() {
  const router = useRouter();

  const [role, setRole] = useState<Role>("homeowner");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // TEMP: routing logic (auth comes later)
    setTimeout(() => {
      if (role === "pro") {
        router.push("/pro/dashboard");
      } else {
        router.push("/jobs");
      }
    }, 600);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-white">Sign In</h1>
          <p className="text-slate-400 text-sm">
            Access your PRS Home Connect account
          </p>
        </div>

        {/* Role Toggle */}
        <div className="mb-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setRole("homeowner")}
            className={`rounded-lg py-2 text-sm font-medium ${
              role === "homeowner"
                ? "bg-green-500 text-black"
                : "bg-white/10 text-white"
            }`}
          >
            Homeowner
          </button>
          <button
            type="button"
            onClick={() => setRole("pro")}
            className={`rounded-lg py-2 text-sm font-medium ${
              role === "pro"
                ? "bg-green-500 text-black"
                : "bg-white/10 text-white"
            }`}
          >
            Pro
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg bg-white/90 px-4 py-2 text-black outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg bg-white/90 px-4 py-2 text-black outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-green-500 py-2 font-semibold text-black hover:bg-green-400 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Links */}
        <div className="mt-6 flex justify-between text-sm text-slate-400">
          <Link href="/" className="hover:text-white">
            ← Home
          </Link>

          {role === "pro" ? (
            <Link href="/pro/register" className="hover:text-white">
              Join as Pro
            </Link>
          ) : (
            <Link href="/register" className="hover:text-white">
              Create Account
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}

