import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 to-slate-900 text-white px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-2">Create an account</h1>
        <p className="text-slate-300 mb-6">
          Choose what type of account you want to create.
        </p>

        <div className="space-y-3">
          <Link
            href="/homeowner/register"
            className="block w-full text-center rounded-xl bg-white/10 border border-white/10 py-3 font-semibold hover:bg-white/15 transition"
          >
            Homeowner Account
          </Link>

          <Link
            href="/pro/register"
            className="block w-full text-center rounded-xl bg-green-500 py-3 font-semibold text-black hover:bg-green-400 transition"
          >
            Pro Account
          </Link>
        </div>

        <div className="mt-6 flex items-center justify-between text-sm text-slate-300">
          <Link href="/" className="hover:text-white">
            ← Home
          </Link>
          <Link href="/signin" className="hover:text-white">
            Sign In →
          </Link>
        </div>
      </div>
    </main>
  );
}
