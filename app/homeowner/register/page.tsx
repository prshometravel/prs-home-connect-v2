"use client";

import Link from "next/link";
import { useState } from "react";

export default function ProRegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    alert("Pro Register is working ✅");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 to-slate-900 text-white px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-2">Join as a Pro</h1>
        <p className="text-slate-300 mb-6">
          Create your PRS Home Connect professional account
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl bg-black/30 px-4 py-3 text-white border border-white/10 outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-xl bg-black/30 px-4 py-3 text-white border border-white/10 outline-none"
          />

          <button
            type="submit"
            className="w-full rounded-xl bg-green-500 py-3 font-semibold text-black hover:bg-green-400 transition"
          >
            Create Pro Account
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm text-slate-300">
          <Link href="/" className="hover:text-white">
            ← Home
          </Link>

          <Link href="/signin" className="hover:text-white">
            Back to Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
