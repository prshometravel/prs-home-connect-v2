import { Suspense } from "react";
import ProOnboardingClient from "./pro-onboarding-client";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B1B3A] text-white p-6">Loading…</div>}>
      <ProOnboardingClient />
    </Suspense>
  );
}
