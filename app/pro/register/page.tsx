"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

/* =======================
   BRAND COLORS (LOCKED)
======================= */
const BRAND = {
  bgDark: "#0b1220",
  bgMid: "#0f2f3a",
  stroke: "rgba(255,255,255,0.10)",
  glow: "rgba(60,180,255,0.18)",
  accent: "#22e55a",
};

/* =======================
   JOB SPECIALTIES
======================= */
const SPECIALTIES = [
  "Handyman",
  "Cleaning",
  "Deep Cleaning",
  "Move-in / Move-out Cleaning",
  "Plumbing",
  "Electrical",
  "HVAC / AC Repair",
  "Appliance Repair",
  "Painting (Interior)",
  "Painting (Exterior)",
  "Drywall / Sheetrock",
  "Carpentry",
  "Flooring (Tile)",
  "Flooring (Hardwood)",
  "Flooring (Vinyl / Laminate)",
  "Roofing",
  "Gutters",
  "Pressure Washing",
  "Landscaping",
  "Lawn Care",
  "Tree Service",
  "Pest Control",
  "Junk Removal",
  "Moving Help",
  "Furniture Assembly",
  "TV Mounting",
  "Home Security / Cameras",
  "Smart Home / Doorbell",
  "Garage Door",
  "Fence Repair",
  "Deck / Patio",
  "Concrete",
  "Windows / Doors",
  "Water Damage / Dry-out",
  "CNA / Home Care",
  "Elder Care",
  "Child Care",
  "Car Detailing",
  "Other",
];

export default function ProRegisterPage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [specialty, setSpecialty] = useState("Handyman");
  const [license, setLicense] = useState("");
  const [yearsExp, setYearsExp] = useState("");
  const [about, setAbout] = useState("");

  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* =======================
     CHECK SESSION
  ======================= */
  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    const { data } = await supabase.auth.getSession();
    if (data?.session?.user) {
      setUserId(data.session.user.id);
      loadProfile(data.session.user.id);
    }
  }

  async function loadProfile(id: string) {
    const { data } = await supabase
      .from("pro_profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!data) return;

    setFullName(data.full_name ?? "");
    setBusinessName(data.business_name ?? "");
    setPhone(data.phone ?? "");
    setLocation(data.location ?? "");
    setSpecialty(data.specialty ?? "Handyman");
    setLicense(data.license ?? "");
    setYearsExp(data.years_experience ?? "");
    setAbout(data.about ?? "");
  }

  /* =======================
     CREATE ACCOUNT
  ======================= */
  async function createAccount() {
    setMsg(null);
    setLoading(true);

    if (!email || password.length < 6) {
      setMsg("Email and password (min 6 chars) required.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMsg(error.message);
      setLoading(false);
      return;
    }

    setUserId(data.user!.id);
    setMsg("✅ Account created. Now complete your profile.");
    setLoading(false);
  }

  /* =======================
     SAVE PROFILE
  ======================= */
  async function saveProfile() {
    setMsg(null);
    setLoading(true);

    if (!userId) {
      setMsg("Create account first.");
      setLoading(false);
      return;
    }

    if (!fullName || !phone || !location || about.length < 20) {
      setMsg("Please complete all required fields.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("pro_profiles").upsert({
      id: userId,
      full_name: fullName,
      business_name: businessName,
      phone,
      location,
      specialty,
      license,
      years_experience: yearsExp,
      about,
    });

    if (error) {
      setMsg("Failed to save profile.");
      setLoading(false);
      return;
    }

    setMsg("✅ Pro profile saved!");
    setLoading(false);
    router.push("/pro/dashboard");
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
              <div className="text-xs text-white/60">Pro Sign-Up</div>
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

      {/* BODY */}
      <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        {!userId && (
          <div className="rounded-3xl p-6 bg-black/40 border border-white/10">
            <h2 className="text-xl font-extrabold">Step 1: Create Account</h2>
            <input
              className="mt-3 w-full rounded-xl p-2 bg-black/40 border border-white/10"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              className="mt-3 w-full rounded-xl p-2 bg-black/40 border border-white/10"
              placeholder="Password (min 6)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              onClick={createAccount}
              className="mt-4 w-full rounded-xl py-2 font-extrabold"
              style={{ background: BRAND.accent, color: BRAND.bgDark }}
            >
              Create Account
            </button>
          </div>
        )}

        <div className="rounded-3xl p-6 bg-black/40 border border-white/10">
          <h2 className="text-xl font-extrabold">Step 2: Pro Profile</h2>

          <input
            className="mt-3 w-full rounded-xl p-2 bg-black/40 border border-white/10"
            placeholder="Full Name *"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <input
            className="mt-3 w-full rounded-xl p-2 bg-black/40 border border-white/10"
            placeholder="Business Name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />

          <input
            className="mt-3 w-full rounded-xl p-2 bg-black/40 border border-white/10"
            placeholder="Phone *"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <input
            className="mt-3 w-full rounded-xl p-2 bg-black/40 border border-white/10"
            placeholder="City, State *"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <select
            className="mt-3 w-full rounded-xl p-2 bg-black/40 border border-white/10"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
          >
            {SPECIALTIES.map((s) => (
              <option key={s} value={s} className="text-black">
                {s}
              </option>
            ))}
          </select>

          <textarea
            className="mt-3 w-full rounded-xl p-2 bg-black/40 border border-white/10"
            placeholder="About you (min 20 characters)"
            rows={4}
            value={about}
            onChange={(e) => setAbout(e.target.value)}
          />

          <button
            onClick={saveProfile}
            className="mt-4 w-full rounded-xl py-2 font-extrabold"
            style={{ background: BRAND.accent, color: BRAND.bgDark }}
          >
            Save Profile & Continue
          </button>

          {msg && <p className="mt-3 text-sm">{msg}</p>}
        </div>
      </div>
    </div>
  );
}
