"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function HomeownerPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/signin");
        return;
      }

      setLoading(false);
    };

    checkAuth();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F2A44] text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F2A44] text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Homeowner Dashboard</h1>

        <p className="mb-6 text-white/80">
          Welcome to PRS Home Connect. From here you’ll be able to post jobs and
          manage your requests.
        </p>

        <div className="flex gap-4">
          <Link
            href="/jobs"
            className="rounded bg-green-500 px-4 py-2 font-semibold"
          >
            View Jobs
          </Link>

          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/signin");
            }}
            className="rounded bg-red-500 px-4 py-2 font-semibold"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
