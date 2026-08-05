import { Wine } from 'lucide-react'
import type { KiddushDate } from '../types'

type KiddushCardProps = {
  item: KiddushDate
}

function KiddushCard({ item }: KiddushCardProps) {
  return (
    <button className="flex w-full items-center gap-4 rounded-3xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-200 transition hover:shadow-md">
      <div
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
          item.available
            ? 'bg-rose-100 text-[#68123f]'
            : 'bg-slate-100 text-slate-500'
        }`}
      >
        <Wine className="h-6 w-6" />
      </div>

      <div className="flex-1">
        <h2 className="font-bold">{item.date}</h2>

        <p
          className={`mt-1 text-sm font-semibold ${
            item.available
              ? 'text-[#68123f]'
              : 'text-slate-600'
          }`}
        >
          {item.available
            ? 'Ledig att boka'
            : item.host}
        </p>

        {item.dedication && (
          <p className="mt-1 text-xs text-slate-500">
            {item.dedication}
          </p>
        )}
      </div>

      {item.available && (
        <span className="rounded-full bg-[#68123f] px-3 py-1.5 text-xs font-bold text-white">
          Boka
        </span>
      )}
    </button>
  )
}

export default KiddushCard