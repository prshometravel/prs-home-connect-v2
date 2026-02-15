export const dynamic = "force-dynamic";

export default function CancelPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Payment Canceled</h1>
      <p>No charge was made. You can try claiming the job again.</p>
      <a href="/pro/dashboard">Back to Pro Dashboard</a>
    </main>
  );
}
