"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function HomeownerProfilePage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");

  const [fullName, setFullName] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(false);

  // ✅ Get logged-in user
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        alert("You must be signed in as a homeowner");
        router.push("/homeowner/signin");
        return;
      }
      setUserId(data.user.id);
      setEmail(data.user.email || "");
    };
    getUser();
  }, [router]);

  // ✅ THIS is what your button was NOT calling correctly
  const createProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      alert("User not loaded yet");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("homeowners")
      .upsert(
        {
          user_id: userId,
          full_name: fullName,
          state,
          city,
          phone,
          address,
          email,
        },
        { onConflict: "user_id" }
      );

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Homeowner profile created ✅");
    router.push("/homeowner/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#0b1c2c] text-white flex items-center justify-center">
      <form
        onSubmit={createProfile} // 🔑 REQUIRED
        className="w-full max-w-xl bg-white/10 rounded-2xl p-8 space-y-4"
      >
        <h1 className="text-2xl font-bold">Homeowner Profile</h1>

        <input
          className="w-full rounded-full px-4 py-3 bg-black/30"
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <input
          className="w-full rounded-full px-4 py-3 bg-black/30"
          placeholder="State"
          value={state}
          onChange={(e) => setState(e.target.value)}
          required
        />

        <input
          className="w-full rounded-full px-4 py-3 bg-black/30"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
        />

        <input
          className="w-full rounded-full px-4 py-3 bg-black/30"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />

        <input
          className="w-full rounded-full px-4 py-3 bg-black/30"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />

        <button
          type="submit" // 🔑 REQUIRED
          disabled={loading}
          className="w-full rounded-full bg-emerald-400 py-4 text-black font-semibold text-lg"
        >
          {loading ? "Saving..." : "Create Profile"}
        </button>

        <p className="text-center text-white/60 text-sm">
          PRS Home Connect — built by PRS Home Improvement and Security LLC
        </p>
      </form>
    </div>
  );
}
