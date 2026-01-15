"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

type HomeownerProfile = {
  id: string;
  full_name: string | null;
  city: string | null;
  state: string | null;
};

const CATEGORY_OPTIONS = [
  "Cleaning",
  "Plumbing",
  "Electrical",
  "Handyman",
  "Painting",
  "Landscaping",
  "HVAC",
  "Roofing",
  "Flooring",
  "Moving",
  "Pressure Washing",
  "CNA / Home Care",
  "Security / Camera",
  "Other",
] as const;

/* 🔒 OFFICIAL PRS HOME CONNECT COLORS */
const BRAND = {
  bgDark: "#0b1220",
  bgMid: "#0f2f3a",
  stroke: "rgba(255,255,255,0.10)",
  glow: "rgba(60, 180, 255, 0.18)",
  accent: "#22e55a",
  accentHover: "#1db954",
};

export default function HomeownerDashboard() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [profile, setProfile] = useState<HomeownerProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [category, setCategory] = useState("");

  // form
  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");

  const hasProfile = useMemo(() => !!profile?.id, [profile]);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    setChecking(true);

    const { data } = await supabase.auth.getUser();
    const user = data?.user;

    if (!user) {
      router.push("/login");
      return;
    }

    setUserEmail(user.email ?? null);

    const { data: prof } = await supabase
      .from("homeowner_profiles")
      .select("id, full_name, city, state")
      .eq("id", user.id)
      .maybeSingle();

    if (prof) {
      setProfile(prof);
      setFullName(prof.full_name ?? "");
      setCity(prof.city ?? "");
      setStateVal(prof.state ?? "");
    }

    setChecking(false);
  }

  async function saveProfile() {
    setSaving(true);
    setMsg(null);

    const { data } = await supabase.auth.getUser();
    const user = data?.user;

    if (!user) {
      router.push("/login");
      return;
    }

    const payload = {
      id: user.id,
      full_name: fullName.trim() || null,
      city: city.trim() || null,
      state: stateVal.trim() || null,
    };

    const { error } = await supabase.from("homeowner_profiles").upsert(payload);

    if (error) {
      setMsg("Profile save failed.");
      setSaving(false);
      return;
    }

    setMsg("✅ Profile saved");
    setSaving(false);
  }

  function continuePostJob() {
    if (!category) return;
    router.push(`/post-job?category=${encodeURIComponent(category)}`);
  }

  return (
    <div
      className="min-h-screen text-white"
      style={{
        background: `linear-gradient(135deg, ${BRAND.bgDark}, ${BRAND.bgMid}, ${BRAND.bgDark})`,
      }}
    >
      {/* TOP BAR */}
      <div
        className="sticky top-0 z-10 backdrop-blur"
        style={{
          borderBottom: `1px solid ${BRAND.stroke}`,
          background: "rgba(10,16,28,0.55)",
        }}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div
              className="relative rounded-2xl"
              style={{
                width: 56,
                height: 56,
                border: `1px solid ${BRAND.stroke}`,
                background: "rgba(255,255,255,0.05)",
                boxShadow: `0 0 24px ${BRAND.glow}`,
              }}
            >
              <Image src="/logo.png" alt="PRS Home Connect" fill className="object-contain p-2" />
            </div>
            <div>
              <div className="font-extrabold">PRS Home Connect</div>
              <div className="text-xs text-white/60">Homeowner Dashboard</div>
            </div>
          </div>

          <Link
            href="/"
            className="rounded-2xl px-4 py-2 text-sm font-semibold"
            style={{
              border: `1px solid ${BRAND.stroke}`,
              background: "rgba(255,255,255,0.05)",
            }}
          >
            ⬅ Go Home
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6">
        {checking && <p className="text-center text-white/70">Loading…</p>}

        {!checking && (
          <>
            <div
              className="rounded-3xl p-5 mb-5"
              style={{
                border: `1px solid ${BRAND.stroke}`,
                background: "rgba(16,42,52,0.65)",
              }}
            >
              <h1 className="text-2xl font-extrabold">Homeowner Profile</h1>
              <p className="text-sm text-white/70 mt-1">
                Create this once before posting jobs.
              </p>
              {userEmail && (
                <p className="text-xs text-white/60 mt-2">Signed in as {userEmail}</p>
              )}

              <div className="grid gap-3 sm:grid-cols-2 mt-4">
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full name"
                  className="rounded-2xl px-3 py-2 bg-black/40 border border-white/10"
                />
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="rounded-2xl px-3 py-2 bg-black/40 border border-white/10"
                />
                <input
                  value={stateVal}
                  onChange={(e) => setStateVal(e.target.value)}
                  placeholder="State"
                  className="rounded-2xl px-3 py-2 bg-black/40 border border-white/10"
                />
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="rounded-2xl px-4 py-2 font-extrabold"
                  style={{ background: BRAND.accent, color: BRAND.bgDark }}
                >
                  {saving ? "Saving..." : hasProfile ? "Update Profile" : "Create Profile"}
                </button>
              </div>

              {msg && <p className="mt-2 text-sm">{msg}</p>}
            </div>

            {/* CATEGORY */}
            <div
              className="rounded-3xl p-5"
              style={{
                border: `1px solid ${BRAND.stroke}`,
                background: "rgba(16,42,52,0.55)",
              }}
            >
              <h2 className="font-extrabold mb-2">Choose a category</h2>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-2xl px-3 py-2 bg-black/40 border border-white/10"
              >
                <option value="">Select category</option>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c} className="text-black">
                    {c}
                  </option>
                ))}
              </select>

              <button
                onClick={continuePostJob}
                disabled={!category}
                className="mt-3 rounded-2xl px-4 py-2 font-extrabold"
                style={{ background: BRAND.accent, color: BRAND.bgDark }}
              >
                Continue
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
