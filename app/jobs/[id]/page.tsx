"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Job = {
  id: string;
  title?: string;
  description?: string;
  category?: string;
  location?: string;
  status?: string;
  created_at?: string;
  address?: string | null;
};

export default function JobViewPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const jobId = useMemo(() => {
    const raw: any = params?.id;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params]);

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    if (!jobId) return;

    let cancelled = false;

    async function run() {
      try {
        setLoading(true);
        setErr("");

        const res = await fetch(`/api/jobs/${jobId}`, { cache: "no-store" });
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json?.error || `Failed to load job (${res.status})`);
        }

        if (!cancelled) setJob(json.job || null);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "Failed to load job");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#071a2b",
        color: "#e8f0ff",
        padding: 16,
      }}
    >
      <div
        style={{
          maxWidth: 950,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              onClick={() => router.back()}
              style={{
                background: "transparent",
                color: "#bcd7ff",
                border: "1px solid rgba(82,170,255,.45)",
                padding: "10px 14px",
                borderRadius: 12,
                cursor: "pointer",
              }}
            >
              Back
            </button>

            <button
              onClick={() => router.push("/jobs")}
              style={{
                background: "transparent",
                color: "#bcd7ff",
                border: "1px solid rgba(82,170,255,.45)",
                padding: "10px 14px",
                borderRadius: 12,
                cursor: "pointer",
              }}
            >
              Jobs
            </button>
          </div>

          <div
            style={{
              background: "rgba(57, 211, 83, 0.12)",
              border: "1px solid rgba(57, 211, 83, 0.35)",
              color: "#39d353",
              padding: "8px 12px",
              borderRadius: 999,
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            Job Details
          </div>
        </div>

        <div
          style={{
            border: "1px solid rgba(82,170,255,.35)",
            borderRadius: 18,
            padding: 16,
            background: "rgba(255,255,255,0.04)",
          }}
        >
          {loading && <div>Loading...</div>}

          {!loading && err && (
            <div
              style={{
                border: "1px solid rgba(255,80,80,.5)",
                background: "rgba(255,80,80,.08)",
                padding: 12,
                borderRadius: 14,
              }}
            >
              {err}
            </div>
          )}

          {!loading && !err && job && (
            <>
              <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>
                {job.title || "Untitled Job"}
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {job.category && pill(job.category)}
                {job.location && pill(job.location)}
                {job.status && pill(job.status, true)}
              </div>

              <div style={{ marginTop: 14, lineHeight: 1.5, opacity: 0.95 }}>
                {job.description || "No description provided."}
              </div>

              {job.address ? (
                <div style={{ marginTop: 12, opacity: 0.9 }}>
                  <b>Address:</b> {job.address}
                </div>
              ) : null}

              <div style={{ marginTop: 12, opacity: 0.7, fontSize: 12 }}>
                Job ID: {job.id}
              </div>
            </>
          )}

          {!loading && !err && !job && (
            <div>No job found for this link.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function pill(text: string, green = false) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        color: green ? "#39d353" : "#cfe2ff",
        border: green
          ? "1px solid rgba(57,211,83,.45)"
          : "1px solid rgba(82,170,255,.35)",
        background: green
          ? "rgba(57,211,83,.10)"
          : "rgba(82,170,255,.08)",
      }}
    >
      {text}
    </span>
  );
}
