import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Wine,
} from 'lucide-react'

export type KiddushStatus =
  | 'available'
  | 'pending'
  | 'booked'

export type KiddushListItem = {
  id: string
  date: string
  dateValue: string
  occasion: string
  status: KiddushStatus
  host?: string
  dedication?: string
  comment?: string
}

type KiddushCardProps = {
  item: KiddushListItem
  onBook: (item: KiddushListItem) => void
}

function KiddushCard({
  item,
  onBook,
}: KiddushCardProps) {
  const isAvailable = item.status === 'available'
  const isPending = item.status === 'pending'
  const isBooked = item.status === 'booked'

  return (
    <article
      className={`overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ${
        isAvailable
          ? 'ring-emerald-200'
          : isPending
            ? 'ring-amber-200'
            : 'ring-slate-200'
      }`}
    >
      <div className="flex items-start gap-4 p-4">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
            isAvailable
              ? 'bg-emerald-100 text-emerald-800'
              : isPending
                ? 'bg-amber-100 text-amber-800'
                : 'bg-rose-100 text-[#68123f]'
          }`}
        >
          <Wine className="h-6 w-6" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
            <CalendarDays className="h-3.5 w-3.5" />
            {item.occasion}
          </p>

          <h2 className="mt-1 font-bold text-slate-900">
            {item.date}
          </h2>

          {isAvailable && (
            <p className="mt-2 font-semibold text-emerald-700">
              Ledig att boka
            </p>
          )}

          {isPending && (
            <div className="mt-2">
              <p className="flex items-center gap-1.5 font-semibold text-amber-800">
                <Clock3 className="h-4 w-4" />
                Bokningsförfrågan
              </p>

              {item.host && (
                <p className="mt-1 text-sm text-slate-600">
                  {item.host}
                </p>
              )}
            </div>
          )}

          {isBooked && (
            <div className="mt-2">
              <p className="flex items-center gap-1.5 font-semibold text-[#68123f]">
                <CheckCircle2 className="h-4 w-4" />
                Bokad
              </p>

              {item.host && (
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {item.host}
                </p>
              )}
            </div>
          )}

          {item.dedication && (
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {item.dedication}
            </p>
          )}
        </div>
      </div>

      {isAvailable && (
        <button
          type="button"
          onClick={() => onBook(item)}
          className="flex w-full items-center justify-between border-t border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-900 transition hover:bg-emerald-100"
        >
          Boka Kiddush
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      {isPending && (
        <div className="border-t border-amber-100 bg-amber-50 px-4 py-3 text-xs font-semibold leading-5 text-amber-900">
          Förfrågan väntar på godkännande från Adat Jisrael.
        </div>
      )}
    </article>
  )
}

export default KiddushCard