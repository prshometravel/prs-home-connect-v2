import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-950 via-slate-950 to-black text-white">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="PRS Home Connect"
            width={44}
            height={44}
            priority
          />
          <div className="leading-tight">
            <div className="text-lg font-semibold">PRS Home Connect</div>
            <div className="text-xs text-white/70">
              by PRS Home Improvement and Security LLC
            </div>
          </div>
        </Link>

        <nav className="flex items-center gap-3">
          <Link
            href="/jobs"
            className="rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/15"
          >
            Browse Jobs
          </Link>
          <Link
            href="/post-job"
            className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-black hover:bg-emerald-400"
          >
            Post a Job
          </Link>
          <Link
            href="/signin"
            className="rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/15"
          >
            Sign in
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-5xl px-6 pt-10 pb-16">
        <h1 className="text-3xl font-bold sm:text-4xl">
          Find trusted pros. Get jobs done fast.
        </h1>
        <p className="mt-3 max-w-2xl text-white/75">
          Post a job, get matched, and move from claim → negotiate → hire → closed.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/post-job"
            className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-black hover:bg-emerald-400"
          >
            Post a Job
          </Link>
          <Link
            href="/pro/register"
            className="rounded-xl bg-white/10 px-5 py-3 text-sm hover:bg-white/15"
          >
            Join as a Pro
          </Link>
          <Link
            href="/homeowner/register"
            className="rounded-xl bg-white/10 px-5 py-3 text-sm hover:bg-white/15"
          >
            Create Homeowner Account
          </Link>
        </div>
      </section>

      <footer className="mx-auto max-w-5xl px-6 pb-10 text-xs text-white/60">
        © {new Date().getFullYear()} PRS Home Connect
      </footer>
    </main>
  );
}
