"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "../../_shared/supabase-browser";

type JobRow = {
  id: string;
  title: string | null;
  description: string | null;
  city: string | null;
  state: string | null;
  status: string | null;
  created_at: string | null;
};

export default function HomeownerDashboardPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowser(), []);

  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function loadJobs() {
    setJobsLoading(true);
    setError(null);

    const { data, error: jobsErr } = await supabase
      .from("jobs")
      .select("id,title,description,city,state,status,created_at")
      .order("created_at", { ascending: false });

    if (jobsErr) {
      setError(jobsErr.message);
      setJobs([]);
    } else {
      setJobs((data || []) as JobRow[]);
    }

    setJobsLoading(false);
  }

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setError(null);

      const { data, error: authErr } = await supabase.auth.getSession();
      if (!alive) return;

      if (authErr) {
        setError(authErr.message);
        setLoading(false);
        return;
      }

      if (!data.session) {
        router.replace("/signin");
        return;
      }

      setLoading(false);
      await loadJobs();
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, supabase]);

  async function handleSignOut() {
    setError(null);
    await supabase.auth.signOut();
    router.replace("/signin");
  }

  return (
    <main className="min-h-screen bg-[#061A33] text-white">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black">Homeowner Dashboard</h1>
            <p className="text-sm text-white/70">Jobs</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-extrabold hover:bg-white/10"
            >
              Home
            </Link>

            <button
              onClick={handleSignOut}
              className="rounded-xl bg-emerald-500 px-4 py-2 font-extrabold text-[#041425] hover:bg-emerald-400"
            >
              Sign Out
            </button>
          </div>
        </header>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 p-4">
            <div className="font-extrabold text-red-200">Error</div>
            <div className="mt-1 text-red-100/90">{error}</div>
          </div>
        )}

        <section className="mt-6 rounded-2xl border border-white/10 bg-[#0B2A52] p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-black">All Jobs</h2>
            <button
              onClick={loadJobs}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-extrabold hover:bg-white/10"
              disabled={loading || jobsLoading}
            >
              {jobsLoading ? "Loading..." : "Refresh"}
            </button>
          </div>

          <div className="mt-4">
            {loading ? (
              <div className="text-white/70 font-semibold">Loading...</div>
            ) : jobsLoading ? (
              <div className="text-white/70 font-semibold">Loading jobs...</div>
            ) : jobs.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-[#051C37] p-4">
                <div className="font-extrabold">No jobs</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {jobs.map((j) => (
                  <div
                    key={j.id}
                    className="rounded-2xl border border-white/10 bg-[#051C37] p-4"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="truncate text-lg font-black">
                          {j.title || "Untitled Job"}
                        </div>

                        <div className="mt-1 text-sm text-white/70">
                          {(j.city || "") + (j.state ? `, ${j.state}` : "")}
                        </div>

                        {j.description ? (
                          <div className="mt-2 text-sm text-white/70">
                            {j.description}
                          </div>
                        ) : null}
                      </div>

                      <div className="flex flex-row flex-wrap gap-2 sm:flex-col sm:items-end">
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold">
                          {j.status || "open"}
                        </span>
                        <span className="text-xs text-white/60">
                          {j.created_at
                            ? new Date(j.created_at).toLocaleString()
                            : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
