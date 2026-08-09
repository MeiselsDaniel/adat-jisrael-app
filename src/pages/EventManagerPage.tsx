import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  FilePenLine,
  LoaderCircle,
  MapPin,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  TriangleAlert,
  XCircle,
} from 'lucide-react'
import {
  cancelEvent,
  deleteEvent,
  publishEvent,
  subscribeToAllEvents,
  type StoredAppEvent,
} from '../services/eventService'
import type {
  EventStatus,
  EventType,
} from '../types'

type EventManagerPageProps = {
  onBack: () => void
  onCreateEvent: () => void
  onEditEvent: (event: StoredAppEvent) => void
}

type EventFilter =
  | 'upcoming'
  | 'cancelled'
  | 'all'

function EventManagerPage({
  onBack,
  onCreateEvent,
  onEditEvent,
}: EventManagerPageProps) {
  const [events, setEvents] = useState<
    StoredAppEvent[]
  >([])

  const [filter, setFilter] =
    useState<EventFilter>('upcoming')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [savingEventId, setSavingEventId] =
    useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError('')

    const unsubscribe = subscribeToAllEvents(
      (items) => {
        setEvents(items)
        setLoading(false)
      },
      () => {
        setError(
          'Händelserna kunde inte hämtas från Firebase.',
        )
        setLoading(false)
      },
    )

    return unsubscribe
  }, [])

  const today = getTodayDateValue()

  const upcomingEvents = useMemo(
    () =>
      events.filter(
        (event) =>
          event.startDate >= today &&
          event.status !== 'cancelled',
      ),
    [events, today],
  )

  const cancelledEvents = useMemo(
    () =>
      events.filter(
        (event) =>
          event.status === 'cancelled',
      ),
    [events],
  )

  const filteredEvents = useMemo(() => {
    switch (filter) {
      case 'cancelled':
        return cancelledEvents

      case 'all':
        return events

      case 'upcoming':
      default:
        return upcomingEvents
    }
  }, [
    filter,
    events,
    upcomingEvents,
    cancelledEvents,
  ])

  async function runEventAction(
    eventId: string,
    action: () => Promise<void>,
  ) {
    setSavingEventId(eventId)
    setError('')

    try {
      await action()
    } catch (caughtError) {
      console.error(
        'Kunde inte uppdatera händelsen:',
        caughtError,
      )

      setError(
        'Händelsen kunde inte uppdateras. Försök igen.',
      )
    } finally {
      setSavingEventId(null)
    }
  }

  function handleCancel(event: StoredAppEvent) {
    const confirmed = window.confirm(
      `Vill du ställa in “${event.title}”? Händelsen ligger kvar men markeras tydligt som inställd.`,
    )

    if (!confirmed) {
      return
    }

    void runEventAction(event.id, () =>
      cancelEvent(event.id),
    )
  }

  function handlePublish(event: StoredAppEvent) {
    void runEventAction(event.id, () =>
      publishEvent(event.id),
    )
  }

  function handleDelete(event: StoredAppEvent) {
    const confirmed = window.confirm(
      `Vill du ta bort “${event.title}” permanent? Detta går inte att ångra.`,
    )

    if (!confirmed) {
      return
    }

    void runEventAction(event.id, () =>
      deleteEvent(event.id),
    )
  }

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#183b70] shadow-sm ring-1 ring-slate-200"
          aria-label="Tillbaka"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-sky-700">
            Administration
          </p>

          <h1 className="text-2xl font-bold text-[#183b70]">
            Händelser och tfilot
          </h1>
        </div>
      </header>

      <button
        type="button"
        onClick={onCreateEvent}
        className="flex w-full items-center gap-4 rounded-3xl bg-[#183b70] p-5 text-left text-white shadow-sm transition hover:bg-[#102d57]"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
          <Plus className="h-6 w-6" />
        </div>

        <div className="flex-1">
          <p className="text-lg font-bold">
            Ny händelse
          </p>

          <p className="mt-1 text-sm text-blue-100">
            Skapa tfilah, aktivitet, Jahrzeit eller
            annan händelse
          </p>
        </div>

        <ChevronRight className="h-5 w-5" />
      </button>

      <section className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1.5">
        <FilterButton
          label="Kommande"
          count={upcomingEvents.length}
          active={filter === 'upcoming'}
          onClick={() => setFilter('upcoming')}
        />

        <FilterButton
          label="Inställda"
          count={cancelledEvents.length}
          active={filter === 'cancelled'}
          onClick={() => setFilter('cancelled')}
        />

        <FilterButton
          label="Alla"
          count={events.length}
          active={filter === 'all'}
          onClick={() => setFilter('all')}
        />
      </section>

      {error && (
        <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold leading-6 text-rose-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-3 rounded-3xl bg-white py-12 text-slate-500 shadow-sm ring-1 ring-slate-200">
          <LoaderCircle className="h-5 w-5 animate-spin" />
          Hämtar händelser…
        </div>
      ) : filteredEvents.length === 0 ? (
        <EmptyEventsState filter={filter} />
      ) : (
        <section className="space-y-3">
          {filteredEvents.map((event) => (
            <EventAdminCard
              key={event.id}
              event={event}
              saving={
                savingEventId === event.id
              }
              onEdit={() =>
                onEditEvent(event)
              }
              onCancel={() =>
                handleCancel(event)
              }
              onPublish={() =>
                handlePublish(event)
              }
              onDelete={() =>
                handleDelete(event)
              }
            />
          ))}
        </section>
      )}
    </div>
  )
}

