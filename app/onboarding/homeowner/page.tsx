"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
];

export default function HomeownerOnboardingPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [userId, setUserId] = useState<string>("");

  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("GA");
  const [zip, setZip] = useState("");
  const [propertyType, setPropertyType] = useState("house");

  const bg = "bg-[#061b33]";
  const card = "bg-white/5 border border-white/10";
  const muted = "text-white/70";

  useEffect(() => {
    (async () => {
      setError("");
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (!user) {
        router.replace("/signin");
        return;
      }

      setUserId(user.id);

      const { data: h } = await supabase
        .from("homeowner_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (h) {
        setAddress1(h.address1 || "");
        setAddress2(h.address2 || "");
        setCity(h.city || "");
        setState((h.state || "GA").toUpperCase());
        setZip(h.zip || "");
        setPropertyType(h.property_type || "house");
      }

      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save() {
    if (!userId) return;
    setError("");
    setSaving(true);

    try {
      const { error: upErr } = await supabase.from("homeowner_profiles").upsert(
        {
          user_id: userId,
          address1: address1.trim() || null,
          address2: address2.trim() || null,
          city: city.trim() || null,
          state: state.toUpperCase(),
          zip: zip.trim() || null,
          property_type: propertyType,
        },
        { onConflict: "user_id" }
      );

      if (upErr) throw upErr;

      router.replace("/homeowner/dashboard");
    } catch (e: any) {
      setError(e?.message || "Could not save homeowner info.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className={`${bg} min-h-screen text-white flex items-center justify-center p-4`}>
        <div className={`${card} rounded-2xl p-6 w-full max-w-xl`}>
          <div className="text-xl font-bold">Loading Homeowner Setup…</div>
          <div className={`mt-2 text-sm ${muted}`}>Getting your account ready.</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${bg} min-h-screen text-white px-4 py-8`}>
      <div className="mx-auto max-w-2xl space-y-4">
        <div className={`${card} rounded-2xl p-6`}>
          <div className="text-2xl font-bold">Homeowner Account Setup</div>
          <div className={`mt-1 text-sm ${muted}`}>
            Add your details so pros can serve you better.
          </div>
        </div>

        <div className={`${card} rounded-2xl p-6`}>
          <div className="text-lg font-semibold">Property & Address</div>

          <div className="mt-4 grid grid-cols-1 gap-3">
            <div>
              <label className={`text-xs ${muted}`}>Property Type</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#041326]/50 px-3 py-2 outline-none focus:border-emerald-400/40"
              >
                <option value="house">House</option>
                <option value="apartment">Apartment</option>
                <option value="condo">Condo</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>

            <div>
              <label className={`text-xs ${muted}`}>Address Line 1</label>
              <input
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#041326]/50 px-3 py-2 outline-none focus:border-emerald-400/40"
              />
            </div>

            <div>
              <label className={`text-xs ${muted}`}>Address Line 2 (optional)</label>
              <input
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#041326]/50 px-3 py-2 outline-none focus:border-emerald-400/40"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className={`text-xs ${muted}`}>City</label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#041326]/50 px-3 py-2 outline-none focus:border-emerald-400/40"
                />
              </div>
              <div>
                <label className={`text-xs ${muted}`}>State</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#041326]/50 px-3 py-2 outline-none focus:border-emerald-400/40"
                >
                  {US_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={`text-xs ${muted}`}>ZIP</label>
              <input
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#041326]/50 px-3 py-2 outline-none focus:border-emerald-400/40"
              />
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="flex gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 font-bold text-[#041326] hover:bg-emerald-400 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save & Continue"}
          </button>
          <button
            onClick={() => router.replace("/homeowner/dashboard")}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 font-semibold hover:bg-white/10"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
