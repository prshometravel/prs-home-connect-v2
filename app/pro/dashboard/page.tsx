"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

type JobRow = {
  id: string;
  title: string | null;
  description: string | null;
  category: string | null;
  status: string | null;
  created_at: string;
};

export default function ProDashboardPage() {
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setJobs(data || []);
      }

      setLoading(false);
    };

    fetchJobs();
  }, []);

  const claimJob = async (jobId: string) => {
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        alert(data.error || "Payment failed");
        return;
      }

      // ✅ Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      alert("Something went wrong");
    }
  };

  if (loading) {
    return <div className="p-6">Loading jobs...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Pro Dashboard</h1>
        <Link
          href="/jobs"
          className="px-4 py-2 rounded bg-blue-600 text-white"
        >
          Browse Jobs
        </Link>
      </div>

      {jobs.length === 0 && (
        <div className="text-gray-500">No jobs available</div>
      )}

      {jobs.map((job) => (
        <div
          key={job.id}
          className="border rounded-lg p-4 bg-slate-900 text-white"
        >
          <h2 className="text-lg font-semibold">{job.title}</h2>
          <p className="text-sm text-gray-300">{job.description}</p>

          <div className="mt-4 flex gap-3">
            <button
              onClick={() => claimJob(job.id)}
              className="px-4 py-2 rounded bg-green-600 hover:bg-green-700"
            >
              Claim ($10)
            </button>

            <button
              disabled
              className="px-4 py-2 rounded bg-gray-600 cursor-not-allowed"
            >
              Negotiate
            </button>

            <button
              disabled
              className="px-4 py-2 rounded bg-gray-700 cursor-not-allowed"
            >
              Hire
            </button>

            <button
              disabled
              className="px-4 py-2 rounded bg-gray-800 cursor-not-allowed"
            >
              Closed
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
