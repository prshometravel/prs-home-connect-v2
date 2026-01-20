"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

type UploadedPhoto = {
  file: File;
  previewUrl: string;
  uploading?: boolean;
  uploadedUrl?: string;
  error?: string;
};

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware",
  "District of Columbia","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota",
  "Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico",
  "New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island",
  "South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington",
  "West Virginia","Wisconsin","Wyoming",
];

const SERVICE_CATEGORIES = [
  "CNA / Caregiver",
  "Adult Day Care",
  "Home Cleaning",
  "Deep Cleaning",
  "Move-In / Move-Out Cleaning",
  "Carpet Cleaning",
  "Pressure Washing",
  "Landscaping",
  "Lawn Care",
  "Tree Service",
  "Handyman",
  "Furniture Assembly",
  "TV Mounting",
  "Drywall Repair",
  "Painting (Interior)",
  "Painting (Exterior)",
  "Flooring",
  "Tile Installation",
  "Kitchen Remodel",
  "Bathroom Remodel",
  "Cabinet Installation",
  "Countertops",
  "Plumbing",
  "Water Heater",
  "Drain / Sewer",
  "Electrical",
  "Lighting",
  "Ceiling Fan",
  "HVAC / Heating & Air",
  "Duct Cleaning",
  "Roofing",
  "Gutters",
  "Siding",
  "Windows",
  "Doors",
  "Fencing",
  "Deck / Patio",
  "Concrete",
  "Masonry",
  "Garage Door",
  "Appliance Repair",
  "Pest Control",
  "Security Cameras",
  "Alarm System",
  "Smart Home Setup",
  "Locksmith",
  "Moving Help",
  "Hauling / Junk Removal",
  "Pool Service",
  "General Home Service",
];

function safeText(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}

