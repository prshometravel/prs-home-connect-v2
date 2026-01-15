"use client";

export const dynamic ="force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "../../lib/supabaseClient";

type JobRow = {
  id: string;
  title: string | null;
  description: string | null;
  category: string | null;
  status: string | null;
  created_at: string;
};

const STATUS_OPTIONS = ["Claim", "Negotiate", "Hire", "Closed"] as const;

function safeText(v: string | null | undefined) {
  return (v ?? "").trim();
}

async function safeReadJson(res: Response) {
  // Prevents: Unexpected token '<' ... not valid JSON
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return await res.json();
  }
  const text = await res.text();
  return { error: text || "Non-JSON response from server" };
}

export default function ProDashboardPage() {
  const searchParams = useSearchParams();

  // Stripe returns back to /pro/dashboard?paid=1&jobId=...
  const paid = searchParams.get("paid");
  const jobIdFromUrl = searchParams.get("jobId");

  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string>("");

  // local UI status override (even if DB update blocked by RLS)
  const [localStatus, setLocalStatus] = useState<Record<string, string>>({});

  // track claiming state per job
  const [claiming, setClaiming] = useState<Record<string, boolean>>({});

  const jobsSorted = useMemo(() => {
    return [...jobs].sort((a, b) => {
      const ad = new Date(a.created_at).getTime();
      const bd = new Date(b.created_at).getTime();
      return bd - ad;
    });
  }, [jobs]);

  // Load jobs
  useEffect(() => {
    let cancelled = false;

    async function loadJobs() {
      setLoading(true);
      setMsg("");

      const { data, error } = await supabase
        .from("jobs")
        .select("id,title,description,category,status,created_at")
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        setMsg(`Could not load jobs: ${error.message}`);
        setJobs([]);
      } else {
        setJobs((data as JobRow[]) || []);
      }

      setLoading(false);
    }

    loadJobs();

    return () => {
      cancelled = true;
    };
  }, []);

  // After Stripe success → claim the lead in DB
  useEffect(() => {
    // paid can be "1" or "0"
    if (!paid || !jobIdFromUrl) return;

    let cancelled = false;

    async function finalizeClaimAfterPayment() {
      try {
        if (paid === "0") {
          setMsg("Payment cancelled. Lead was not claimed.");
          return;
        }

        setMsg("Payment successful. Claiming lead...");

        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;

        if (!token) {
          setMsg("Please sign in first (no session token).");
          return;
        }

        const res = await fetch("/api/leads/claim", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ jobId: jobIdFromUrl }),
        });

        const json = await safeReadJson(res);

        if (cancelled) return;

        if (!res.ok) {
          setMsg(
            json?.error
              ? `Claim failed: ${json.error}`
              : "Claim failed (server error)."
          );
          return;
        }

        setMsg("Lead claimed successfully ✅");

        // Update UI status instantly
        setLocalStatus((prev) => ({ ...prev, [jobIdFromUrl]: "Claim" }));

        // Optionally refresh jobs list
        const { data, error } = await supabase
          .from("jobs")
          .select("id,title,description,category,status,created_at")
          .order("created_at", { ascending: false });

        if (!cancelled) {
          if (error) setMsg((m) => m + ` (Refresh warning: ${error.message})`);
          else setJobs((data as JobRow[]) || []);
        }
      } catch (e: any) {
        if (!cancelled) setMsg(`Claim failed: ${e?.message || "Unknown error"}`);
      }
    }

    finalizeClaimAfterPayment();

    return () => {
      cancelled = true;
    };
  }, [paid, jobIdFromUrl]);

  async function updateStatus(jobId: string, newStatus: string) {
    // Update UI instantly
    setLocalStatus((prev) => ({ ...prev, [jobId]: newStatus }));

    // Try to persist in DB (if RLS allows)
    const { error } = await supabase
      .from("jobs")
      .update({ status: newStatus })
      .eq("id", jobId);

    if (error) {
      console.warn("Status not saved to DB (RLS or missing column):", error.message);
      // keep UI status anyway
    }
  }

  async function claimLead(jobId: string) {
    try {
      setMsg("");
      setClaiming((prev) => ({ ...prev, [jobId]: true }));

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        alert("Please sign in first.");
        setClaiming((prev) => ({ ...prev, [jobId]: false }));
        return;
      }

      // Create Stripe checkout session
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ jobId }),
      });

      const json = await safeReadJson(res);

      if (!res.ok) {
        setMsg(json?.error ? `Stripe checkout failed: ${json.error}` : "Stripe checkout failed.");
        setClaiming((prev) => ({ ...prev, [jobId]: false }));
        return;
      }

      const url = json?.url;
      if (!url) {
        setMsg("Stripe checkout failed: missing checkout URL.");
        setClaiming((prev) => ({ ...prev, [jobId]: false }));
        return;
      }

      // Redirect to Stripe
      window.location.href = url;
    } catch (e: any) {
      setMsg(`Stripe checkout failed: ${e?.message || "Unknown error"}`);
    } finally {
      setClaiming((prev) => ({ ...prev, [jobId]: false }));
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      {/* Top Bar */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link
          href="/"
          className="rounded-lg bg-slate-800/70 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 active:scale-95"
        >
          ← Go Home
        </Link>

        <Link
          href="/pro/profile"
          className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10 active:scale-95"
        >
          My Profile
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Image src="/logo.png" alt="PRS Home Connect" width={50} height={50} />
        <h1 className="text-2xl font-bold">PRS Home Connect - Pro Dashboard</h1>
      </div>

      {/* Message */}
      {msg && (
        <div className="mb-4 rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
          {msg}
        </div>
      )}

      {/* Jobs */}
      {loading ? (
        <div className="text-white/70">Loading jobs...</div>
      ) : jobsSorted.length === 0 ? (
        <div className="text-white/70">No jobs posted yet.</div>
      ) : (
        <div className="space-y-4">
          {jobsSorted.map((job) => {
            const title = safeText(job.title) || safeText(job.category) || "Job";
            const desc = safeText(job.description) || "No description provided.";
            const currentStatus = localStatus[job.id] ?? job.status ?? "open";

            return (
              <div
                key={job.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-lg font-bold">{title}</div>
                    <div className="text-white/70 text-sm">{desc}</div>
                    <div className="mt-2 text-xs text-white/50">
                      Posted: {new Date(job.created_at).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 md:items-end">
                    <div className="text-sm">
                      <span className="text-white/60">Status:</span>{" "}
                      <span className="font-semibold">{currentStatus}</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {/* Status dropdown */}
                      <select
                        value={currentStatus}
                        onChange={(e) => updateStatus(job.id, e.target.value)}
                        className="rounded-lg bg-slate-800 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-green-400"
                      >
                        <option value="open">open</option>
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>

                      {/* Claim Lead button */}
                      <button
                        onClick={() => claimLead(job.id)}
                        disabled={!!claiming[job.id]}
                        className="rounded-lg bg-green-500 px-4 py-2 text-sm font-bold text-black hover:bg-green-400 disabled:opacity-60 active:scale-95"
                      >
                        {claiming[job.id] ? "Loading..." : "Claim Lead ($10)"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom spacing */}
      <div className="h-10" />
    </div>
  );
}
