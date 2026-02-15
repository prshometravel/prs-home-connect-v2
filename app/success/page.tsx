import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function SuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const sessionId = searchParams?.session_id;

  if (!sessionId) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Payment Success</h1>
        <p>Missing session_id. Please return to the Pro Dashboard.</p>
        <a href="/pro/dashboard">Go to Pro Dashboard</a>
      </main>
    );
  }

  // After Stripe success, immediately confirm payment on server
  redirect(`/api/payments/confirm?session_id=${encodeURIComponent(sessionId)}`);
}
