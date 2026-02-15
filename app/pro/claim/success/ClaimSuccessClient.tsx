"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

function ClaimSuccessInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const [progress, setProgress] = useState(10);
  const [message, setMessage] = useState("Processing claim...");

  useEffect(() => {
    const run = async () => {
      const session_id = searchParams.get("session_id");
      const job_id = searchParams.get("job_id");

      if (!session_id || !job_id) {
        setMessage("Missing required data");
        return;
      }

      // UPDATE JOB STATUS
      const { error } = await supabase
        .from("jobs")
        .update({ status: "claimed" })
        .eq("id", job_id);

      if (error) {
        console.error(error);
        setMessage("Failed to claim job");
        return;
      }

      setMessage("Done");
    };

    run();

    // PROGRESS BAR
    let p = 10;
    const interval = setInterval(() => {
      p += 10;
      setProgress(Math.min(100, p));
      if (p >= 100) clearInterval(interval);
    }, 250);

    return () => clearInterval(interval);
  }, [searchParams, supabase]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1F3A] px-4">
      <div className="w-full max-w-md bg-[#112E4A] rounded-2xl p-6 text-center shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-2">{message}</h1>

        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden mt-4">
          <div
            className="h-2 bg-green-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {message === "Done" && (
          <button
            onClick={() => router.push("/pro/dashboard")}
            className="mt-6 w-full bg-green-500 hover:bg-green-600 text-black font-bold py-2 rounded-lg"
          >
            Back to Dashboard
          </button>
        )}
      </div>
    </div>
  );
}

export default function ClaimSuccessClient() {
  return (
    <Suspense fallback={<div className="text-white">Loading...</div>}>
      <ClaimSuccessInner />
    </Suspense>
  );
}
