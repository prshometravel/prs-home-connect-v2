"use client";

export const dynamic = "force-dynamic";

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
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.push("/signin");
        return;
      }

      setUserId(data.user.id);
      setEmail(data.user.email || "");

      const { data: profile } = await supabase
        .from("homeowners")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name || "");
        setState(profile.state || "");
        setCity(profile.city || "");
        setPhone(profile.phone || "");
        setAddress(profile.address || "");
      }

      setLoading(false);
    };

    loadUser();
  }, [router]);

  const handleSave = async () => {
    if (!userId) return;

    setLoading(true);

    await supabase.from("homeowners").upsert({
      id: userId,
      email,
      full_name: fullName,
      state,
      city,
      phone,
      address,
    });

    setLoading(false);
    alert("Profile saved");
  };

  if (loading) return <div className="p-6">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-black text-white p-4 flex justify-between">
        <button onClick={() => router.push("/")} className="text-sm underline">
          ← Go Home
        </button>
        <span className="font-semibold">Homeowner Profile</span>
      </header>

      <main className="flex-1 max-w-xl mx-auto p-6 bg-white mt-6 rounded shadow">
        <label className="block mb-3">
          Full Name
          <input
            className="w-full border p-2 rounded"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </label>

        <label className="block mb-3">
          State
          <input
            className="w-full border p-2 rounded"
            value={state}
            onChange={(e) => setState(e.target.value)}
          />
        </label>

        <label className="block mb-3">
          City
          <input
            className="w-full border p-2 rounded"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </label>

        <label className="block mb-3">
          Phone
          <input
            className="w-full border p-2 rounded"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>

        <label className="block mb-4">
          Address
          <input
            className="w-full border p-2 rounded"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </label>

        <button
          onClick={handleSave}
          className="w-full bg-green-600 text-white py-2 rounded"
        >
          Save Profile
        </button>
      </main>

      <footer className="mt-10 text-center text-sm text-gray-500 p-4">
        <div>
          Sponsored by <strong>Sista’s Compassionate Care Services</strong>
        </div>
        <div className="mt-1">
          Built & maintained by{" "}
          <strong>PRS Home Improvement and Security LLC</strong>
        </div>
      </footer>
    </div>
  );
}
