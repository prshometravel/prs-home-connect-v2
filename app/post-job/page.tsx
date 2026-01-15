"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

const JOB_CATEGORIES = [
  "Plumbing",
  "Electrical",
  "TV Mounting",
  "Home Cleaning",
  "Deep Cleaning",
  "Move In / Move Out Cleaning",
  "Handyman",
  "General Repairs",
  "Drywall Repair",
  "Painting (Interior)",
  "Painting (Exterior)",
  "Carpentry",
  "Flooring",
  "Tile Work",
  "Bathroom Remodel",
  "Kitchen Remodel",
  "Door Installation/Repair",
  "Window Installation/Repair",
  "Fence Repair/Install",
  "Deck Repair/Build",
  "Pressure Washing",
  "Gutter Cleaning",
  "Roof Repair",
  "Siding Repair",
  "Appliance Repair",
  "Junk Removal",
  "Furniture Assembly",
  "Mount Shelves / Mirrors",
  "Smart Home / Cameras",
  "Security System Install",
  "Lock Change / Locksmith",
  "Garage Door Repair",
  "HVAC Service",
  "Ceiling Fan Install",
  "Light Fixture Install",
  "Toilet Repair/Replace",
  "Faucet Repair/Replace",
  "Water Heater",
  "Drain/Clog",
  "Lawn Care",
  "Landscaping",
  "Tree Trimming",
  "Concrete / Cement",
  "Moving Help",
  "Delivery / Hauling",
  "CNA / Caregiver (Non-medical)",
  "Senior Companion Care",
  "Transportation Assistance",
  "Other",
] as const;

export default function PostJobPage() {
  const router = useRouter();

  const [category, setCategory] = useState<string>(JOB_CATEGORIES[0]);
  const [description, setDescription] = useState<string>("");
  const [title, setTitle] = useState<string>(""); // optional but useful
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>("");

  const canSubmit = useMemo(() => {
    const descOk = description.trim().length >= 10;
    const catOk = !!category;
    return descOk && catOk && !loading;
  }, [category, description, loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    // Require login (homeowner)
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (!user) {
      setMsg("Please sign in as a homeowner first.");
      router.push("/homeowner/login");
      return;
    }

    if (description.trim().length < 10) {
      setMsg("Please add a little more detail (at least 10 characters).");
      return;
    }

    setLoading(true);
    try {
      // Insert into jobs table
      const payload: any = {
        category,
        description: description.trim(),
        status: "open",
        homeowner_id: user.id,
      };

      // Title optional. If your jobs table has a title column, it will save.
      // If it does NOT, Supabase will ignore it only if your insert is strict? Usually it errors.
      // So we only add title if user typed it.
      if (title.trim().length > 0) payload.title = title.trim();

      const { error } = await supabase.from("jobs").insert(payload);

      if (error) throw error;

      setMsg("✅ Job posted successfully!");
      setDescription("");
      setTitle("");

      // Go to jobs list or homeowner dashboard
      router.push("/jobs");
    } catch (err: any) {
      console.error(err);
      setMsg(`❌ Could not post job: ${err?.message ?? "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "32px 16px",
        background: "linear-gradient(180deg,#0b1b2b,#0b2a3a)",
        color: "#fff",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <h1 style={{ fontSize: 40, marginBottom: 6, textAlign: "center" }}>
          Post a Job
        </h1>
        <p style={{ textAlign: "center", opacity: 0.9, marginBottom: 22 }}>
          Tell us what you need done and connect with trusted local professionals.
        </p>

        <form
          onSubmit={handleSubmit}
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 18,
            padding: 18,
          }}
        >
          <label style={{ display: "block", marginBottom: 8, fontWeight: 700 }}>
            Job Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.25)",
              background: "rgba(0,0,0,0.25)",
              color: "#fff",
              marginBottom: 16,
              outline: "none",
            }}
          >
            {JOB_CATEGORIES.map((c) => (
              <option key={c} value={c} style={{ color: "#000" }}>
                {c}
              </option>
            ))}
          </select>

          <label style={{ display: "block", marginBottom: 8, fontWeight: 700 }}>
            Job Title (optional)
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Example: Fix leaking faucet"
            style={{
              width: "100%",
              padding: "12px 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.25)",
              background: "rgba(0,0,0,0.25)",
              color: "#fff",
              marginBottom: 16,
              outline: "none",
            }}
          />

          <label style={{ display: "block", marginBottom: 8, fontWeight: 700 }}>
            Job Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what you need done (address not required yet)."
            rows={5}
            style={{
              width: "100%",
              padding: "12px 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.25)",
              background: "rgba(0,0,0,0.25)",
              color: "#fff",
              marginBottom: 16,
              outline: "none",
              resize: "vertical",
            }}
          />

          <button
            type="submit"
            disabled={!canSubmit}
            style={{
              width: "100%",
              padding: "14px 14px",
              borderRadius: 14,
              border: "none",
              fontWeight: 800,
              cursor: canSubmit ? "pointer" : "not-allowed",
              background: canSubmit ? "#19d36b" : "rgba(25,211,107,0.35)",
              color: "#0b1b2b",
              fontSize: 16,
            }}
          >
            {loading ? "Posting..." : "Continue"}
          </button>

          {msg ? (
            <div style={{ marginTop: 12, fontWeight: 700 }}>{msg}</div>
          ) : null}
        </form>

        <div style={{ marginTop: 16, textAlign: "center" }}>
          <button
            onClick={() => router.push("/")}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.35)",
              color: "#fff",
              padding: "10px 14px",
              borderRadius: 12,
              cursor: "pointer",
            }}
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
