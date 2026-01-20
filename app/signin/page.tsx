"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function SignInHubPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = useMemo(
    () => [
      { label: "Go Home", href: "/" },
      { label: "Browse Jobs", href: "/jobs" },
      { label: "Post a Job", href: "/homeowner/post-job" },
      { label: "Homeowner Sign In", href: "/homeowner/signin" },
      { label: "Homeowner Register", href: "/homeowner/register" },
      { label: "Homeowner Dashboard", href: "/homeowner/dashboard" },
      { label: "Homeowner Profile", href: "/homeowner/profile" },
      { label: "Pro Sign Up", href: "/pro/sign-up" },
      { label: "Pro Dashboard", href: "/pro/dashboard" },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          {/* Logo */}
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex items-center gap-3"
          >
            <div className="h-10 w-10 overflow-hidden rounded-xl border border-white/15 bg-white">
              <Image
                src="/logo.png"
                alt="PRS Home Connect"
                width={80}
                height={80}
                className="h-full w-full object-contain"
                priority
              />
            </div>
            <div className="text-left leading-tight">
              <div className="text-sm font-semibold">PRS Home Connect</div>
              <div className="text-xs text-white/60">Sign in</div>
            </div>
          </button>

          {/* Desktop buttons */}
          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/jobs"
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10"
            >
              Browse Jobs
            </Link>
            <Link
              href="/homeowner/post-job"
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-emerald-400"
            >
              Post a Job
            </Link>
            <Link
              href="/"
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10"
            >
              Go Home
            </Link>
          </div>

          {/* Mobile dropdown */}
          <div className="relative md:hidden">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-medium hover:bg-white/10"
              aria-expanded={menuOpen}
              aria-label="Open menu"
            >
              Menu ▾
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-white/15 bg-slate-950 shadow-xl">
                <div className="p-2">
                  {menuItems.map((item) => (
                    <button
                      key={item.href}
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        router.push(item.href);
                      }}
                      className="w-full rounded-xl px-3 py-2 text-left text-sm text-white/90 hover:bg-white/10"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Left card */}
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
            <h1 className="text-xl font-bold">Choose how you want to sign in</h1>
            <p className="mt-1 text-sm text-white/65">
              Select your role to continue. Homeowners can post jobs. Pros can view
              leads and manage work.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => router.push("/homeowner/signin")}
                className="rounded-2xl border border-emerald-400/30 bg-emerald-500/20 p-4 text-left hover:bg-emerald-500/25"
              >
                <div className="text-base font-semibold">I’m a Homeowner</div>
                <div className="mt-1 text-xs text-white/70">
                  Sign in to post a job
                </div>
              </button>

              <button
                type="button"
                onClick={() => router.push("/pro/sign-up")}
                className="rounded-2xl border border-sky-400/30 bg-sky-500/15 p-4 text-left hover:bg-sky-500/20"
              >
                <div className="text-base font-semibold">I’m a Pro</div>
                <div className="mt-1 text-xs text-white/70">
                  Sign up / sign in to view leads
                </div>
              </button>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => router.push("/homeowner/register")}
                className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium hover:bg-white/10"
              >
                Create Homeowner account
              </button>
              <button
                type="button"
                onClick={() => router.push("/pro/register")}
                className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium hover:bg-white/10"
              >
                Create Pro profile
              </button>
            </div>
          </section>

          {/* Right card */}
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
            <h2 className="text-lg font-bold">Quick actions</h2>
            <p className="mt-1 text-sm text-white/65">
              Jump directly to the most common pages.
            </p>

            <div className="mt-4 grid gap-3">
              <button
                type="button"
                onClick={() => router.push("/homeowner/post-job")}
                className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-emerald-400"
              >
                Post a Job
              </button>

              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => router.push("/jobs")}
                  className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium hover:bg-white/10"
                >
                  Browse available jobs
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/homeowner/dashboard")}
                  className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium hover:bg-white/10"
                >
                  Homeowner dashboard
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/pro/dashboard")}
                  className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium hover:bg-white/10"
                >
                  Pro dashboard
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/homeowner/profile")}
                  className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium hover:bg-white/10"
                >
                  Homeowner profile
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Sponsor footer */}
        <footer className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/55">
          Sponsored by Sista&apos;s Compassionate Care Services
        </footer>
      </main>
    </div>
  );
}
