'use client'

import Link from 'next/link'

type Job = {
  id: string
  title: string
  description: string
}

export default function ProDashboard() {
  // TEMP sample jobs (keeps same behavior you already had)
  const jobs: Job[] = [
    {
      id: '1',
      title: 'Home Cleaning',
      description: '4 bedrooms',
    },
  ]

  const claimJob = (jobId: string) => {
    alert('Missing STRIPE_SECRET_KEY (check .env.local and Vercel env vars)')
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Pro Dashboard</h1>

        <Link
  href="/jobs"
  className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white transition"
 >
  Browse Jobs
 </Link>
      </div>

      {/* Empty state */}
      {jobs.length === 0 && (
        <div className="text-gray-400">No jobs available</div>
      )}

      {/* Jobs */}
      {jobs.map((job) => (
        <div
          key={job.id}
          className="border border-slate-700 rounded-lg p-4 bg-slate-800"
        >
          <h2 className="text-lg font-semibold">{job.title}</h2>
          <p className="text-sm text-gray-300">{job.description}</p>

          <div className="mt-4 flex gap-3">
            <button
              onClick={() => claimJob(job.id)}
              className="px-3 py-1 rounded bg-green-600 hover:bg-green-700"
            >
              Claim ($10)
            </button>

            <button
  type="button"
  onClick={() => alert("Negotiate clicked")}
  className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600"
>
  Negotiate
</button>

<button
  type="button"
  onClick={() => alert("Hire clicked")}
  className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600"
>
  Hire
</button>

<button
  type="button"
  onClick={() => alert("Closed clicked")}
  className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600"
>
  Closed
</button>
	

          </div>
        </div>
      ))}
    </div>
  )
}
