import { CalendarDays, Users, Wine } from 'lucide-react'
import MinyanCard from '../components/MinyanCard'
import { upcomingTfilot } from '../data/sampleData'

type HomePageProps = {
  registrations: Record<number, boolean>
  toggleRegistration: (tefilaId: number) => void
  openCalendar: () => void
  openKiddush: () => void
}

function HomePage({
  registrations,
  toggleRegistration,
  openCalendar,
  openKiddush,
}: HomePageProps) {
  return (
    <div className="space-y-6">
      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-sky-700">
              De närmaste dagarna
            </p>

            <h1 className="mt-1 text-2xl font-bold text-[#183b70]">
              Kommande tfilot
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Anmäl dig till de tillfällen du planerar att
              delta.
            </p>
          </div>

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-[#183b70]">
            <Users className="h-6 w-6" />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        {upcomingTfilot.map((tefila) => (
          <MinyanCard
            key={tefila.id}
            tefila={tefila}
            registered={Boolean(registrations[tefila.id])}
            onToggleRegistration={() =>
              toggleRegistration(tefila.id)
            }
          />
        ))}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-[#183b70]">
          Genvägar
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={openCalendar}
            className="rounded-3xl bg-[#183b70] p-5 text-left text-white shadow-sm transition hover:-translate-y-0.5"
          >
            <CalendarDays className="h-7 w-7" />

            <p className="mt-5 font-bold">Kalender</p>

            <p className="mt-1 text-sm text-blue-100">
              Tfilot och aktiviteter
            </p>
          </button>

          <button
            onClick={openKiddush}
            className="rounded-3xl bg-[#68123f] p-5 text-left text-white shadow-sm transition hover:-translate-y-0.5"
          >
            <Wine className="h-7 w-7" />

            <p className="mt-5 font-bold">Boka kiddush</p>

            <p className="mt-1 text-sm text-rose-100">
              Se kommande lediga datum
            </p>
          </button>
        </div>
      </section>
    </div>
  )
}

export default HomePage