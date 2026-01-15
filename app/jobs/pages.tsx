"use client";

import Link from "next/link";

export default function JobsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Top bar */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10"
          >
            ← Home
          </Link>

          <Link
            href="/post-job"
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-600"
          >
            Post a Job
          </Link>
        </div>

        <h1 className="mb-4 text-3xl font-bold">Available Jobs</h1>
        <p className="text-white/70">
          Jobs posted by homeowners will appear here.
        </p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
          <p className="text-white/60">
            No jobs yet. Check back soon.
          </p>
        </div>
      </div>
    </main>
  );
}
