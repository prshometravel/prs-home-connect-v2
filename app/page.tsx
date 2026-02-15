'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

type NavOption =
  | '/'
  | '/signin'
  | '/jobs'
  | '/homeowner/dashboard'
  | '/homeowner/post-job'
  | '/pro/dashboard'

export default function HomePage() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const jobTypes = useMemo(
    () => [
      'Roof Repair','Roof Replacement','Gutter Cleaning','Gutter Installation','Siding Repair','Siding Installation',
      'Window Repair','Window Installation','Door Repair','Door Installation','Deck Repair','Deck Building',
      'Fence Repair','Fence Installation','Concrete Repair','Concrete Driveway','Masonry / Brickwork','Foundation Repair',
      'Pressure Washing','Drywall Repair','Drywall Installation','Painting - Interior','Painting - Exterior',
      'Flooring - Tile','Flooring - Hardwood','Flooring - Vinyl/LVP','Carpet Installation','Kitchen Remodel',
      'Bathroom Remodel','Basement Finishing','Carpentry / Trim','Cabinet Installation','Electrical Troubleshooting',
      'Outlet / Switch Replacement','Ceiling Fan Installation','Light Fixture Installation','Panel Upgrade',
      'EV Charger Installation','Smart Home Setup','Plumbing Repair','Leak Detection','Water Heater Repair',
      'Water Heater Installation','Toilet Installation','Faucet / Sink Repair','Drain Cleaning','HVAC Repair',
      'HVAC Installation','Thermostat Installation','Garage Door Repair','Garage Door Installation','Opener Repair',
      'Opener Installation','Security Camera Installation','Alarm System Setup','Doorbell Camera Install',
      'Access Control / Locks','Rekey / Lock Change','Landscaping','Lawn Care','Tree Trimming','Mulch / Cleanup',
      'Irrigation Repair',
    ],
    []
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return jobTypes
    return jobTypes.filter((j) => j.toLowerCase().includes(q))
  }, [jobTypes, query])

  const onNavChange = (value: NavOption) => router.push(value)

  return (
    <div className="min-h-screen bg-[#0b1f3a] text-white">
      <div className="sticky top-0 z-10 bg-[#0b1f3a]/90 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* LOGO */}
            <Image src="/logo.png" alt="PRS Logo" width={80} height={80} priority />
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-tight">PRS Home Connect</span>
              <span className="text-xs text-white/60 leading-tight">
                Homeowners post jobs • Pros claim leads
              </span>
            </div>
          </div>

          <select
            onChange={(e) => onNavChange(e.target.value as NavOption)}
            defaultValue="/"
            className="bg-[#102a4c] border border-white/15 text-white rounded px-3 py-2 text-sm"
          >
            <option value="/">Home</option>
            <option value="/signin">Sign In</option>
            <option value="/jobs">View Jobs</option>
            <option value="/homeowner/dashboard">Homeowner Dashboard</option>
            <option value="/homeowner/post-job">Post a Job</option>
            <option value="/pro/dashboard">Pro Dashboard</option>
          </select>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-10 pb-6">
        <div className="bg-[#102a4c] border border-white/10 rounded-xl p-6 md:p-8 shadow-lg">
          <h1 className="text-2xl md:text-3xl font-bold">Find help fast. Get jobs fast.</h1>
          <p className="mt-2 text-white/70 max-w-2xl">
            Homeowners post a job in minutes. Pros browse jobs and claim leads.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              href="/signin"
              className="inline-flex items-center justify-center rounded-lg bg-green-600 hover:bg-green-700 px-5 py-3 font-semibold"
            >
              Sign In (Homeowner / Pro)
            </Link>

            <Link
              href="/jobs"
              className="inline-flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/15 px-5 py-3 font-semibold"
            >
              View Jobs
            </Link>

            <Link
              href="/homeowner/post-job"
              className="inline-flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/15 px-5 py-3 font-semibold"
            >
              Post a Job
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-8">
        <div className="bg-[#102a4c] border border-white/10 rounded-xl p-5 md:p-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-lg font-bold">Job Categories</h2>

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search job types…"
              className="w-full sm:w-72 bg-[#0b1f3a] border border-white/15 rounded px-3 py-2 text-sm text-white placeholder:text-white/40"
            />
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((name) => (
              <div
                key={name}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-sm hover:bg-white/10 transition"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-6">
        <div className="max-w-6xl mx-auto px-4 text-xs text-white/60 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} PRS Home Connect</span>
          <span>Dark blue + green UI</span>
        </div>
      </div>
    </div>
  )
}
