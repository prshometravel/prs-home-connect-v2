"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

const CATEGORY_OPTIONS = [
  "Cleaning",
  "Plumbing",
  "Electrical",
  "HVAC",
  "Handyman",
  "Painting",
  "Flooring",
  "Landscaping",
  "Roofing",
  "Drywall",
  "Carpentry",
  "Windows & Doors",
  "Moving",
  "Security Cameras",
  "Smart Home",
  "TV Mounting",
  "Appliance Repair",
  "Pressure Washing",
  "Junk Removal",
  "Auto Detailing",
  "CNA",
  "Caregiving",
  "Adult Day Care",
];

export default function Home() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return CATEGORY_OPTIONS.slice(0, 10);
    return CATEGORY_OPTIONS.filter((c) => c.toLowerCase().includes(q)).slice(0, 10);
  }, [search]);

  const goHref = useMemo(() => {
    const picked = category || search;
    const q = picked.trim();
    if (!q) return "/jobs";
    return `/jobs?category=${encodeURIComponent(q)}`;
  }, [category, search]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-950 to-slate-950 text-white">
      {/* Top Bar */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/20 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-lg border border-white/10 bg-white/5">
              <Image
                src="/logo.png"
                alt="PRS Home Connect"
                width={80}
                height={80}
                className="h-full w-full object-contain"
                priority
              />
            </div>

            <div className="leading-tight">
              <div className="text-sm font-semibold">PRS Home Connect</div>
              <div className="text-[11px] text-white/70">
                by PRS Home Improvement and Security LLC
              </div>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              href="/jobs"
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 transition"
            >
              Browse Jobs
            </Link>

            <Link
              href="/homeowner/post-job"
              className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-black hover:bg-emerald-400 transition"
            >
              Post a Job
            </Link>

            <Link
              href="/signin"
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 transition"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Hero */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
            <div className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
              Trusted local pros • Fast quotes • Real results
            </div>

            <h1 className="mt-4 text-4xl font-extrabold leading-tight">
              Post a job and hire with confidence.
            </h1>

            <p className="mt-3 text-white/75">
              Choose a category, describe what you need, and connect with trusted professionals
              near you. Simple, fast, and reliable.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link
                href="/homeowner/post-job"
                className="rounded-xl bg-emerald-500 px-4 py-3 text-center font-semibold text-black hover:bg-emerald-400 transition"
              >
                Post a Job
              </Link>

              <Link
                href="/jobs"
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-center font-semibold hover:bg-white/10 transition"
              >
                View Available Jobs
              </Link>

              <Link
                href="/pro/register"
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-center font-semibold hover:bg-white/10 transition"
              >
                Join as a Pro
              </Link>

              <Link
                href="/homeowner/dashboard"
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-center font-semibold hover:bg-white/10 transition"
              >
                Homeowner Dashboard
              </Link>
            </div>

            <p className="mt-4 text-xs text-white/60">
              Tip: Start with a category, then add details and photos on the post page.
            </p>
          </section>

          {/* Right Search/Picker */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
            <h2 className="text-xl font-bold">Find the right service</h2>
            <p className="mt-1 text-sm text-white/70">
              Search categories, select one, then hit Go.
            </p>

            <div className="mt-5 space-y-3">
              <div>
                <label className="text-xs text-white/70">Search categories</label>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Type: Cleaning, Plumbing, CNA..."
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/40 focus:border-emerald-400/60"
                />
                {!!search && filtered.length > 0 && (
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {filtered.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setCategory(c);
                          setSearch(c);
                        }}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-sm hover:bg-white/10 transition"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs text-white/70">Choose a category</label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setSearch(e.target.value);
                  }}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm outline-none focus:border-emerald-400/60"
                >
                  <option value="">Select a category</option>
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link
                  href={goHref}
                  className="rounded-xl bg-emerald-500 px-4 py-3 text-center text-sm font-semibold text-black hover:bg-emerald-400 transition"
                >
                  Go
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCategory("");
                  }}
                  className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold hover:bg-white/10 transition"
                >
                  Clear
                </button>
              </div>

              <p className="text-xs text-white/55">
                Same dark theme, same clean look. We’ll keep it consistent across every page.
              </p>
            </div>
          </section>
        </div>

        {/* Sponsor Section (ALWAYS ON HOME) */}
        <section className="mt-6 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950 to-slate-900 p-6 text-center shadow-lg">
          <p className="text-xs uppercase tracking-widest text-white/60 mb-2">
            Sponsored by
          </p>

          <h3 className="text-2xl font-extrabold text-white">
            Sista’s Compassionate Care Services, LLC
          </h3>

          <p className="mt-1 text-sm text-white/70">Trusted Community Care Partner</p>

          <a
            href="tel:17702985126"
            className="mt-4 inline-block rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-6 py-3 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/20 transition"
          >
            Call Sponsor: (770) 298-5126
          </a>
        </section>

        <footer className="mt-10 text-xs text-white/50">
          © {new Date().getFullYear()} PRS Home Connect
        </footer>
      </main>
    </div>
  );
}
