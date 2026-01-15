export default function ProDashboard() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0b1220] to-[#0f1c3a] text-white p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Pro Dashboard</h1>
        <p className="text-gray-300 mb-6">
          Manage your jobs, leads, and profile.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-[#111c3a] rounded-xl p-5">
            <h2 className="text-lg font-semibold mb-2">New Leads</h2>
            <p className="text-gray-400 text-sm">
              View available jobs in your area.
            </p>
          </div>

          <div className="bg-[#111c3a] rounded-xl p-5">
            <h2 className="text-lg font-semibold mb-2">My Jobs</h2>
            <p className="text-gray-400 text-sm">
              Track jobs you accepted.
            </p>
          </div>

          <div className="bg-[#111c3a] rounded-xl p-5">
            <h2 className="text-lg font-semibold mb-2">Profile</h2>
            <p className="text-gray-400 text-sm">
              Update your business info and services.
            </p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <a
            href="/"
            className="inline-block bg-green-500 hover:bg-green-600 text-black font-semibold px-6 py-3 rounded-lg"
          >
            Go Home
          </a>
        </div>
      </div>
    </main>
  );
}
