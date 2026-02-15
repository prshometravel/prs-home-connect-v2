"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

const STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS",
  "KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY",
  "NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
];

const JOB_CATEGORIES = [
  // Core Trades
  "Plumbing","Electrical","HVAC","Roofing","Gutters","Siding",
  "Drywall","Painting","Flooring","Tile","Carpentry","Framing",
  "Insulation","Windows","Doors","Garage Doors","Deck Building",
  "Fence Installation","Concrete","Masonry","Stone Work",

  // Remodeling
  "Kitchen Remodel","Bathroom Remodel","Basement Remodel",
  "Cabinet Installation","Countertops","Backsplash",

  // Exterior / Yard
  "Landscaping","Lawn Care","Tree Removal","Tree Trimming",
  "Stump Grinding","Irrigation","Drainage","Pressure Washing",
  "Leaf Cleanup","Outdoor Lighting","Pavers",

  // Electrical Add-ons
  "Lighting Installation","Ceiling Fan","Panel Upgrade",
  "EV Charger","Generator Installation","Wiring",

  // HVAC Add-ons
  "AC Repair","AC Install","Furnace Repair","Furnace Install",
  "Duct Cleaning","Mini Split","Thermostat",

  // Plumbing Add-ons
  "Water Heater","Tankless Heater","Leak Repair","Pipe Repair",
  "Toilet Install","Faucet Install","Drain Cleaning",

  // Security / Low Voltage
  "Security Cameras","Alarm System","Smart Locks","Doorbell Camera",

  // Appliances
  "Appliance Repair","Washer Repair","Dryer Repair",
  "Refrigerator Repair","Dishwasher Repair","Oven Repair",

  // Cleaning / Moving
  "Home Cleaning","Deep Cleaning","Move-Out Cleaning",
  "Junk Removal","Hauling","Furniture Assembly",

  // General
  "Handyman","General Contractor",

  // Care Services (Non-clinical)
  "CNA","Caregiver","Home Health Aide","Companion Care",
  "Senior Care","Respite Care","Personal Care Assistance",
  "Meal Prep","Errands","Transportation","Mobility Assistance"
];

export default function ProCreatePage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("");
  const [state, setState] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Create user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      const user = data.user;
      if (!user) throw new Error("User not created");

      // 2. Save pro profile
      const { error: profileError } = await supabase
        .from("pro_profiles")
        .insert({
          id: user.id,
          business_name: businessName,
          phone,
          category,
          state,
        });

      if (profileError) throw profileError;

      // 3. Redirect
      router.push("/pro/dashboard");
    } catch (err: any) {
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#061a3a] text-white flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-[#0b2a5a] p-6 rounded-2xl border border-white/10 space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">Create Pro Account</h1>

        {error && <div className="text-red-400">{error}</div>}

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 rounded bg-white/10"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 rounded bg-white/10"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Business Name"
          className="w-full p-3 rounded bg-white/10"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Phone"
          className="w-full p-3 rounded bg-white/10"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        {/* JOB CATEGORY DROPDOWN */}
        <select
          className="w-full p-3 rounded bg-white/10"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">Select Job Category</option>
          {JOB_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        {/* STATE DROPDOWN */}
        <select
          className="w-full p-3 rounded bg-white/10"
          value={state}
          onChange={(e) => setState(e.target.value)}
          required
        >
          <option value="">Select State</option>
          {STATES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 text-[#061a3a] font-bold py-3 rounded-xl"
        >
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>
    </div>
  );
}
