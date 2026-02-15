"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
];

const JOB_CATEGORIES = [
  "Electrical",
  "Plumbing",
  "HVAC",
  "Handyman",
  "Carpentry",
  "Drywall",
  "Painting",
  "Flooring",
  "Tile",
  "Roofing",
  "Siding",
  "Landscaping",
  "Tree Service",
  "Cleaning",
  "Junk Removal",
  "Moving",
  "Appliance Repair",
  "Smart Home / Security",
  "TV Mounting",
  "Furniture Assembly",
  "Kitchen Remodel",
  "Bathroom Remodel",
  "Basement Remodel",
  "Concrete",
  "Masonry",
  "Welding",
  "Pest Control",
  "Pressure Washing",
  "Windows / Doors",
  "Garage Door",
  "Pool Service",
  "Auto / Mechanic",
  "Locksmith",
  "IT / Tech Support",
  "Photography / Video",
  "Tutoring",
  "Personal Training",
  "Delivery / Driver",
  "Errands",
  "Pet Care",
  "Child Care",
  "Senior Care",
  "CNA",
  "Home Health Aide",
  "Nursing (RN/LPN)",
  "Medical Transport",
];

export default function ProCreatePage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");

  const [state, setState] = useState("GA");
  const [city, setCity] = useState("");
  const [primaryCategory, setPrimaryCategory] = useState("Handyman");

  const [license, setLicense] = useState("");
  const [yearsExperience, setYearsExperience] = useState<number | "">( "");
  const [insured, setInsured] = useState(false);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onCreate() {
    setErr(null);

    // basic validation
    if (!email || !password) return setErr("Email and password are required.");
    if (password.length < 6) return setErr("Password must be at least 6 characters.");
    if (!fullName) return setErr("Full name is required.");
    if (!phone) return setErr("Phone number is required.");
    if (!city) return setErr("City is required.");

    setLoading(true);

    try {
      // 1) Create auth user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) throw signUpError;

      const userId = signUpData.user?.id;
      if (!userId) throw new Error("User not created. Check Supabase Auth settings.");

      // 2) Create pro profile (table must exist)
      // If your table name/columns differ, tell me the exact columns and I’ll match them.
      const { error: insertError } = await supabase.from("pro_profiles").insert({
        id: userId,
        full_name: fullName,
        business_name: businessName || null,
        phone: phone,
        state: state,
        city: city,
        primary_category: primaryCategory,
        license: license || null,
        years_experience: yearsExperience === "" ? null : Number(yearsExperience),
        insured: insured,
        role: "pro",
        created_at: new Date().toISOString(),
      });

      if (insertError) throw insertError;

      // 3) Force user to SIGN IN (your requested flow)
      await supabase.auth.signOut();
      router.push("/signin?next=/pro/dashboard");
    } catch (e: any) {
      setErr(e?.message || "Failed to create pro account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0B1B3A] px-4 py-8">
      <div className="mx-auto w-full max-w-2xl">
        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <h1 className="text-white text-2xl font-semibold">Create Pro Account</h1>
            <p className="text-white/70 text-sm mt-1">
              Build your pro profile so homeowners can find you.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="shrink-0 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-white hover:bg-white/10"
          >
            Home
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Email">
              <input
                className="w-full rounded-xl bg-white/5 border border-white/10 text-white px-4 py-3 outline-none focus:border-[#22c55e]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                autoComplete="email"
              />
            </Field>

            <Field label="Password">
              <input
                className="w-full rounded-xl bg-white/5 border border-white/10 text-white px-4 py-3 outline-none focus:border-[#22c55e]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="min 6 characters"
                type="password"
                autoComplete="new-password"
              />
            </Field>

            <Field label="Full Name">
              <input
                className="w-full rounded-xl bg-white/5 border border-white/10 text-white px-4 py-3 outline-none focus:border-[#22c55e]"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="First and last name"
              />
            </Field>

            <Field label="Business Name (optional)">
              <input
                className="w-full rounded-xl bg-white/5 border border-white/10 text-white px-4 py-3 outline-none focus:border-[#22c55e]"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="PRS Home Improvement"
              />
            </Field>

            <Field label="Phone">
              <input
                className="w-full rounded-xl bg-white/5 border border-white/10 text-white px-4 py-3 outline-none focus:border-[#22c55e]"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(###) ###-####"
              />
            </Field>

            <Field label="City">
              <input
                className="w-full rounded-xl bg-white/5 border border-white/10 text-white px-4 py-3 outline-none focus:border-[#22c55e]"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Snellville"
              />
            </Field>

            <Field label="State">
              <select
                className="w-full rounded-xl bg-[#0B1B3A] border border-white/10 text-white px-4 py-3 outline-none focus:border-[#22c55e]"
                value={state}
                onChange={(e) => setState(e.target.value)}
              >
                {US_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Primary Category">
              <select
                className="w-full rounded-xl bg-[#0B1B3A] border border-white/10 text-white px-4 py-3 outline-none focus:border-[#22c55e]"
                value={primaryCategory}
                onChange={(e) => setPrimaryCategory(e.target.value)}
              >
                {JOB_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="License (optional)">
              <input
                className="w-full rounded-xl bg-white/5 border border-white/10 text-white px-4 py-3 outline-none focus:border-[#22c55e]"
                value={license}
                onChange={(e) => setLicense(e.target.value)}
                placeholder="License #"
              />
            </Field>

            <Field label="Years of Experience (optional)">
              <input
                className="w-full rounded-xl bg-white/5 border border-white/10 text-white px-4 py-3 outline-none focus:border-[#22c55e]"
                value={yearsExperience}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "") return setYearsExperience("");
                  const n = Number(v);
                  if (!Number.isNaN(n) && n >= 0 && n <= 60) setYearsExperience(n);
                }}
                placeholder="0 - 60"
                inputMode="numeric"
              />
            </Field>

            <div className="md:col-span-2">
              <label className="flex items-center gap-3 text-white/80">
                <input
                  type="checkbox"
                  checked={insured}
                  onChange={(e) => setInsured(e.target.checked)}
                  className="h-5 w-5 accent-[#22c55e]"
                />
                Insured (optional)
              </label>
            </div>
          </div>

          {err ? (
            <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-200 text-sm">
              {err}
            </div>
          ) : null}

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onCreate}
              disabled={loading}
              className="w-full sm:w-auto rounded-xl bg-[#22c55e] text-[#0B1B3A] font-semibold px-6 py-3 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Pro Account"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/signin")}
              className="w-full sm:w-auto rounded-xl border border-white/15 bg-white/5 text-white px-6 py-3 hover:bg-white/10"
            >
              Back to Sign In
            </button>
          </div>
        </div>

        <p className="text-white/40 text-xs mt-4">
          After creating an account, you’ll be redirected to Sign In (required).
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-white/80 text-sm">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
	
