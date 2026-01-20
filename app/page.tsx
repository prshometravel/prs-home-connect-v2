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
    return "/jobs?category=" + encodeURIComponent(q);
  }, [category, search]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-950 to-slate-950 text-white">
      {/* Top Bar */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/20 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="leading-tight">
              <div className="text-sm font-semibold">PRS Home Connect</div>
              <div className="text-[11px] text-white/70">
                by PRS Home Improvement and Security LLC
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <nav className="hidden items-center gap-2 sm:flex">
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

            {/* Logo RIGHT CORNER (56) */}
            <div className="h-14 w-14 overflow-hidden rounded-lg border border-white/10 bg-white/5">
              <Image
                src="/logo.png"
                alt="PRS Home Connect"
                width={56}
                height={56}
                className="h-full w-full object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left card */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
            <h1 className="text-2xl font-semibold leading-tight">
              Find the right help for your home — fast.
            </h1>
            <p className="mt-2 text-white/70">
              Choose a category, describe what you need, and connect with trusted professionals near you.
              Simple, fast, and reliable.
            </p>

            <div className="mt-6 rounded-2xl border border-emerald-400/30 bg-black/20 p-4">
              <div className="text-sm font-semibold text-white">Choose a category</div>
              <div className="mt-3 grid gap-3">
                <div>
                  <label className="text-xs text-white/60">Select a category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400/60"
                  >
                    <option value="" className="bg-slate-950">
                      Select a category
                    </option>
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c} className="bg-slate-950">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-white/60">Or type to search</label>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Start typing…"
                    className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-emerald-400/60"
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {filtered.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCategory(c)}
                        className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 transition"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link
                    href={goHref}
                    className="rounded-xl bg-emerald-500 px-4 py-3 text-center text-sm font-semibold text-black hover:bg-emerald-400 transition"
                  >
                    Go
                  </Link>

                  {/* No Clear button (removed) */}
                  <Link
                    href="/jobs"
                    className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-white/10 transition"
                  >
                    View Jobs
                  </Link>
                </div>

                <p className="text-xs text-white/55">
                  Tip: Start with a category, then add details and photos on the post page.
                </p>
              </div>
            </div>
          </section>

          {/* Right card */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
            <h2 className="text-lg font-semibold">Quick Actions</h2>
            <p className="mt-1 text-sm text-white/70">
              Jump to the most common actions.
            </p>

            <div className="mt-5 grid gap-3">
              <Link
                href="/homeowner/post-job"
                className="rounded-2xl bg-emerald-500 px-5 py-4 text-center text-base font-semibold text-black hover:bg-emerald-400 transition"
              >
                Post a Job
              </Link>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/jobs"
                  className="rounded-2xl border border-white/15 bg-white/5 px-4 py-4 text-center text-sm font-semibold hover:bg-white/10 transition"
                >
                  View Available Jobs
                </Link>

                <Link
                  href="/homeowner/dashboard"
                  className="rounded-2xl border border-white/15 bg-white/5 px-4 py-4 text-center text-sm font-semibold hover:bg-white/10 transition"
                >
                  Homeowner Dashboard
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/pro/register"
                  className="rounded-2xl border border-white/15 bg-white/5 px-4 py-4 text-center text-sm font-semibold hover:bg-white/10 transition"
                >
                  Join as a Pro
                </Link>

                <Link
                  href="/homeowner/profile"
                  className="rounded-2xl border border-white/15 bg-white/5 px-4 py-4 text-center text-sm font-semibold hover:bg-white/10 transition"
                >
                  Homeowner Profile
                </Link>
              </div>

              <div className="rounded-2xl border border-emerald-400/25 bg-black/20 p-4">
                <div className="text-sm font-semibold">What you can do next</div>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/70">
                  <li>Post a job with photos and details</li>
                  <li>Browse available jobs by category</li>
                  <li>Pros can register and view leads</li>
                  <li>Homeowners manage posts from the dashboard</li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        {/* Sponsor Section (BOTTOM) */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-wider text-white/60">Sponsored by</p>
          <div className="mt-1 text-2xl font-semibold">Sista’s Compassionate Care Services, LLC</div>
          <p className="mt-1 text-sm text-white/70">Trusted Community Care Partner</p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-white/70">
              Built by <span className="font-semibold text-white">PRS Home Improvement and Security LLC</span>
            </div>

            <a
              href="tel:+17702985126"
              className="inline-flex items-center justify-center rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-200 hover:bg-emerald-400/15 transition"
            >
              Call Sponsor: (770) 298-5126
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