type FilterButtonProps = {
  label: string
  count: number
  active: boolean
  onClick: () => void
}

function FilterButton({
  label,
  count,
  active,
  onClick,
}: FilterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-2 py-2.5 text-xs font-bold transition ${
        active
          ? 'bg-white text-[#183b70] shadow-sm'
          : 'text-slate-500'
      }`}
    >
      {label} ({count})
    </button>
  )
}

type EventAdminCardProps = {
  event: StoredAppEvent
  saving: boolean
  onEdit: () => void
  onCancel: () => void
  onPublish: () => void
  onDelete: () => void
}

function EventAdminCard({
  event,
  saving,
  onEdit,
  onCancel,
  onPublish,
  onDelete,
}: EventAdminCardProps) {
  const isCancelled =
    event.status === 'cancelled'

  return (
    <article
      className={`overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ${
        isCancelled
          ? 'ring-rose-300'
          : 'ring-slate-200'
      }`}
    >
      {isCancelled && (
        <div className="bg-rose-700 px-4 py-2 text-xs font-black uppercase tracking-widest text-white">
          Inställd
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
              isCancelled
                ? 'bg-rose-100 text-rose-800'
                : getEventIconStyle(event.type)
            }`}
          >
            {getEventIcon(event.type)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                {getEventTypeName(event.type)}
              </span>

              <EventStatusBadge
                status={event.status}
              />
            </div>

            <h2 className="mt-3 text-lg font-bold text-slate-900">
              {event.title}
            </h2>

            <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-600">
              <CalendarDays className="h-4 w-4 text-[#183b70]" />
              {formatSwedishDate(
                event.startDate,
              )}
            </p>

            <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
              <Clock className="h-4 w-4" />
              {event.startTime}
              {event.endTime
                ? `–${event.endTime}`
                : ''}
            </p>

            {event.location && (
              <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                <MapPin className="h-4 w-4" />
                {event.location}
              </p>
            )}

            {event.description && (
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
                {event.description}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={onEdit}
            className="flex items-center justify-center gap-2 rounded-2xl bg-sky-50 px-3 py-3 text-sm font-bold text-[#183b70] ring-1 ring-sky-200 disabled:opacity-60"
          >
            <FilePenLine className="h-4 w-4" />
            Redigera
          </button>

          {isCancelled ? (
            <button
              type="button"
              disabled={saving}
              onClick={onPublish}
              className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-3 py-3 text-sm font-bold text-white disabled:opacity-60"
            >
              <RotateCcw className="h-4 w-4" />
              Återaktivera
            </button>
          ) : (
            <button
              type="button"
              disabled={saving}
              onClick={onCancel}
              className="flex items-center justify-center gap-2 rounded-2xl bg-rose-50 px-3 py-3 text-sm font-bold text-rose-800 ring-1 ring-rose-200 disabled:opacity-60"
            >
              <XCircle className="h-4 w-4" />
              Ställ in
            </button>
          )}
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={onDelete}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl px-3 py-2.5 text-xs font-bold text-slate-400 transition hover:bg-rose-50 hover:text-rose-700 disabled:opacity-60"
        >
          <Trash2 className="h-4 w-4" />
          Ta bort permanent
        </button>

        {saving && (
          <p className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Sparar ändringen…
          </p>
        )}
      </div>
    </article>
  )
}

function EventStatusBadge({
  status,
}: {
  status: EventStatus
}) {
  const labels: Record<
    EventStatus,
    string
  > = {
    draft: 'Utkast',
    scheduled: 'Planerad',
    published: 'Publicerad',
    cancelled: 'Inställd',
  }

  const styles: Record<
    EventStatus,
    string
  > = {
    draft: 'bg-slate-100 text-slate-700',
    scheduled: 'bg-amber-100 text-amber-800',
    published:
      'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-rose-100 text-rose-800',
  }

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${styles[status]}`}
    >
      {labels[status]}
    </span>
  )
}

function EmptyEventsState({
  filter,
}: {
  filter: EventFilter
}) {
  const messages: Record<
    EventFilter,
    string
  > = {
    upcoming:
      'Det finns inga kommande händelser i Firebase.',
    cancelled:
      'Det finns inga inställda händelser.',
    all: 'Det finns inga sparade händelser.',
  }

  return (
    <section className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
        <Search className="h-7 w-7" />
      </div>

      <h2 className="mt-5 font-bold text-slate-800">
        Inga händelser
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {messages[filter]}
      </p>
    </section>
  )
}

function getEventTypeName(
  type: EventType,
): string {
  const names: Record<EventType, string> = {
    tefila: 'Tfilah',
    jahrzeit: 'Jahrzeit',
    kiddush: 'Kiddush',
    shiur: 'Shiur',
    activity: 'Fest',
    holiday: 'Högtid',
    meeting: 'Möte',
    other: 'Annat',
  }

  return names[type]
}

function getEventIcon(type: EventType) {
  switch (type) {
    case 'tefila':
      return (
        <CheckCircle2 className="h-5 w-5" />
      )

    case 'holiday':
      return (
        <TriangleAlert className="h-5 w-5" />
      )

    default:
      return (
        <CalendarDays className="h-5 w-5" />
      )
  }
}

function getEventIconStyle(
  type: EventType,
): string {
  switch (type) {
    case 'tefila':
      return 'bg-sky-100 text-[#183b70]'

    case 'kiddush':
      return 'bg-rose-100 text-[#68123f]'

    case 'holiday':
      return 'bg-amber-100 text-amber-800'

    case 'jahrzeit':
      return 'bg-violet-100 text-violet-800'

    default:
      return 'bg-emerald-100 text-emerald-800'
  }
}

function formatSwedishDate(
  dateValue: string,
): string {
  const date = new Date(
    `${dateValue}T12:00:00`,
  )

  return new Intl.DateTimeFormat('sv-SE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function getTodayDateValue(): string {
  const now = new Date()
  const year = now.getFullYear()

  const month = String(
    now.getMonth() + 1,
  ).padStart(2, '0')

  const day = String(
    now.getDate(),
  ).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export default EventManagerPage