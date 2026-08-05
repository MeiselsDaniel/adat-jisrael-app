import { Check, Clock } from 'lucide-react'
import type { Tefila } from '../types'

type MinyanCardProps = {
  tefila: Tefila
  registered: boolean
  onToggleRegistration: () => void
}

function MinyanCard({
  tefila,
  registered,
  onToggleRegistration,
}: MinyanCardProps) {
  const attending = tefila.attending + (registered ? 1 : 0)

  const attendanceColor =
    attending >= 10
      ? 'bg-emerald-100 text-emerald-900'
      : attending >= 8
        ? 'bg-amber-100 text-amber-900'
        : 'bg-rose-100 text-rose-900'

  const isKabbalatShabbat =
    tefila.title === 'Kabbalat Shabbat'

  return (
    <article
      className={`overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ${
        isKabbalatShabbat
          ? 'ring-[#68123f]/25'
          : 'ring-slate-200'
      }`}
    >
      {isKabbalatShabbat && (
        <div className="bg-[#68123f] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white">
          Erev Shabbat
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {tefila.day}
            </h2>

            <p className="mt-0.5 text-sm text-slate-500">
              {tefila.date}
            </p>

            <p
              className={`mt-3 font-bold ${
                isKabbalatShabbat
                  ? 'text-[#68123f]'
                  : 'text-[#183b70]'
              }`}
            >
              {tefila.title}
            </p>

            <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-600">
              <Clock className="h-4 w-4" />
              {tefila.time}
            </p>
          </div>

          <div
            className={`min-w-24 rounded-2xl px-3 py-3 text-center ${attendanceColor}`}
          >
            <p className="text-xl font-black">{attending}</p>

            <p className="text-[10px] font-bold uppercase tracking-wide">
              anmälda
            </p>
          </div>
        </div>

        <button
          onClick={onToggleRegistration}
          className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition ${
            registered
              ? 'bg-emerald-600 text-white'
              : isKabbalatShabbat
                ? 'bg-[#68123f] text-white hover:bg-[#561034]'
                : 'bg-[#183b70] text-white hover:bg-[#102d57]'
          }`}
        >
          <Check className="h-4 w-4" />

          {registered ? 'Du är anmäld' : 'Anmäl mig'}
        </button>

        {registered && (
          <button
            onClick={onToggleRegistration}
            className="mt-3 w-full text-center text-xs font-semibold text-slate-500 underline underline-offset-4"
          >
            Ta bort min anmälan
          </button>
        )}
      </div>
    </article>
  )
}

export default MinyanCard