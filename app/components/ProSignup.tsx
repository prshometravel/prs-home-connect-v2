"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../utils/supabase/client";
import { MASTER_JOB_CATEGORIES } from "../lib/masterJobCategories";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
];

type LicenseType =
  | "General Contractor"
  | "Electrician"
  | "Plumber"
  | "HVAC"
  | "Roofing"
  | "Handyman"
  | "CNA / Caregiver"
  | "RN / LPN"
  | "Other"
  | "";

export default function ProSignup() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [categories, setCategories] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);

  const [licenseType, setLicenseType] = useState<LicenseType>("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseState, setLicenseState] = useState("");
  const [licenseExpires, setLicenseExpires] = useState("");

  const [insured, setInsured] = useState(false);

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeCharge, setAgreeCharge] = useState(false);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function toggle(list: string[], value: string, setList: (v: string[]) => void) {
    if (list.includes(value)) setList(list.filter((x) => x !== value));
    else setList([...list, value]);
  }

  async function onCreateAccount() {
    setErr(null);

    // Required checks (pro-level)
    if (!firstName.trim() || !lastName.trim()) return setErr("Enter your full name.");
    if (!businessName.trim()) return setErr("Business name is required for Pros.");
    if (!phone.trim()) return setErr("Phone number is required.");
    if (!email.trim() || !password) return setErr("Email and password are required.");
    if (categories.length === 0) return setErr("Select at least 1 service category.");
    if (states.length === 0) return setErr("Select at least 1 service state.");
    if (!agreeTerms) return setErr("You must accept the Terms to continue.");
    if (!agreeCharge) return setErr("You must agree to the $10 lead charge rule to continue.");

    setLoading(true);
    try {
      // 1) Create Auth user
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpErr) throw signUpErr;

      // 2) Ensure we have the user id
      const userId = signUpData.user?.id;
      if (!userId) {
        // In some cases Supabase requires email confirmation before user object is available
        // Still show a clear message
        throw new Error("Account created. Please check your email to confirm, then sign in.");
      }

      // 3) Create/Update pro profile
      const { error: upsertErr } = await supabase.from("pro_profiles").upsert(
        {
          user_id: userId,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phone.trim(),
          business_name: businessName.trim(),

          qualified_categories: categories,
          service_states: states,

          license_type: licenseType || null,
          license_number: licenseNumber.trim() || null,
          license_state: licenseState || null,
          license_expires: licenseExpires ? licenseExpires : null,

          insurance: insured,
          terms_accepted_at: new Date().toISOString(),

          onboarding_complete: false,
          billing_ready: false, // you’ll flip to true after Stripe card setup
        },
        { onConflict: "user_id" }
      );

      if (upsertErr) throw upsertErr;

      // 4) Next step: onboarding + payment setup
      router.push("/onboarding/pro?next=/pro/dashboard");
      router.refresh();
    } catch (e: any) {
      setErr(e?.message || "Pro signup failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0B1B3A] text-white p-4">
      <div className="mx-auto w-full max-w-2xl">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">Create Pro Account</h1>
              <p className="text-white/70 mt-1">
                Pros must add services + coverage so homeowners see the right contractors.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push("/signin")}
              className="rounded-xl border border-white/15 px-3 py-2 text-sm hover:bg-white/10"
            >
              Back to Sign In
            </button>
          </div>

          {err ? (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
              {err}
            </div>
          ) : null}

          {/* Account */}
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="First Name" value={firstName} onChange={setFirstName} />
            <Field label="Last Name" value={lastName} onChange={setLastName} />
            <Field label="Business Name" value={businessName} onChange={setBusinessName} />
            <Field label="Phone" value={phone} onChange={setPhone} />
            <Field label="Email" value={email} onChange={setEmail} type="email" />
            <Field label="Password" value={password} onChange={setPassword} type="password" />
          </div>

          {/* Categories */}
          <div className="mt-6">
            <div className="text-sm text-white/80 mb-2">Service Categories (select all that apply)</div>
            <div className="max-h-60 overflow-auto rounded-2xl border border-white/10 bg-black/20 p-3">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {MASTER_JOB_CATEGORIES.map((cat) => (
                  <label key={cat} className="flex items-center gap-2 text-sm text-white/85">
                    <input
                      type="checkbox"
                      checked={categories.includes(cat)}
                      onChange={() => toggle(categories, cat, setCategories)}
                      className="h-4 w-4"
                    />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="mt-2 text-xs text-white/60">Selected: {categories.length}</div>
          </div>

          {/* States */}
          <div className="mt-6">
            <div className="text-sm text-white/80 mb-2">Service States</div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <div className="grid grid-cols-4 gap-2 md:grid-cols-8">
                {US_STATES.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => toggle(states, st, setStates)}
                    className={[
                      "rounded-xl border px-2 py-2 text-sm",
                      states.includes(st)
                        ? "border-emerald-400/60 bg-emerald-400/20 text-white"
                        : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10",
                    ].join(" ")}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-2 text-xs text-white/60">Selected: {states.length}</div>
          </div>

          {/* License */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-base font-semibold">License & Credentials (optional)</div>
            <div className="text-sm text-white/70 mt-1">
              Add now to look more trustworthy. We will show it as “Provided (not verified)” until verified.
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <div className="text-sm text-white/80 mb-1">License Type</div>
                <select
                  value={licenseType}
                  onChange={(e) => setLicenseType(e.target.value as LicenseType)}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                >
                  <option value="">None</option>
                  <option>General Contractor</option>
                  <option>Electrician</option>
                  <option>Plumber</option>
                  <option>HVAC</option>
                  <option>Roofing</option>
                  <option>Handyman</option>
                  <option>CNA / Caregiver</option>
                  <option>RN / LPN</option>
                  <option>Other</option>
                </select>
              </div>

              <Field label="License Number" value={licenseNumber} onChange={setLicenseNumber} />

              <div>
                <div className="text-sm text-white/80 mb-1">License State</div>
                <select
                  value={licenseState}
                  onChange={(e) => setLicenseState(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                >
                  <option value="">Select</option>
                  {US_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <Field label="Expiration Date" value={licenseExpires} onChange={setLicenseExpires} type="date" />
            </div>

            <label className="mt-4 flex items-center gap-2 text-sm text-white/85">
              <input
                type="checkbox"
                checked={insured}
                onChange={(e) => setInsured(e.target.checked)}
                className="h-4 w-4"
              />
              I have liability insurance
            </label>
          </div>

          {/* Agreements */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-base font-semibold">Agreements</div>

            <label className="mt-3 flex items-start gap-2 text-sm text-white/85">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="h-4 w-4 mt-1"
              />
              <span>
                I agree to the platform Terms and I will provide honest information.
              </span>
            </label>

            <label className="mt-3 flex items-start gap-2 text-sm text-white/85">
              <input
                type="checkbox"
                checked={agreeCharge}
                onChange={(e) => setAgreeCharge(e.target.checked)}
                className="h-4 w-4 mt-1"
              />
              <span>
                I understand claiming a lead charges my card <b>$10 per lead</b>.
              </span>
            </label>

            <div className="mt-3 text-xs text-white/60">
              Next step: we’ll connect payment (add card) before you can claim leads.
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={onCreateAccount}
              className="w-full rounded-xl bg-emerald-400 px-4 py-3 font-semibold text-black hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Pro Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <div className="text-sm text-white/80 mb-1">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-emerald-400/60"
      />
    </div>
  );
}
