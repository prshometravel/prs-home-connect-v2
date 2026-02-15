"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function ProClaimSuccess() {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Processing payment...");

  useEffect(() => {
    const run = async () => {
      try {
        const sessionId = params.get("session_id");

        if (!sessionId) {
          setMessage("Missing payment session.");
          setLoading(false);
          return;
        }

        // Call your API route to confirm claim
        const res = await fetch("/api/confirm-claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId }),
        });

        const data = await res.json();

        if (!res.ok) {
          setMessage(data.error || "Payment confirmation failed.");
        } else {
          setMessage("Job claimed successfully!");
        }
      } catch (err) {
        console.error(err);
        setMessage("Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [params]);

  return (
    <div className="min-h-screen bg-[#0b1c2c] flex items-center justify-center text-white p-6">
      <div className="bg-[#112d4e] p-6 rounded-xl w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Claim Status</h1>

        {loading ? (
          <p>Processing...</p>
        ) : (
          <p>{message}</p>
        )}

        <button
          onClick={() => router.push("/pro/dashboard")}
          className="mt-6 bg-green-500 text-black px-4 py-2 rounded-lg"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
