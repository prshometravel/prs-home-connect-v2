"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../../utils/supabase/client";

const US_STATES: { code: string; name: string }[] = [
  { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" }, { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" }, { code: "CA", name: "California" }, { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" }, { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" }, { code: "HI", name: "Hawaii" }, { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" }, { code: "IN", name: "Indiana" }, { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" }, { code: "KY", name: "Kentucky" }, { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" }, { code: "MD", name: "Maryland" }, { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" }, { code: "MN", name: "Minnesota" }, { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" }, { code: "MT", name: "Montana" }, { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" }, { code: "NH", name: "New Hampshire" }, { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" }, { code: "NY", name: "New York" }, { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" }, { code: "OH", name: "Ohio" }, { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" }, { code: "PA", name: "Pennsylvania" }, { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" }, { code: "SD", name: "South Dakota" }, { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" }, { code: "UT", name: "Utah" }, { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" }, { code: "WA", name: "Washington" }, { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" }, { code: "WY", name: "Wyoming" },
];

const JOB_CATEGORIES: string[] = [
  // Home / Trades
  "Plumbing", "Electrical", "HVAC", "Roofing", "Drywall", "Painting", "Flooring", "Carpentry",
  "Kitchen Remodel", "Bathroom Remodel", "Tile", "Appliance Repair", "Handyman", "Landscaping",
  "Lawn Care", "Tree Service", "Pressure Washing", "Pest Control", "Cleaning", "Moving",
  "Security System", "CCTV/Camera Install", "Smart Home Install", "Locksmith",
  // Auto / Transport
  "Auto Repair", "Towing", "Mobile Mechanic",
  // Personal / Beauty
  "Hair Stylist", "Barber", "Braids", "Makeup Artist", "Nails", "Lash Tech", "Massage",
  "Personal Trainer",
  // Medical / Care
  "Home Care", "Nursing Assistant", "Elder Care", "Child Care", "Medical Transport",
  // Business / Other
  "Photography", "Videography", "Web Design", "Graphic Design", "Notary", "Tax Prep",
  "Other",
];

export default function HomeownerPostJobPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [jobTitle, setJobTitle] = useState("");
  const [category, setCategory] = useState("Plumbing");
  const [stateCode, setStateCode] = useState("GA");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");

  // homeowner private info
  const [homeownerName, setHomeownerName] = useState("");
  const [homeownerPhone, setHomeownerPhone] = useState("");
  const [homeownerEmail, setHomeownerEmail] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const stateLabel = useMemo(() => {
    const found = US_STATES.find((s) => s.code === stateCode);
    return found ? `${found.code} — ${found.name}` : stateCode;
  }, [stateCode]);

  async function uploadOptionalPhoto(userId: string) {
    if (!photoFile) return null;

    const ext = photoFile.name.split(".").pop() || "jpg";
    const safeExt = ext.toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `homeowners/${userId}/${Date.now()}.${safeExt}`;

    const { error } = await supabase.storage
      .from("job-contact-photos")
      .upload(path, photoFile, { upsert: false });

    if (error) throw new Error(error.message);
    return path;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    setLoading(true);
    try {
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (authErr) throw new Error(authErr.message);
      const user = authData.user;
      if (!user) throw new Error("Not signed in. Please sign in again.");

      if (!jobTitle.trim()) throw new Error("Please enter a job title.");
      if (!city.trim()) throw new Error("Please enter your city.");
      if (!description.trim()) throw new Error("Please enter job details.");

      if (!homeownerName.trim()) throw new Error("Please enter your name.");
      if (!homeownerPhone.trim()) throw new Error("Please enter your phone number.");
      if (!homeownerEmail.trim()) throw new Error("Please enter your email address.");

      // Upload optional photo first (if provided)
      const photo_path = await uploadOptionalPhoto(user.id);

      // Create job + private contact record via API
      const res = await fetch("/api/jobs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          homeowner_id: user.id,
          title: jobTitle.trim(),
          description: description.trim(),
          category,
          state: stateCode,
          city: city.trim(),
          homeowner_name: homeownerName.trim(),
          homeowner_phone: homeownerPhone.trim(),
          homeowner_email: homeownerEmail.trim(),
          photo_path,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to post job");

      setMsg("✅ Job posted successfully.");
      // go to homeowner dashboard or jobs list
      router.push("/homeowner/dashboard");
    } catch (err: any) {
      setMsg(`❌ ${err?.message || "Something went wrong"}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#071a33] text-white">
      {/* Top nav */}
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Post a Job</h1>
            <p className="text-white/70">Homeowner</p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/homeowner/dashboard"
              className="rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/15"
            >
              Dashboard
            </Link>
            <Link
              href="/jobs"
              className="rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/15"
            >
              Jobs
            </Link>
          </div>
        </div>

        {/* Form card */}
        <div className="mt-6 rounded-2xl bg-white/5 p-5 shadow-lg ring-1 ring-white/10">
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Job info */}
            <div className="space-y-3">
              <div>
                <label className="text-sm text-white/80">Job Title</label>
                <input
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g., Bathroom drywall repair"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-emerald-400/60"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="text-sm text-white/80">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none focus:border-emerald-400/60"
                  >
                    {JOB_CATEGORIES.map((c) => (
                      <option key={c} value={c} className="text-black">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-white/80">State</label>
                  <select
                    value={stateCode}
                    onChange={(e) => setStateCode(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none focus:border-emerald-400/60"
                  >
                    {US_STATES.map((s) => (
                      <option key={s.code} value={s.code} className="text-black">
                        {s.code} — {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm text-white/80">City</label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g., Snellville"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-emerald-400/60"
                />
              </div>

              <div>
                <label className="text-sm text-white/80">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the job and any details the pro should know..."
                  rows={5}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-emerald-400/60"
                />
              </div>
            </div>

            {/* Homeowner private contact section */}
            <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
              <h2 className="text-lg font-semibold">Homeowner Contact (Private)</h2>
              <p className="mt-1 text-sm text-white/70">
                Pros will <span className="text-emerald-300 font-semibold">NOT</span> see this until they pay and claim the lead.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="text-sm text-white/80">Full Name</label>
                  <input
                    value={homeownerName}
                    onChange={(e) => setHomeownerName(e.target.value)}
                    placeholder="Your name"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-emerald-400/60"
                  />
                </div>

                <div>
                  <label className="text-sm text-white/80">Phone Number</label>
                  <input
                    value={homeownerPhone}
                    onChange={(e) => setHomeownerPhone(e.target.value)}
                    placeholder="(###) ###-####"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-emerald-400/60"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm text-white/80">Email Address</label>
                  <input
                    value={homeownerEmail}
                    onChange={(e) => setHomeownerEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-emerald-400/60"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm text-white/80">Profile Picture (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white"
                  />
                  <p className="mt-1 text-xs text-white/60">
                    Optional. Stored privately in Supabase Storage.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-black hover:bg-emerald-400 disabled:opacity-60"
            >
              {loading ? "Posting..." : "Post Job"}
            </button>

            {msg && (
              <div className="rounded-xl bg-white/10 p-3 text-sm">
                {msg}
              </div>
            )}
          </form>
        </div>

        {/* Sponsor footer */}
        <div className="mt-6 text-center text-xs text-white/60">
          Sponsored by Asher Playroom • Sista’s Compassionate Care • Built by PRS Home Improvement &amp; Security LLC
        </div>

        {/* small debug label (optional) */}
        <div className="mt-2 text-center text-xs text-white/40">
          Location: {city ? `${city}, ${stateLabel}` : stateLabel}
        </div>
      </div>
    </div>
  );
}
