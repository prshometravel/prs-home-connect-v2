"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";

const US_STATES = [
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

const JOB_CATEGORIES = [
  // Plumbing
  "Plumbing Repair",
  "Drain Cleaning",
  "Leak Detection",
  "Pipe Replacement",
  "Faucet Repair/Install",
  "Toilet Repair/Install",
  "Sink Repair/Install",
  "Garbage Disposal Install",
  "Shower/Tub Repair",
  "Water Heater Repair",
  "Water Heater Install",
  "Tankless Water Heater",

  // Electrical
  "Electrical Repair",
  "Outlet Installation",
  "GFCI Outlet",
  "Light Fixture Install",
  "Recessed Lighting",
  "Ceiling Fan Install",
  "Breaker Replacement",
  "Panel Upgrade",
  "Surge Protection",
  "EV Charger Install",
  "Generator Install",
  "Generator Repair",
  "Wiring Repair",

  // HVAC
  "AC Repair",
  "AC Installation",
  "Furnace Repair",
  "Furnace Installation",
  "Thermostat Install",
  "Ductwork Repair",
  "Duct Cleaning",
  "Mini Split Install",
  "Heat Pump",

  // Roofing / gutters / exterior
  "Roof Leak Repair",
  "Shingle Replacement",
  "Roof Replacement",
  "Flashing Repair",
  "Gutter Installation",
  "Gutter Repair",
  "Gutter Cleaning",
  "Siding Repair",
  "Siding Installation",
  "Window Installation",
  "Window Repair",
  "Door Installation",
  "Door Repair",
  "Garage Door Repair",
  "Garage Door Installation",

  // Interior
  "Drywall Repair",
  "Drywall Installation",
  "Painting (Interior)",
  "Painting (Exterior)",
  "Flooring (LVP)",
  "Flooring (Laminate)",
  "Flooring (Hardwood)",
  "Hardwood Refinishing",
  "Carpet Installation",
  "Carpet Repair",
  "Tile Installation",
  "Tile Repair",
  "Baseboard / Trim",
  "Crown Molding",
  "Framing",
  "Insulation",

  // Kitchens / baths / remodel
  "Kitchen Remodel",
  "Bathroom Remodel",
  "Cabinet Installation",
  "Cabinet Refinishing",
  "Countertop Installation",
  "Backsplash Installation",
  "Vanity Installation",
  "Shower Installation",
  "Tub Installation",

  // Outdoor / structures
  "Deck Building",
  "Deck Repair",
  "Fence Installation",
  "Fence Repair",
  "Pergola / Patio Cover",
  "Concrete (Driveway)",
  "Concrete (Patio)",
  "Concrete Repair",
  "Masonry / Brick Repair",
  "Stone Work",

  // Landscaping / yard
  "Landscaping",
  "Lawn Care",
  "Mulch / Pinestraw",
  "Sod Installation",
  "Tree Trimming",
  "Tree Removal",
  "Stump Grinding",
  "Irrigation / Sprinklers",
  "Drainage / Grading",
  "Pressure Washing",
  "Leaf Cleanup",

  // Security / low voltage
  "Security Cameras",
  "Alarm System",
  "Smart Doorbell",
  "Smart Lock Install",
  "Access Control",
  "Locks / Rekey",

  // Appliances
  "Appliance Repair",
  "Washer Repair",
  "Dryer Repair",
  "Refrigerator Repair",
  "Dishwasher Repair",
  "Oven/Stove Repair",
  "Microwave Repair",

  // Cleaning / moving / general
  "Handyman",
  "Furniture Assembly",
  "TV Mounting",
  "Junk Removal",
  "Hauling",
  "Home Cleaning",
  "Deep Cleaning",
  "Move-Out Cleaning",
  "General Contractor",

  // Care Services (in-home support)
  "CNA / Certified Nursing Assistant",
  "Home Health Aide",
  "Caregiver / Companion Care",
  "Senior Care (Non-Clinical)",
  "Respite Care",
  "Personal Care (Bathing/Dressing)",
  "Meal Prep / Feeding Assistance",
  "Medication Reminders (Non-Clinical)",
  "Errands / Grocery Runs",
  "Transportation (Appointments/Errands)",
  "Mobility Assistance",
  "Post-Hospital Support (Non-Clinical)",
  "Sitter / Overnight Companion",
];

export default function HomeownerCreateJobPage() {
  const supabase = useMemo(() => createClient(), []);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const input =
    "w-full rounded-xl px-4 py-3 bg-[#072044] text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-green-400/70";
  const label = "text-sm text-white/85 mb-1";
  const panel = "bg-[#0b2a5a] border border-white/10 rounded-2xl";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) return setError("Job title required.");
    if (!description.trim()) return setError("Description required.");
    if (!category) return setError("Job type required.");
    if (!city.trim()) return setError("City required.");
    if (!state) return setError("State required.");

    setSubmitting(true);

    try {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const user = userData?.user;

      if (!user) {
        setError("Sign in required.");
        setSubmitting(false);
        return;
      }

      const payload: any = {
        title: title.trim(),
        description: description.trim(),
        category,
        city: city.trim(),
        state,
        status: "open",
        homeowner_id: user.id,
      };

      const { error: insErr } = await supabase.from("jobs").insert(payload);
      if (insErr) throw insErr;

      window.location.href = "/homeowner/dashboard";
    } catch (err: any) {
      setError(err?.message || "Post failed.");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#061a3a] text-white">
      <div className="max-w-2xl mx-auto p-6">
        <div className={`${panel} p-6`}>
          <div className="flex items-center justify-between">
  <h1 className="text-2xl font-bold">Post a Job</h1>

  <a
    href="/"
    className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-white hover:bg-white/20"
  >
    Home
  </a>
</div>


          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <div className={label}>Job Title</div>
              <input
                className={input}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Job title"
              />
            </div>

            <div>
              <div className={label}>Description</div>
              <textarea
                className={`${input} min-h-[120px]`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Job details"
              />
            </div>

            <div>
              <div className={label}>Job Type</div>
              <select
                className={input}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select job type</option>
                {JOB_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className={label}>City</div>
                <input
                  className={input}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                />
              </div>

              <div>
                <div className={label}>State</div>
                <select
                  className={input}
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                >
                  <option value="">Select state</option>
                  {US_STATES.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100">
                {error}
              </div>
            )}

            <button
              className="w-full rounded-xl px-4 py-3 font-semibold bg-green-500 text-[#061a3a] hover:bg-green-400 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              {submitting ? "Posting..." : "Post Job"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
