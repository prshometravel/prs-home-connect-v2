"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type Job = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  city: string | null;
  state: string | null;
  status: string | null;
  created_at: string;
  claimed_by?: string | null;
};

const STATUS_OPTIONS = [
  "open",
  "claimed",
  "start",
  "complete",
  "close",
  "hired",
  "not hired",
] as const;

const US_STATES = [
  { code: "", name: "All states" },
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

export default function ProDashboard() {
  const supabase = createClient();

  const [userId, setUserId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // ✅ Green processing line (per job)
  const [processingJobId, setProcessingJobId] = useState<string | null>(null);

  const loadAll = async () => {
    setLoading(true);
    setErrMsg(null);

    // Get user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setUserId(null);
      setJobs([]);
      setLoading(false);
      setErrMsg("Please sign in as a pro to view jobs.");
      return;
    }

    setUserId(user.id);

    // ✅ IMPORTANT: simple select only (no JSON operators, no weird views)
    const { data, error } = await supabase
      .from("jobs")
      .select("id,title,description,category,city,state,status,created_at,claimed_by")
      .order("created_at", { ascending: false });

    if (error) {
      setErrMsg(error.message);
      setJobs([]);
      setLoading(false);
      return;
    }

    setJobs((data as Job[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredJobs = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return jobs.filter((job) => {
      // search
      const blob = `${job.title ?? ""} ${job.description ?? ""} ${job.category ?? ""} ${job.city ?? ""} ${job.state ?? ""}`.toLowerCase();
      if (qq && !blob.includes(qq)) return false;

      // state filter
      if (stateFilter && (job.state || "") !== stateFilter) return false;

      // status filter
      if (statusFilter && (job.status || "open") !== statusFilter) return false;

      return true;
    });
  }, [jobs, q, stateFilter, statusFilter]);

  const claimJob = async (jobId: string) => {
    if (!userId) {
      alert("Login required");
      return;
    }

    setErrMsg(null);
    setProcessingJobId(jobId); // ✅ start green line

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jobId, proUserId: userId }),
      });

      const data = await res.json();

      if (data?.url) {
        // keep processing ON until redirect
        window.location.href = data.url;
        return;
      }

      setProcessingJobId(null);
      setErrMsg(data?.error || "Stripe checkout failed.");
    } catch (e) {
      setProcessingJobId(null);
      setErrMsg("Stripe checkout failed.");
    }
  };

  // Optional: status update (only if your RLS allows it)
  const updateStatus = async (jobId: string, nextStatus: string) => {
    setErrMsg(null);
    const { error } = await supabase
      .from("jobs")
      .update({ status: nextStatus })
      .eq("id", jobId);

    if (error) {
      setErrMsg(error.message);
      return;
    }

    // refresh local
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: nextStatus } : j))
    );
  };

  return (
    <div className="min-h-screen bg-[#071a2b] text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-white/10 bg-[#061526]/95 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold">Pro Dashboard</h1>
              <p className="text-xs text-white/70">
                Real jobs • Claim ($10) • Start • Complete • Close • Hired • Not hired
              </p>
            </div>
            <div className="flex items-center gap-2">
  <Link
    href="/"
    className="rounded-lg bg-white/10 px-3 py-2 text-white hover:bg-white/20"
  >
    Home
  </Link>

  <Link
    href="/signin"
    className="rounded-lg bg-white/10 px-3 py-2 text-white"
  >
    Sign in
  </Link>

  <button
    onClick={loadAll}
    className="rounded-lg bg-green-500 px-3 py-2 text-white"
  >
    Refresh
  </button>
</div>
          </div>

          {/* Filters */}
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search jobs..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/40 focus:border-green-400/60"
            />

            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-green-400/60"
            >
              {US_STATES.map((s) => (
                <option key={s.code} value={s.code} className="text-black">
                  {s.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-green-400/60"
            >
              <option value="" className="text-black">
                All statuses
              </option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s} className="text-black">
                  {s}
                </option>
              ))}
            </select>
          </div>

          {errMsg && (
            <div className="mt-3 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errMsg}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-5xl px-4 py-6">
        <h2 className="mb-3 text-lg font-semibold">Available Jobs</h2>

        {loading ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-white/70">
            Loading jobs...
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-white/70">
            No jobs found.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredJobs.map((job) => {
              const status = job.status || "open";
              const isProcessing = processingJobId === job.id;

              return (
                <div
                  key={job.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-lg font-bold">{job.title}</h3>
                      {job.description && (
                        <p className="mt-1 text-sm text-white/80">
                          {job.description}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-white/60">
                        {(job.city || "City")} , {(job.state || "State")} •{" "}
                        {(job.category || "Category")} • Status:{" "}
                        <span className="text-white">{status}</span>
                      </p>
                    </div>

                    <div className="flex w-full flex-col gap-2 md:w-52">
                      <button
                        onClick={() => claimJob(job.id)}
                        disabled={isProcessing}
                        className="w-full rounded-xl bg-green-500 px-4 py-3 text-sm font-bold text-black hover:bg-green-400 disabled:opacity-60"
                      >
                        {isProcessing ? "Processing…" : "Claim ($10)"}
                      </button>

                      {/* ✅ Green processing line */}
                      {isProcessing && (
                        <div className="mt-1">
                          <div className="h-1 w-full overflow-hidden rounded bg-white/10">
                            <div className="h-1 w-1/2 animate-pulse rounded bg-green-400" />
                          </div>
                          <p className="mt-2 text-xs text-green-300">
                            Processing payment…
                          </p>
                        </div>
                      )}

                      {/* Status controls (optional) */}
                      <select
                        value={status}
                        onChange={(e) => updateStatus(job.id, e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-green-400/60"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s} className="text-black">
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-10 text-center text-xs text-white/40">
          PRS Home Connect • Pro Dashboard
        </div>
      </div>
    </div>
  );
}
