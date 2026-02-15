import { Suspense } from "react";
import SignInClient from "./signin-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B1B3A] text-white flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <SignInClient />
    </Suspense>
  );
}
