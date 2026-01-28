"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Job = {
  id: string;
  title?: string | null;
  description?: string | null;
  category?: string | null;
  location?: string | null;
  status?: string | null;
  created_at?: string | null;
};

export default function JobsPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // (Optional) search box — default shows ALL jobs. Only filters if user types.
  const [q, setQ] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/jobs/list", { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to load jobs (${res.status})`);

        const data = await res.json();

        // Your API might return array directly or { jobs: [...] }
        const list: Job[] = Array.isArray(data) ? data : Array.isArray(data?.jobs) ? data.jobs : [];

        if (!cancelled) setJobs(list);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load jobs");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const shownJobs = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return jobs; // SHOW ALL by default

    return jobs.filter((j) => {
      const t = (j.title || "").toLowerCase();
      const c = (j.category || "").toLowerCase();
      const l = (j.location || "").toLowerCase();
      const d = (j.description || "").toLowerCase();
      return t.includes(term) || c.includes(term) || l.includes(term) || d.includes(term);
    });
  }, [jobs, q]);

  return (
    <div className="min-h-screen bg-[#0A1E3F] text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-green-500">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="bg-[#112B55] border border-green-500 px-3 py-2 rounded-lg text-sm font-bold"
          >
            Home
          </button>
          <h1 className="text-xl font-extrabold text-green-400">Jobs</h1>
        </div>

        {/* Dropdown */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="bg-green-500 text-black px-4 py-2 rounded-lg font-extrabold"
          >
            Menu ▼
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-lg bg-white text-black shadow-lg">
              <a className="block px-4 py-2 hover:bg-gray-100" href="/">
                Home
              </a>
              <a className="block px-4 py-2 hover:bg-gray-100" href="/homeowner/post-job">
                Post a Job
              </a>
              <a className="block px-4 py-2 hover:bg-gray-100" href="/homeowner/dashboard">
                Homeowner Dashboard
              </a>
              <a className="block px-4 py-2 hover:bg-gray-100" href="/pro/dashboard">
                Pro Dashboard
              </a>
              <a className="block px-4 py-2 hover:bg-gray-100" href="/signin">
                Sign In
              </a>
            </div>
          )}
        </div>
      </header>

      {/* Body */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        {/* Top actions */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 justify-between mb-5">
          <div className="flex gap-2">
            <button
              onClick={() => router.push("/homeowner/post-job")}
              className="bg-green-500 text-black px-4 py-2 rounded-lg font-extrabold"
            >
              Post a Job
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#112B55] border border-green-500 px-4 py-2 rounded-lg font-bold"
            >
              Refresh
            </button>
          </div>

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search (optional) — all jobs show by default"
            className="w-full md:w-[420px] bg-[#112B55] border border-green-500 rounded-lg px-4 py-2 text-white placeholder:text-white/60"
          />
        </div>

        {/* Status */}
        <div className="mb-4">
          {loading ? (
            <div className="bg-[#112B55] border border-green-500 rounded-xl p-4">
              Loading jobs…
            </div>
          ) : error ? (
            <div className="bg-[#112B55] border border-red-400 rounded-xl p-4 text-red-200">
              {error}
            </div>
          ) : (
            <div className="bg-[#112B55] border border-green-500 rounded-xl p-4">
              <span className="text-green-400 font-extrabold">{shownJobs.length}</span>{" "}
              job(s) showing
              {q.trim() ? (
                <span className="text-white/70"> (search applied)</span>
              ) : (
                <span className="text-white/70"> (full list)</span>
              )}
            </div>
          )}
        </div>

        {/* LONG LIST (no short list) */}
        <div className="grid gap-4">
          {shownJobs.map((job) => (
            <div
              key={job.id}
              className="bg-[#112B55] border border-green-500 rounded-2xl p-5 shadow-lg"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-xl md:text-2xl font-extrabold text-green-300 break-words">
                    {job.title || "Untitled Job"}
                  </h2>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#0A1E3F] border border-green-500 text-sm font-bold">
                      {job.category || "Category"}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-[#0A1E3F] border border-green-500 text-sm font-bold">
                      {job.location || "Location"}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-green-500 text-black text-sm font-extrabold">
                      {job.status || "open"}
                    </span>
                  </div>

                  <p className="mt-3 text-white/90 whitespace-pre-wrap break-words">
                    {job.description || "No description"}
                  </p>
                </div>

                <div className="flex gap-2 md:flex-col md:items-end">
                  <button
                    onClick={() => router.push(`/jobs/${job.id}`)}
                    className="bg-green-500 text-black px-4 py-2 rounded-lg font-extrabold"
                  >
                    View
                  </button>
                  <button
                    onClick={() => router.push(`/jobs/${job.id}?action=claim`)}
                    className="bg-[#0A1E3F] border border-green-500 px-4 py-2 rounded-lg font-bold"
                  >
                    Claim
                  </button>
                </div>
              </div>
            </div>
          ))}

          {!loading && !error && shownJobs.length === 0 && (
            <div className="bg-[#112B55] border border-green-500 rounded-xl p-6 text-center">
              No jobs found.
            </div>
          )}
        </div>

        {/* Footer spacing to make list feel LONG on mobile */}
        <div className="h-16" />
      </main>
    </div>
  );
}
