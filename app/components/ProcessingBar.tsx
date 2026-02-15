"use client";

export default function ProcessingBar({
  title = "Processing...",
  message = "Processing...",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div className="w-full max-w-md mx-auto rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg">
      <div className="inline-flex items-center justify-center w-full">
        <div className="px-6 py-2 rounded-xl bg-green-500 text-black font-semibold">
          {title}
        </div>
      </div>

      <div className="mt-4 h-2 w-full rounded-full bg-white/10 overflow-hidden">
        <div className="h-full w-1/2 bg-green-500 animate-pulse" />
      </div>

      <div className="mt-3 text-white/80 font-medium">{message}</div>
    </div>
  );
}
	
