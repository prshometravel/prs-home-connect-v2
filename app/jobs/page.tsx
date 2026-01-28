"use client";

import React, { useEffect, useMemo, useState } from "react";

type Job = {
  id: string;
  created_at?: string | null;
  title?: string | null;
  description?: string | null;
  category?: string | null;
  location?: string | null;
  status?: string | null;
  address?: string | null;
  homeowner_id?: string | null;
  customer_id?: string | null;
  claimed_by?: string | null;
  hired_pro_id?: string | null;
  lead_fee_paid?: boolean | null;
};

const COLORS = {
  bg: "#0A1E3F",
  card: "#112B55",
  card2: "#0E254A",
  border: "#1F3B7A",
  text: "#EAF2FF",
  subtext: "#BBD0FF",
  green: "#22C55E",
  green2: "#16A34A",
  danger: "#EF4444",
};

function fmtDate(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}

function statusLabel(s?: string | null) {
  const v = (s || "").toLowerCase();
  if (!v) return "Open";
  if (v.includes("claim")) return "Claimed";
  if (v.includes("hire")) return "Hired";
  if (v.includes("close")) return "Closed";
  if (v.includes("nego")) return "Negotiating";
  return s || "Open";
}

function statusStyles(s?: string | null) {
  const v = (s || "").toLowerCase();
  if (v.includes("close")) return { bg: "#0b2a24", bd: "#16a34a", tx: "#86efac" };
  if (v.includes("hire")) return { bg: "#0b243d", bd: "#38bdf8", tx: "#a5f3fc" };
  if (v.includes("claim")) return { bg: "#2a1b0b", bd: "#f59e0b", tx: "#fde68a" };
  if (v.includes("nego")) return { bg: "#261a35", bd: "#a78bfa", tx: "#ddd6fe" };
  return { bg: "#0b1e3a", bd: "#60a5fa", tx: "#bfdbfe" };
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  async function loadJobs() {
    try {
      setErr("");
      setLoading(true);
      const res = await fetch("/api/jobs/list", { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load jobs (${res.status})`);
      const data = (await res.json()) as Job[];
      setJobs(Array.isArray(data) ? data : []);
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return jobs; // SHOW ALL BY DEFAULT
    return jobs.filter((j) => {
      const hay = [
        j.title,
        j.description,
        j.category,
        j.location,
        j.status,
        j.address,
        j.id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [jobs, query]);

  const total = jobs.length;
  const showing = filtered.length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${COLORS.bg} 0%, #071633 100%)`,
        color: COLORS.text,
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: `linear-gradient(180deg, #0B2349 0%, #081C3B 100%)`,
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "12px 14px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <button
            onClick={() => (window.location.href = "/")}
            style={{
              border: `1px solid ${COLORS.border}`,
              background: "#0B2349",
              color: COLORS.text,
              padding: "8px 12px",
              borderRadius: 10,
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Home
          </button>

          <div style={{ fontWeight: 900, letterSpacing: 0.3 }}>Jobs</div>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => {
                setMenuOpen((v) => !v);
              }}
              style={{
                border: `1px solid ${COLORS.border}`,
                background: "#0B2349",
                color: COLORS.text,
                padding: "8px 12px",
                borderRadius: 10,
                cursor: "pointer",
                fontWeight: 800,
              }}
            >
              Menu ▾
            </button>

            {menuOpen && (
              <div
                style={{
                  position: "absolute",
                  right: 16,
                  top: 56,
                  width: 220,
                  background: COLORS.card,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 14,
                  boxShadow: "0 14px 30px rgba(0,0,0,0.35)",
                  overflow: "hidden",
                }}
              >
                <MenuItem label="Home" href="/" onPick={() => setMenuOpen(false)} />
                <MenuItem label="Post a Job" href="/homeowner/post-job" onPick={() => setMenuOpen(false)} />
                <MenuItem label="Homeowner Dashboard" href="/homeowner/dashboard" onPick={() => setMenuOpen(false)} />
                <MenuItem label="Pro Dashboard" href="/pro/dashboard" onPick={() => setMenuOpen(false)} />
                <MenuItem label="Sign In" href="/signin" onPick={() => setMenuOpen(false)} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 14px 28px" }}>
        {/* Controls */}
        <div
          style={{
            background: `linear-gradient(180deg, ${COLORS.card} 0%, ${COLORS.card2} 100%)`,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 18,
            padding: 14,
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
            <button
              onClick={() => (window.location.href = "/homeowner/post-job")}
              style={{
                border: "none",
                background: `linear-gradient(180deg, ${COLORS.green} 0%, ${COLORS.green2} 100%)`,
                color: "#05220f",
                padding: "10px 14px",
                borderRadius: 12,
                cursor: "pointer",
                fontWeight: 900,
              }}
            >
              Post a Job
            </button>

            <button
              onClick={loadJobs}
              style={{
                border: `1px solid ${COLORS.border}`,
                background: "#0B2349",
                color: COLORS.text,
                padding: "10px 14px",
                borderRadius: 12,
                cursor: "pointer",
                fontWeight: 900,
              }}
            >
              Refresh
            </button>

            <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search (optional) — all jobs show by default"
                style={{
                  width: 360,
                  maxWidth: "100%",
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: `1px solid ${COLORS.border}`,
                  background: "#071A34",
                  color: COLORS.text,
                  outline: "none",
                }}
              />

              <div style={{ fontSize: 12, color: COLORS.subtext, fontWeight: 700 }}>
                Showing {showing} / {total}
              </div>
            </div>
          </div>

          {/* Error / Loading */}
          {err && (
            <div
              style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 12,
                border: `1px solid ${COLORS.danger}`,
                background: "#2b0d10",
                color: "#fecaca",
                fontWeight: 700,
              }}
            >
              {err}
            </div>
          )}

          {loading && (
            <div style={{ marginTop: 12, color: COLORS.subtext, fontWeight: 700 }}>Loading jobs…</div>
          )}
        </div>

        {/* Long List */}
        <div
          style={{
            marginTop: 14,
            background: `linear-gradient(180deg, ${COLORS.card} 0%, ${COLORS.card2} 100%)`,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 18,
            padding: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
            <div style={{ fontSize: 18, fontWeight: 900 }}>All Jobs</div>
            <div style={{ fontSize: 12, color: COLORS.subtext, fontWeight: 700 }}>
              Scroll the list — it stays long and shows everything.
            </div>
          </div>

          <div
            style={{
              marginTop: 12,
              maxHeight: 560, // LONG LIST AREA
              overflowY: "auto",
              paddingRight: 6,
            }}
          >
            {!loading && !err && filtered.length === 0 && (
              <div style={{ color: COLORS.subtext, fontWeight: 700, padding: 12 }}>
                No jobs found for that search.
              </div>
            )}

            <div style={{ display: "grid", gap: 12 }}>
              {filtered.map((j, idx) => {
                const st = statusStyles(j.status);
                const title = (j.title || "").trim() || "Job";
                const category = (j.category || "").trim();
                const location = (j.location || "").trim();
                const desc = (j.description || "").trim();
                const created = fmtDate(j.created_at);

                return (
                  <div
                    key={j.id || idx}
                    style={{
                      borderRadius: 16,
                      border: `1px solid ${COLORS.border}`,
                      background: "#071A34",
                      padding: 14,
                      display: "grid",
                      gap: 10,
                    }}
                  >
                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      <div style={{ fontWeight: 900, fontSize: 16 }}>{title}</div>

                      <span
                        style={{
                          marginLeft: "auto",
                          padding: "6px 10px",
                          borderRadius: 999,
                          background: st.bg,
                          border: `1px solid ${st.bd}`,
                          color: st.tx,
                          fontWeight: 900,
                          fontSize: 12,
                        }}
                      >
                        {statusLabel(j.status)}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", color: COLORS.subtext, fontWeight: 700 }}>
                      {category && <span>Category: {category}</span>}
                      {location && <span>Location: {location}</span>}
                      {created && <span>Posted: {created}</span>}
                    </div>

                    {desc && (
                      <div style={{ color: COLORS.text, lineHeight: 1.4 }}>
                        {desc}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <button
                        onClick={() => alert(`Job ID: ${j.id}`)}
                        style={{
                          border: `1px solid ${COLORS.border}`,
                          background: "#0B2349",
                          color: COLORS.text,
                          padding: "10px 12px",
                          borderRadius: 12,
                          cursor: "pointer",
                          fontWeight: 900,
                        }}
                      >
                        View Details
                      </button>

                      <button
                        onClick={() => (window.location.href = "/homeowner/post-job")}
                        style={{
                          border: "none",
                          background: `linear-gradient(180deg, ${COLORS.green} 0%, ${COLORS.green2} 100%)`,
                          color: "#05220f",
                          padding: "10px 12px",
                          borderRadius: 12,
                          cursor: "pointer",
                          fontWeight: 900,
                        }}
                      >
                        Post Another Job
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 14, color: "#9db7ff", fontSize: 12, textAlign: "center", opacity: 0.95 }}>
          Sponsored by Sista&apos;s Compassionate Care Services • Built by PRS Home Improvement and Security LLC
        </div>
      </div>
    </div>
  );
}

function MenuItem({
  label,
  href,
  onPick,
}: {
  label: string;
  href: string;
  onPick: () => void;
}) {
  return (
    <button
      onClick={() => {
        onPick();
        window.location.href = href;
      }}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "12px 12px",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        color: "#EAF2FF",
        fontWeight: 900,
      }}
      onMouseEnter={(e) => ((e.currentTarget.style.background = "#0B2349"))}
      onMouseLeave={(e) => ((e.currentTarget.style.background = "transparent"))}
    >
      {label}
    </button>
  );
}
