import { ChevronRight, Clock } from 'lucide-react'
import type { CalendarEvent } from '../types'

type EventCardProps = {
  event: CalendarEvent
}

function EventCard({ event }: EventCardProps) {
  return (
    <button className="flex w-full items-center gap-4 rounded-3xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-200 transition hover:shadow-md">
      <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-sky-100 text-[#183b70]">
        <span className="text-xs font-bold">
          {event.month}
        </span>

        <span className="text-2xl font-black">
          {event.dateNumber}
        </span>
      </div>

      <div className="flex-1">
        <p className="text-xs font-semibold text-slate-500">
          {event.weekday}
        </p>

        <span className="mt-1 inline-block text-xs font-bold uppercase tracking-wide text-sky-700">
          {event.category}
        </span>

        <h2 className="mt-1 font-bold">{event.title}</h2>

        <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
          <Clock className="h-4 w-4" />
          {event.time}
        </p>
      </div>

      <ChevronRight className="h-5 w-5 text-slate-400" />
    </button>
  )
}

export default EventCard