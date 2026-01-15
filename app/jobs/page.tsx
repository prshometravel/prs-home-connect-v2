"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "../../lib/supabaseClient";

type Job = {
  id: string;
  title: string | null;
  description: string | null;
  created_at: string;
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("jobs")
      .select("id, title, description, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      setJobs([]);
    } else {
      setJobs(data || []);
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-14 w-14 rounded-xl border border-white/10 bg-white/5">
              <Image
                src="/logo.png"
                alt="PRS Home Connect"
                fill
                className="object-contain p-2"
              />
            </div>
            <h1 className="text-3xl font-extrabold text-green-400">
              Available Jobs
            </h1>
          </div>

          <div className="flex gap-3">
            <Link
              href="/"
              className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10"
            >
              ← Go Home
            </Link>

            <Link
              href="/post-job"
              className="rounded-xl bg-green-500 px-4 py-2 text-sm font-extrabold text-slate-950 hover:bg-green-400"
            >
              + Post a Job
            </Link>
          </div>
        </div>

        {/* CONTENT */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
          {loading && <p className="text-white/70">Loading jobs…</p>}

          {error && (
            <p className="font-semibold text-red-400">
              Supabase error: {error}
            </p>
          )}

          {!loading && !error && jobs.length === 0 && (
            <p className="text-white/70">
              No jobs found yet. Post a job to see it here.
            </p>
          )}

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="rounded-xl border border-white/10 bg-slate-900/40 p-4"
              >
                <h3 className="text-lg font-bold">
                  {job.title || "Untitled Job"}
                </h3>

                <p className="mt-1 text-white/80">
                  {job.description || "No description provided."}
                </p>

                <p className="mt-2 text-xs text-white/60">
                  Posted {new Date(job.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
	

