"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export default function HomeownerDashboardPage() {
  const router = useRouter();

  const [userEmail, setUserEmail] = useState<string>("");
  const [loadingUser, setLoadingUser] = useState(true);

  const [fullName, setFullName] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (!supabase) {
          alert("Missing Supabase env vars (NEXT_PUBLIC_SUPABASE_URL / ANON_KEY)");
          return;
        }
        const { data } = await supabase.auth.getUser();
        const user = data?.user;

        if (!user) {
          router.push("/homeowner/signin");
          return;
        }
        setUserEmail(user.email ?? "");
      } catch (e: any) {
        alert(e?.message ?? "Error loading user");
      } finally {
        setLoadingUser(false);
      }
    })();
  }, [router]);

  async function signOut() {
    try {
      if (!supabase) return;
      await supabase.auth.signOut();
      router.push("/signin");
    } catch (e: any) {
      alert(e?.message ?? "Sign out failed");
    }
  }

  async function createProfile(e: React.FormEvent) {
    e.preventDefault();

    try {
      if (!supabase) {
        alert("Missing Supabase env vars (NEXT_PUBLIC_SUPABASE_URL / ANON_KEY)");
        return;
      }

      setSaving(true);

      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      if (!user) {
        alert("You are not signed in.");
        router.push("/homeowner/signin");
        return;
      }

      // IMPORTANT: table name must be "homeowners"
      const { error } = await supabase
        .from("homeowners")
        .upsert(
          {
            user_id: user.id,
            email: user.email,
            full_name: fullName.trim(),
            state: stateVal,
            city: city.trim(),
            phone: phone.trim(),
            address: address.trim(),
          },
          { onConflict: "user_id" }
        );

      if (error) throw error;

      alert("Homeowner profile saved ✅");
      // optional: you can redirect after save
      // router.push("/homeowner/post-job");
    } catch (err: any) {
      alert(err?.message ?? "Error creating profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0b1c2c] text-white">
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Top Bar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Homeowner Dashboard</h1>
            <p className="text-white/80 text-sm">
              Signed in as:{" "}
              <span className="font-semibold">
                {loadingUser ? "Loading..." : userEmail || "Unknown"}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/"
              className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15"
            >
              Go Home
            </Link>

            <div className="relative">
              <details className="group">
                <summary className="cursor-pointer list-none rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15">
                  Menu ▾
                </summary>

                <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl bg-[#0b1c2c] p-2 shadow-xl ring-1 ring-white/10">
                  <Link
                    href="/homeowner/dashboard"
                    className="block rounded-lg px-3 py-2 text-sm hover:bg-white/10"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/homeowner/profile"
                    className="block rounded-lg px-3 py-2 text-sm hover:bg-white/10"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/homeowner/post-job"
                    className="block rounded-lg px-3 py-2 text-sm hover:bg-white/10"
                  >
                    Post a Job
                  </Link>
                  <Link
                    href="/jobs"
                    className="block rounded-lg px-3 py-2 text-sm hover:bg-white/10"
                  >
                    Browse Jobs
                  </Link>

                  <button
                    type="button"
                    onClick={signOut}
                    className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-200 hover:bg-white/10"
                  >
                    Sign out
                  </button>
                </div>
              </details>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <form
          onSubmit={createProfile}
          className="rounded-2xl bg-white/10 p-6 shadow"
        >
          <h2 className="text-xl font-semibold">Homeowner Profile</h2>
          <p className="mt-1 text-sm text-white/80">
            Create this once before posting jobs.
          </p>

          <div className="mt-6 space-y-4">
            <input
              className="w-full rounded-full bg-black/30 px-5 py-4 text-white placeholder-white/60 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-emerald-400"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <select
              className="w-full rounded-full bg-black/30 px-5 py-4 text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-emerald-400"
              value={stateVal}
              onChange={(e) => setStateVal(e.target.value)}
              required
            >
              <option value="">Select State</option>
              <option value="AL">Alabama</option>
              <option value="AK">Alaska</option>
              <option value="AZ">Arizona</option>
              <option value="AR">Arkansas</option>
              <option value="CA">California</option>
              <option value="CO">Colorado</option>
              <option value="CT">Connecticut</option>
              <option value="DE">Delaware</option>
              <option value="FL">Florida</option>
              <option value="GA">Georgia</option>
              <option value="HI">Hawaii</option>
              <option value="ID">Idaho</option>
              <option value="IL">Illinois</option>
              <option value="IN">Indiana</option>
              <option value="IA">Iowa</option>
              <option value="KS">Kansas</option>
              <option value="KY">Kentucky</option>
              <option value="LA">Louisiana</option>
              <option value="ME">Maine</option>
              <option value="MD">Maryland</option>
              <option value="MA">Massachusetts</option>
              <option value="MI">Michigan</option>
              <option value="MN">Minnesota</option>
              <option value="MS">Mississippi</option>
              <option value="MO">Missouri</option>
              <option value="MT">Montana</option>
              <option value="NE">Nebraska</option>
              <option value="NV">Nevada</option>
              <option value="NH">New Hampshire</option>
              <option value="NJ">New Jersey</option>
              <option value="NM">New Mexico</option>
              <option value="NY">New York</option>
              <option value="NC">North Carolina</option>
              <option value="ND">North Dakota</option>
              <option value="OH">Ohio</option>
              <option value="OK">Oklahoma</option>
              <option value="OR">Oregon</option>
              <option value="PA">Pennsylvania</option>
              <option value="RI">Rhode Island</option>
              <option value="SC">South Carolina</option>
              <option value="SD">South Dakota</option>
              <option value="TN">Tennessee</option>
              <option value="TX">Texas</option>
              <option value="UT">Utah</option>
              <option value="VT">Vermont</option>
              <option value="VA">Virginia</option>
              <option value="WA">Washington</option>
              <option value="WV">West Virginia</option>
              <option value="WI">Wisconsin</option>
              <option value="WY">Wyoming</option>
            </select>

            <input
              className="w-full rounded-full bg-black/30 px-5 py-4 text-white placeholder-white/60 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-emerald-400"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />

            <input
              className="w-full rounded-full bg-black/30 px-5 py-4 text-white placeholder-white/60 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-emerald-400"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />

            <input
              className="w-full rounded-full bg-black/30 px-5 py-4 text-white placeholder-white/60 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-emerald-400"
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={saving}
              className="mt-2 w-full rounded-full bg-emerald-400 px-6 py-4 text-lg font-semibold text-black shadow-lg hover:opacity-95 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Create Profile"}
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-white/70">
            PRS Home Connect — built by PRS Home Improvement and Security LLC
          </div>
        </form>
      </div>
    </div>
  );
}
