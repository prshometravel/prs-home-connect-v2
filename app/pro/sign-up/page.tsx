"use client";

import Image from "next/image";
import Link from "next/link";

export default function ProSignUpPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white">
      <div className="mx-auto max-w-4xl px-6 py-10">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="relative h-14 w-14 rounded-xl border border-white/10 bg-white/5">
              <Image
                src="/logo.png"
                alt="PRS Home Connect"
                fill
                className="object-contain p-2"
              />
            </div>
            <div>
              <div className="text-lg font-extrabold">PRS Home Connect</div>
              <div className="text-xs text-white/60">Pro Sign-Up</div>
            </div>
          </div>

          <Link
            href="/"
            className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10"
          >
            ← Go Home
          </Link>
        </div>

        {/* CARD */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h1 className="text-2xl font-extrabold text-green-400">
            Create Your Pro Profile
          </h1>

          <p className="mt-1 text-sm text-white/70">
            Customers don’t pay to post. Pros pay <b>$10 per lead</b>.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <input
              placeholder="Full Name *"
              className="rounded-xl border border-white/15 bg-slate-900/50 px-4 py-3 text-white"
            />

            <input
              placeholder="Business Name"
              className="rounded-xl border border-white/15 bg-slate-900/50 px-4 py-3 text-white"
            />

            <input
              placeholder="Email *"
              type="email"
              className="rounded-xl border border-white/15 bg-slate-900/50 px-4 py-3 text-white"
            />

            <input
              placeholder="Phone *"
              className="rounded-xl border border-white/15 bg-slate-900/50 px-4 py-3 text-white"
            />

            <input
              placeholder="City, State *"
              className="rounded-xl border border-white/15 bg-slate-900/50 px-4 py-3 text-white"
            />

            <input
              placeholder="License (optional)"
              className="rounded-xl border border-white/15 bg-slate-900/50 px-4 py-3 text-white"
            />
          </div>

          <textarea
            placeholder="About you (what you do, availability, why hire you)"
            className="mt-4 w-full rounded-xl border border-white/15 bg-slate-900/50 px-4 py-3 text-white"
            rows={4}
          />

          <button
            className="mt-6 w-full rounded-xl bg-green-500 py-3 text-sm font-extrabold text-slate-950 hover:bg-green-400"
          >
            Create Pro Profile
          </button>
        </div>
      </div>
    </main>
  );
}
	
