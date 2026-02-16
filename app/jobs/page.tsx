"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type AnyObj = Record<string, any>;

type Job = {
  id: string;
  created_at?: string | null;
  title?: any;
  description?: any;
  category?: any;
  location?: any; // can be string OR object OR null
  status?: any; // open / claimed / complete (or variations)
  homeowner_id?: string | null;
  claimed_by?: string | null;
  hired_pro_id?: string | null;
};

const COLORS = {
  bg: "#0A1E3F",
  card: "#112B55",
  border: "#1F3B7A",
  text: "#EAF2FF",
  subtext: "#BBD0FF",
  green: "#22C55E",
  green2: "#16A34A",
  danger: "#EF4444",
};

function safeText(v: any): string {
  if (typeof v === "string") return v;
  if (v === null || v === undefined) return "";
  // if it’s something else (object/number), stringify safely
  try {
    return String(v);
  } catch {
    return "";
  }
}

function clean(v: any): string {
  const s = safeText(v);
  return typeof s === "string" ? s.trim() : "";
}

function fmtDate(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}

// location can be:
// - "Lawrenceville, GA"
// - JSON string: {"city":"Lawrenceville","state":"GA","stateLabel":"Georgia"}
// - object: { city, state, stateLabel }
function formatLocation(loc: any): string {
  if (!loc) return "Location not set";

  // string case
  if (typeof loc === "string") {
    const s = loc.trim();
    if (!s) return "Location not set";

    // try parse JSON if it looks like JSON
    if ((s.startsWith("{") && s.endsWith("}")) || (s.startsWith("[") && s.endsWith("]"))) {
      try {
        const parsed = JSON.parse(s);
        return formatLocation(parsed);
      } catch {
        // not JSON, treat as plain string
        return s;
      }
    }
    return s;
  }

  // object case
  if (typeof loc === "object") {
    const city = clean(loc.city);
    const state = clean(loc.state);
    const stateLabel = clean(loc.stateLabel);

    const stateText = stateLabel || state;
    const parts = [city, stateText].filter(Boolean);
    return parts.length ? parts.join(", ") : "Location not set";
  }

  return "Location not set";
}

function statusLabel(job: Job): "Open" | "Claimed" | "Complete" {
  const raw = clean(job.status).toLowerCase();

  // if your DB stores variations, normalize them:
  if (raw.includes("complete") || raw === "done" || raw === "closed") return "Complete";
  if (raw.includes("claim") || clean(job.claimed_by) || clean(job.hired_pro_id)) return "Claimed";
  return "Open";
}

