"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// IMPORTANT: this path must match YOUR project.
// From app/test-stripe/page.tsx to /lib/supabaseClient.ts is: ../../lib/supabaseClient
import { supabase } from "../../lib/supabaseClient";

export default function TestStripePage() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token ?? null;
      if (mounted) {
        setToken(accessToken);
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handleCheckout = async () => {
    try {
      if (!token) {
        alert("You must be signed in first.");
        return;
      }

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobId: "test-job-id",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Checkout error:", data);
        alert(data?.error || "Stripe error");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Stripe error (no url returned)");
        console.error(data);
      }
    } catch (err) {
      console.error(err);
      alert("Stripe error");
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Test Stripe Checkout</h1>

      {loading ? (
        <p>Checking session...</p>
      ) : token ? (
        <p style={{ color: "green" }}>Signed in ✅</p>
      ) : (
        <p style={{ color: "crimson" }}>
          Not signed in ❌ — go <Link href="/signin">Sign in</Link> then come back.
        </p>
      )}

      <button
        onClick={handleCheckout}
        style={{ padding: "12px 20px", fontSize: 16, cursor: "pointer" }}
      >
        Pay $10
      </button>
    </div>
  );
}
	
