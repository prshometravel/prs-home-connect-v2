"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type USState = { code: string; name: string };

const US_STATES: USState[] = [
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

const JOB_CATEGORIES: string[] = [
  // Home / Trades
  "Plumbing",
  "Electrical",
  "HVAC",
  "Handyman",
  "Carpentry",
  "Roofing",
  "Drywall",
  "Painting",
  "Flooring",
  "Tile",
  "Concrete",
  "Masonry",
  "Landscaping",
  "Tree Service",
  "Pressure Washing",
  "Fence / Deck",
  "Windows / Doors",
  "Appliance Repair",
  "Pest Control",
  "Pool Service",
  "Security / Smart Home",
  "Garage Door",
  "Moving / Junk Removal",
  "Cleaning (Home)",
  "Cleaning (Commercial)",
  "Furniture Assembly",
  "Locksmith",

  // Auto
  "Auto Mechanic",
  "Mobile Mechanic",
  "Tires",
  "Detailing",

  // Beauty
  "Hair",
  "Barber",
  "Braids",
  "Makeup",
  "Nails",
  "Lashes",
  "Skin Care",
  "Massage",

  // Medical / Care
  "CNA / Caregiver",
  "Home Health Aide",
  "Nursing",
  "Babysitting / Childcare",
  "Senior Care",
  "Companion Care",

  // Business / Other
  "IT Support",
  "Photography",
  "Tutoring",
  "Notary",
  "Other",
];

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export default function HomeownerPostJobPage() {
  const router = useRouter();

  // IMPORTANT: use your known-good client helper (no direct process.env usage here)
  const supabase = useMemo(() => createClient(), []);

  // Job fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(JOB_CATEGORIES[0] ?? "Other");
  const [stateCode, setStateCode] = useState<USState["code"]>("GA");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");

  // Homeowner contact (required)
  const [homeownerName, setHomeownerName] = useState("");
  const [homeownerPhone, setHomeownerPhone] = useState("");
  const [homeownerEmail, setHomeownerEmail] = useState("");

  // Optional profile photo
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const stateLabel = useMemo(() => {
    const found = US_STATES.find((s) => s.code === stateCode);
    return found ? `${found.name} (${found.code})` : stateCode;
  }, [stateCode]);

  function normalizePhone(v: string) {
    // keep digits only
    const digits = v.replace(/\D/g, "");
    return digits;
  }

  function isValidEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  }

  async function uploadOptionalPhoto(): Promise<string | null> {
    if (!photoFile) return null;

    // NOTE: bucket name can be changed to whatever you already created.
    // This is optional and failure will NOT block posting a job.
    const bucket = "homeowner-profiles";

    const ext = (photoFile.name.split(".").pop() || "jpg").toLowerCase();
    const safeExt = ext.match(/^[a-z0-9]+$/) ? ext : "jpg";
    const filePath = `homeowners/${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}.${safeExt}`;

    const { error } = await supabase.storage.from(bucket).upload(filePath, photoFile, {
      cacheControl: "3600",
      upsert: false,
      contentType: photoFile.type || "image/jpeg",
    });

    if (error) {
      // do not block job post; just skip photo
      return null;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data?.publicUrl ?? null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Required validation
    const t = title.trim();
    const c = city.trim();
    const d = description.trim();
    const hn = homeownerName.trim();
    const he = homeownerEmail.trim();
    const hp = normalizePhone(homeownerPhone);

    if (!t || t.length < 3) return setErrorMsg("Job title is required (min 3 characters).");
    if (!category) return setErrorMsg("Job category is required.");
    if (!stateCode) return setErrorMsg("State is required.");
    if (!c) return setErrorMsg("City is required.");
    if (!d || d.length < 10) return setErrorMsg("Description is required (min 10 characters).");

    if (!hn || hn.length < 2) return setErrorMsg("Full name is required.");
    if (!hp || hp.length < 10) return setErrorMsg("Phone number is required (10+ digits).");
    if (!he || !isValidEmail(he)) return setErrorMsg("Valid email address is required.");

    setLoading(true);

    try {
      // Optional photo upload (non-blocking)
      let homeownerPhotoUrl: string | null = null;
      try {
        homeownerPhotoUrl = await uploadOptionalPhoto();
      } catch {
        homeownerPhotoUrl = null;
      }

      // Call your existing API route (server-side uses env safely)
      const res = await fetch("/api/jobs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: t,
          category,
          location: {
            state: stateCode,
            city: c,
            stateLabel,
          },
          description: d,

          // homeowner private contact (pros should NOT see until pay+claim)
          homeowner: {
            name: hn,
            phone: hp,
            email: he,
            photo_url: homeownerPhotoUrl,
          },
        }),
      });

      const payload = await res.json().catch(() => ({} as any));

      if (!res.ok) {
        setErrorMsg(payload?.error || "Failed to post job.");
        setLoading(false);
        return;
      }

      setSuccessMsg("Job posted successfully.");
      setLoading(false);

      // Go back to homeowner dashboard (keep minimal changes)
      setTimeout(() => router.push("/homeowner/dashboard"), 600);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to post job.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#06192b] text-white">
      {/* Top bar */}
      <div className="sticky top-0 z-10 border-b border-white/10 bg-[#06192b]/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 ring-1 ring-emerald-400/30" />
            <div>
              <div className="text-sm text-white/70">PRS Home Connect</div>
              <div className="text-lg font-semibold leading-tight">Homeowner • Post a Job</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
            >
              Home
            </Link>
            <Link
              href="/homeowner/dashboard"
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
          <div className="mb-1 text-xl font-bold">Homeowner Contact (Private)</div>
          <div className="text-sm text-white/70">
            Pros will <span className="font-semibold text-emerald-300">NOT</span> see this until they pay and claim the
            lead.
          </div>

          <form onSubmit={onSubmit} className="mt-5 grid gap-5">
            {/* Contact */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-white/80">Full Name</label>
                <input
                  value={homeownerName}
                  onChange={(e) => setHomeownerName(e.target.value)}
                  placeholder="Full name"
                  className="h-12 rounded-xl bg-white/10 px-4 text-white placeholder:text-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-white/80">Phone Number</label>
                <input
                  value={homeownerPhone}
                  onChange={(e) => setHomeownerPhone(e.target.value)}
                  placeholder="(###) ###-####"
                  className="h-12 rounded-xl bg-white/10 px-4 text-white placeholder:text-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                />
              </div>

              <div className="grid gap-2 md:col-span-2">
                <label className="text-sm font-semibold text-white/80">Email Address</label>
                <input
                  value={homeownerEmail}
                  onChange={(e) => setHomeownerEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="h-12 rounded-xl bg-white/10 px-4 text-white placeholder:text-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                />
              </div>

              <div className="grid gap-2 md:col-span-2">
                <label className="text-sm font-semibold text-white/80">Profile Picture (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                  className="block w-full rounded-xl bg-white/10 px-4 py-3 text-sm text-white/80 ring-1 ring-white/10 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black hover:file:bg-emerald-400"
                />
                <div className="text-xs text-white/60">Optional. Stored privately in Supabase Storage.</div>
              </div>
            </div>

            {/* Job details */}
            <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
              <div className="mb-1 text-xl font-bold">Job Details</div>
              <div className="text-sm text-white/70">Choose a category, location, and describe what you need done.</div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="grid gap-2 md:col-span-2">
                  <label className="text-sm font-semibold text-white/80">Job Title</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Example: Fix leaking faucet"
                    className="h-12 rounded-xl bg-white/10 px-4 text-white placeholder:text-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-white/80">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="h-12 rounded-xl bg-white/10 px-4 text-white ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                  >
                    {JOB_CATEGORIES.map((c) => (
                      <option key={c} value={c} className="bg-[#06192b]">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-white/80">State</label>
                  <select
                    value={stateCode}
                    onChange={(e) => setStateCode(e.target.value)}
                    className="h-12 rounded-xl bg-white/10 px-4 text-white ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                  >
                    {US_STATES.map((s) => (
                      <option key={s.code} value={s.code} className="bg-[#06192b]">
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2 md:col-span-2">
                  <label className="text-sm font-semibold text-white/80">City</label>
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="h-12 rounded-xl bg-white/10 px-4 text-white placeholder:text-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                  />
                </div>

                <div className="grid gap-2 md:col-span-2">
                  <label className="text-sm font-semibold text-white/80">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    placeholder="Describe the job (materials, size, urgency, photos, etc.)"
                    className="rounded-xl bg-white/10 px-4 py-3 text-white placeholder:text-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={classNames(
                "h-14 w-full rounded-2xl font-bold text-black transition",
                loading ? "bg-emerald-500/60" : "bg-emerald-500 hover:bg-emerald-400"
              )}
            >
              {loading ? "Posting..." : "Post Job"}
            </button>

            {/* Messages */}
            {errorMsg && (
              <div className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-200 ring-1 ring-red-400/30">
                ✖ {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 ring-1 ring-emerald-400/30">
                ✓ {successMsg}
              </div>
            )}

            {/* Footer */}
            <div className="pt-3 text-center text-xs text-white/60">
              Sponsored by Asher Playroom • Sista&apos;s Compassionate Care • Built by PRS Home Improvement &amp; Security
              LLC
              <div className="mt-1 text-white/40">Location: Devman, AR — Arkansas</div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
