import EventCard from '../components/EventCard'
import { calendarEvents } from '../data/sampleData'

function CalendarPage() {
  return (
    <div>
      <p className="mb-5 text-sm leading-6 text-slate-500">
        Här visas Shabbat, högtider, tfilot, kiddush och
        andra aktiviteter.
      </p>

      <div className="space-y-3">
        {calendarEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  )
}

export default CalendarPage