export default function HomeownerPostJobPage() {
  const router = useRouter();

  // Supabase (client-side)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const supabase = useMemo(() => {
    if (!supabaseUrl || !supabaseAnon) return null;
    return createClient(supabaseUrl, supabaseAnon);
  }, [supabaseUrl, supabaseAnon]);

  const [menuOpen, setMenuOpen] = useState(false);

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userEmail, setUserEmail] = useState<string>("");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(SERVICE_CATEGORIES[0] ?? "General Home Service");
  const [description, setDescription] = useState("");
  const [stateUS, setStateUS] = useState("Georgia");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");

  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  // Auth check
  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        if (!supabase) {
          if (!cancelled) {
            setCheckingAuth(false);
            setErrorMsg("Missing Supabase env vars. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
          }
          return;
        }

        const { data } = await supabase.auth.getUser();
        const email = data?.user?.email ?? "";
        if (!cancelled) {
          setUserEmail(email);
          setCheckingAuth(false);
          // If you want to force sign-in for homeowners, keep this:
          if (!data?.user) {
            router.push("/signin");
          }
        }
      } catch (e: any) {
        if (!cancelled) {
          setCheckingAuth(false);
          setErrorMsg(e?.message || "Auth check failed.");
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [supabase, router]);

  const canSubmit = useMemo(() => {
    return safeText(title).length >= 3 && safeText(description).length >= 10 && safeText(city).length >= 2;
  }, [title, description, city]);

  function goBackSafe() {
    // Back without 404. If no history, fallback to /homeowner
    try {
      window.history.length > 1 ? router.back() : router.push("/homeowner");
    } catch {
      router.push("/homeowner");
    }
  }

  function onPickPhotos(files: FileList | null) {
    setErrorMsg("");
    setSuccessMsg("");
    if (!files || files.length === 0) return;

    const next: UploadedPhoto[] = [];
    const limit = 6; // keep it simple and fast
    for (let i = 0; i < files.length && i < limit; i++) {
      const f = files.item(i);
      if (!f) continue;
      const previewUrl = URL.createObjectURL(f);
      next.push({ file: f, previewUrl });
    }
    setPhotos(next);
  }

  function removePhoto(idx: number) {
    setPhotos((prev) => {
      const copy = [...prev];
      const item = copy[idx];
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      copy.splice(idx, 1);
      return copy;
    });
  }

  async function uploadPhotos(): Promise<string[]> {
    // Upload to a Supabase Storage bucket if it exists.
    // If bucket doesn't exist, we return [] and still post the job.
    if (!supabase) return [];

    const uploadedUrls: string[] = [];
    const bucket = "job-photos"; // if you named it differently, you can change later

    for (let i = 0; i < photos.length; i++) {
      const p = photos[i];
      try {
        const ext = p.file.name.split(".").pop() || "jpg";
        const path = `jobs/${Date.now()}_${Math.random().toString(16).slice(2)}.${ext}`;

        const { error: upErr } = await supabase.storage.from(bucket).upload(path, p.file, {
          cacheControl: "3600",
          upsert: false,
          contentType: p.file.type || "image/jpeg",
        });

        if (upErr) {
          // bucket missing or policy issue—skip uploads but continue job posting
          return [];
        }

        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        const url = data?.publicUrl;
        if (url) uploadedUrls.push(url);
      } catch {
        // ignore a single photo failure
      }
    }

    return uploadedUrls;
  }

  async function submitJob() {
    setErrorMsg("");
    setSuccessMsg("");

    if (!supabase) {
      setErrorMsg("Supabase is not configured (missing NEXT_PUBLIC env vars).");
      return;
    }

    if (!canSubmit) {
      setErrorMsg("Please fill: Title, City, and a detailed Description.");
      return;
    }

    setSubmitting(true);
    try {
      // 1) Upload photos (best effort)
      const photoUrls = await uploadPhotos();

      // 2) Insert job (try with photos, if column not present retry without photos)
      const baseInsert: any = {
        title: safeText(title),
        description: safeText(description),
        category: safeText(category),
        state: safeText(stateUS),
        city: safeText(city),
        address: safeText(address),
        status: "open",
        created_at: new Date().toISOString(),
      };

      // First try include photos (some schemas have photo_urls)
      let insertError: any = null;

      const try1 = await supabase.from("jobs").insert([{ ...baseInsert, photo_urls: photoUrls }]);
      insertError = try1.error;

      if (insertError) {
        // Retry without photo_urls (keeps app working even if your table doesn't have that column)
        const try2 = await supabase.from("jobs").insert([{ ...baseInsert }]);
        if (try2.error) throw try2.error;
      }

      // reset
      setTitle("");
      setDescription("");
      setCity("");
      setAddress("");
      setPhotos((prev) => {
        prev.forEach((p) => p.previewUrl && URL.revokeObjectURL(p.previewUrl));
        return [];
      });

      setSuccessMsg("Job posted successfully. Pros can now see your request.");
    } catch (e: any) {
      setErrorMsg(e?.message || "Failed to post job.");
    } finally {
      setSubmitting(false);
    }
  }

  async function signOut() {
    setMenuOpen(false);
    if (!supabase) {
      router.push("/signin");
      return;
    }
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    router.push("/signin");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-white/15 bg-white/5">
                <Image src="/logo.png" alt="PRS Home Connect" fill className="object-contain p-1" />
              </div>
              <div className="leading-tight">
                <div className="text-base font-semibold">PRS Home Connect</div>
                <div className="text-xs text-white/60">Homeowner • Post a Job</div>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
            >
              Go Home
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
                aria-expanded={menuOpen}
              >
                Menu ▾
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-white/15 bg-slate-950 shadow-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      router.push("/homeowner");
                    }}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-white/10"
                  >
                    Homeowner Home
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      router.push("/pro/dashboard");
                    }}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-white/10"
                  >
                    Pro Dashboard
                  </button>

                  <button
                    type="button"
                    onClick={signOut}
                    className="w-full px-4 py-3 text-left text-sm text-red-200 hover:bg-white/10"
                  >
                    Sign out
                  </button>

                  <div className="px-4 py-3 text-xs text-white/50">
                    {userEmail ? `Signed in as ${userEmail}` : "Not signed in"}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold">Post a Job</h1>
                <p className="mt-1 text-sm text-white/70">
                  Describe what you need. Add details so pros can respond faster.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={goBackSafe}
                  className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/homeowner")}
                  className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
                >
                  Homeowner
                </button>
              </div>
            </div>

            {checkingAuth && (
              <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/70">
                Checking sign-in…
              </div>
            )}

            {errorMsg && (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="mt-4 rounded-xl border border-emerald-400/25 bg-emerald-400/10 p-3 text-sm text-emerald-50">
                {successMsg}
              </div>
            )}

            {/* Form */}
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="text-sm text-white/70">Job Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Example: Install ceiling fan"
                  className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950/40 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-emerald-300/50"
                />
              </div>

              <div>
                <label className="text-sm text-white/70">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950/40 px-4 py-3 text-white outline-none focus:border-emerald-300/50"
                >
                  {SERVICE_CATEGORIES.map((c) => (
                    <option key={c} value={c} className="bg-slate-950">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-white/70">State</label>
                <select
                  value={stateUS}
                  onChange={(e) => setStateUS(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950/40 px-4 py-3 text-white outline-none focus:border-emerald-300/50"
                >
                  {US_STATES.map((s) => (
                    <option key={s} value={s} className="bg-slate-950">
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-white/70">City</label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Example: Atlanta"
                  className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950/40 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-emerald-300/50"
                />
              </div>

              <div>
                <label className="text-sm text-white/70">Address (optional)</label>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Example: Neighborhood or street (optional)"
                  className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950/40 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-emerald-300/50"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-white/70">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  placeholder="Be specific: what needs to be done, when you need it, any details, photos help."
                  className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950/40 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-emerald-300/50"
                />
                <div className="mt-1 text-xs text-white/45">
                  Tip: The more details you add, the faster pros can respond.
                </div>
              </div>

              {/* Photos */}
              <div className="md:col-span-2">
                <label className="text-sm text-white/70">Photos (optional)</label>
                <div className="mt-1 rounded-xl border border-white/15 bg-slate-950/30 p-4">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => onPickPhotos(e.target.files)}
                    className="block w-full text-sm text-white/70 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-emerald-600"
                  />

                  {photos.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {photos.map((p, idx) => (
                        <div key={idx} className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.previewUrl} alt={`Photo ${idx + 1}`} className="h-28 w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removePhoto(idx)}
                            className="absolute right-2 top-2 rounded-lg bg-black/60 px-2 py-1 text-xs text-white hover:bg-black/80"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 text-xs text-white/45">
                    Photos upload automatically during posting. If your storage bucket is not ready yet, the job will still post.
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="md:col-span-2">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-xs text-white/50">
                    {canSubmit ? "Ready to post." : "Fill Title, City, and a detailed Description to enable Post Job."}
                  </div>

                  <button
                    type="button"
                    disabled={!canSubmit || submitting}
                    onClick={submitJob}
                    className={`rounded-xl px-5 py-3 text-sm font-semibold text-white transition
                      ${!canSubmit || submitting
                        ? "cursor-not-allowed bg-emerald-500/40"
                        : "bg-emerald-500 hover:bg-emerald-600"}
                    `}
                  >
                    {submitting ? "Saving..." : "Post Job"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sponsor footer */}
          <footer className="mt-8 text-center text-xs text-white/45">
            Sponsored by Sista&apos;s Compassionate Care Services • Built &amp; Maintained by PRS Home Improvement and Security LLC
          </footer>
        </div>
      </main>
    </div>
  );
}