export default function JobsPage() {
  const router = useRouter();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  async function loadJobs() {
    try {
      setErr("");
      setLoading(true);

      const res = await fetch("/api/jobs/list", { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load jobs (${res.status})`);

      const data = (await res.json()) as any;
      const list = Array.isArray(data) ? data : Array.isArray(data?.jobs) ? data.jobs : [];

      setJobs(list as Job[]);
    } catch (e: any) {
      setErr(e?.message || "Failed to load jobs");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  const normalized = useMemo(() => {
    return jobs.map((j) => {
      const title = clean(j.title) || "Job";
      const category = clean(j.category);
      const description = clean(j.description);
      const where = formatLocation(j.location);
      const posted = fmtDate(j.created_at);
      const status = statusLabel(j);

      return {
        ...j,
        _title: title,
        _category: category,
        _description: description,
        _where: where,
        _posted: posted,
        _status: status,
      };
    });
  }, [jobs]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        color: COLORS.text,
        padding: 16,
      }}
    >
      {/* Top bar */}
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto 14px auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => router.push("/")}
            style={{
              background: COLORS.green2,
              color: "#06210f",
              border: `1px solid ${COLORS.green}`,
              padding: "10px 14px",
              borderRadius: 10,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Home
          </button>

          <div style={{ fontSize: 18, fontWeight: 800 }}>Jobs</div>
        </div>

        <button
          onClick={loadJobs}
          style={{
            background: "transparent",
            color: COLORS.text,
            border: `1px solid ${COLORS.border}`,
            padding: "10px 14px",
            borderRadius: 10,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Refresh
        </button>
      </div>

      {/* Status / errors */}
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {err ? (
          <div
            style={{
              background: "rgba(239,68,68,0.14)",
              border: `1px solid ${COLORS.danger}`,
              color: COLORS.text,
              padding: 12,
              borderRadius: 12,
              marginBottom: 14,
              fontWeight: 700,
            }}
          >
            {err}
          </div>
        ) : null}

        {loading ? (
          <div
            style={{
              background: "rgba(255,255,255,0.06)",
              border: `1px solid ${COLORS.border}`,
              padding: 14,
              borderRadius: 12,
              fontWeight: 700,
            }}
          >
            Loading jobs…
          </div>
        ) : null}
      </div>

      {/* Cards list (ONE PER ROW) */}
      <div
        style={{
          maxWidth: 1100,
          margin: "12px auto 0 auto",
          display: "grid",
          gridTemplateColumns: "1fr", // ✅ ONE CARD PER ROW
          gap: 12,
        }}
      >
        {(!loading && normalized.length === 0) ? (
          <div
            style={{
              background: "rgba(255,255,255,0.06)",
              border: `1px solid ${COLORS.border}`,
              padding: 14,
              borderRadius: 12,
              color: COLORS.subtext,
              fontWeight: 700,
            }}
          >
            No jobs found.
          </div>
        ) : null}

        {normalized.map((j: any) => (
          <div
            key={j.id}
            style={{
              background: COLORS.card,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 14,
              padding: 14, // ✅ slightly smaller clean card
              boxShadow: "0 10px 28px rgba(0,0,0,0.25)",
            }}
          >
            {/* Header row */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 18, fontWeight: 900, lineHeight: 1.2 }}>
                  {j._title}
                </div>

                <div style={{ marginTop: 6, color: COLORS.subtext, fontWeight: 700 }}>
                  {j._category ? `${j._category} • ` : ""}{j._where}
                </div>
              </div>

              {/* Status pill (ONLY thing customer needs) */}
              <div
                style={{
                  background: j._status === "Complete"
                    ? "rgba(34,197,94,0.18)"
                    : j._status === "Claimed"
                      ? "rgba(34,197,94,0.12)"
                      : "rgba(255,255,255,0.08)",
                  border: `1px solid ${
                    j._status === "Complete" || j._status === "Claimed"
                      ? COLORS.green
                      : COLORS.border
                  }`,
                  color: j._status === "Open" ? COLORS.subtext : COLORS.text,
                  padding: "8px 12px",
                  borderRadius: 999,
                  fontWeight: 900,
                  whiteSpace: "nowrap",
                }}
              >
                {j._status}
              </div>
            </div>

            {/* Progress bar (simple, based on status) */}
            <div style={{ marginTop: 10 }}>
              <div
                style={{
                  height: 8,
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.10)",
                  border: `1px solid ${COLORS.border}`,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width:
                      j._status === "Complete"
                        ? "100%"
                        : j._status === "Claimed"
                          ? "55%"
                          : "10%",
                    background: COLORS.green,
                    borderRadius: 999,
                  }}
                />
              </div>

              <div style={{ marginTop: 6, color: COLORS.subtext, fontWeight: 700, fontSize: 12 }}>
                Progress: {j._status === "Complete" ? "100%" : j._status === "Claimed" ? "55%" : "10%"}
              </div>
            </div>

            {/* Description */}
            {j._description ? (
              <div
                style={{
                  marginTop: 10,
                  background: "rgba(255,255,255,0.06)",
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 12,
                  padding: 12,
                  color: COLORS.text,
                  fontWeight: 700,
                  lineHeight: 1.35,
                }}
              >
                {j._description}
              </div>
            ) : null}

            {/* Posted date only (NO ID) */}
            {j._posted ? (
              <div style={{ marginTop: 10, color: COLORS.subtext, fontWeight: 700, fontSize: 12 }}>
                Posted: {j._posted}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
