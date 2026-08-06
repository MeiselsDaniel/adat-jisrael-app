import { useState } from 'react'
import { saveEvent } from '../services/eventService'
import type { FormEvent } from 'react'
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  Check,
  Clock,
  Eye,
  MapPin,
  Repeat2,
  Save,
  Users,
} from 'lucide-react'
import type {
  AppEvent,
  EventType,
  EventVisibility,
  RecurrenceType,
} from '../types'

type NewEventPageProps = {
  currentUserId: string
  onBack: () => void
  onSave: (event: AppEvent) => void
}

const eventTypeNames: Record<EventType, string> = {
  tefila: 'Tefila',
  jahrzeit: 'Jahrzeit',
  kiddush: 'Kiddush',
  shiur: 'Shiur',
  activity: 'Aktivitet',
  holiday: 'Högtid',
  meeting: 'Möte',
  other: 'Annat',
}

function NewEventPage({
  currentUserId,
  onBack,
  onSave,
}: NewEventPageProps) {
  const [eventType, setEventType] =
    useState<EventType>('tefila')

  const [title, setTitle] = useState('Shacharit')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [location, setLocation] = useState('Adat Jisrael')

  const [visibility, setVisibility] =
    useState<EventVisibility>('allRegistered')

  const [showOnHome, setShowOnHome] = useState(true)
  const [showInCalendar, setShowInCalendar] = useState(true)
  const [allowRegistration, setAllowRegistration] =
    useState(true)
  const [showAttendeeCount, setShowAttendeeCount] =
    useState(true)
  const [showAttendeeNames, setShowAttendeeNames] =
    useState(true)
  const [sendPushNotification, setSendPushNotification] =
    useState(false)

  const [recurrence, setRecurrence] =
    useState<RecurrenceType>('none')
  const [recurrenceEndDate, setRecurrenceEndDate] =
    useState('')

  const [memorialName, setMemorialName] = useState('')
  const [memorialHebrewName, setMemorialHebrewName] =
    useState('')
  const [showMemorialName, setShowMemorialName] =
    useState(true)
  const [kaddishWillBeSaid, setKaddishWillBeSaid] =
    useState(true)

  const [kiddushHost, setKiddushHost] = useState('')
  const [kiddushDedication, setKiddushDedication] =
    useState('')

  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  function changeEventType(nextType: EventType) {
    setEventType(nextType)
    setSaved(false)

    if (nextType === 'tefila') {
      setTitle('Shacharit')
      setAllowRegistration(true)
      setShowOnHome(true)
    }

    if (nextType === 'jahrzeit') {
      setTitle('Maariv med Jahrzeit')
      setAllowRegistration(true)
      setShowOnHome(true)
    }

    if (nextType === 'kiddush') {
      setTitle('Kiddush')
      setAllowRegistration(false)
      setShowOnHome(false)
    }

    if (nextType === 'shiur') {
      setTitle('Shiur')
      setAllowRegistration(true)
      setShowOnHome(false)
    }

    if (nextType === 'activity') {
      setTitle('')
      setAllowRegistration(true)
      setShowOnHome(false)
    }

    if (nextType === 'holiday') {
      setTitle('')
      setAllowRegistration(false)
      setShowOnHome(false)
    }

    if (nextType === 'meeting') {
      setTitle('')
      setAllowRegistration(true)
      setShowOnHome(false)
    }

    if (nextType === 'other') {
      setTitle('')
      setAllowRegistration(false)
      setShowOnHome(false)
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()
    setError('')
    setSaved(false)

    if (!title.trim()) {
      setError('Skriv en titel för händelsen.')
      return
    }

    if (!startDate) {
      setError('Välj ett datum.')
      return
    }

    if (!startTime) {
      setError('Välj en starttid.')
      return
    }

    const newEvent: AppEvent = {
      id: crypto.randomUUID(),
      type: eventType,
      title: title.trim(),
      description: description.trim() || undefined,
      startDate,
      startTime,
      endTime: endTime || undefined,
      location: location.trim() || undefined,
      visibility,
      status: 'published',
      showOnHome,
      showInCalendar,
      allowRegistration,
      showAttendeeCount:
        allowRegistration && showAttendeeCount,
      showAttendeeNames:
        allowRegistration && showAttendeeNames,
      sendPushNotification,
      recurrence,
      recurrenceEndDate:
        recurrence !== 'none' && recurrenceEndDate
          ? recurrenceEndDate
          : undefined,
      createdAt: new Date().toISOString(),
      createdBy: currentUserId,

      memorialName:
        eventType === 'jahrzeit' && memorialName.trim()
          ? memorialName.trim()
          : undefined,

      memorialHebrewName:
        eventType === 'jahrzeit' &&
        memorialHebrewName.trim()
          ? memorialHebrewName.trim()
          : undefined,

      showMemorialName:
        eventType === 'jahrzeit'
          ? showMemorialName
          : undefined,

      kaddishWillBeSaid:
        eventType === 'jahrzeit'
          ? kaddishWillBeSaid
          : undefined,

      kiddushHost:
        eventType === 'kiddush' && kiddushHost.trim()
          ? kiddushHost.trim()
          : undefined,

      kiddushDedication:
        eventType === 'kiddush' &&
        kiddushDedication.trim()
          ? kiddushDedication.trim()
          : undefined,
    }

    try {
      await saveEvent(newEvent)
      onSave(newEvent)
      setSaved(true)
    } catch (caughtError) {
      console.error(
        'Kunde inte spara händelsen:',
        caughtError,
      )

      setError(
        'Händelsen kunde inte sparas. Försök igen.',
      )
    }
  }

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#183b70] shadow-sm ring-1 ring-slate-200"
          aria-label="Tillbaka"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div>
          <p className="text-sm font-semibold text-sky-700">
            Administration
          </p>

          <h1 className="text-2xl font-bold text-[#183b70]">
            Ny händelse
          </h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormSection title="Grunduppgifter">
          <Field label="Typ av händelse">
            <select
              value={eventType}
              onChange={(event) =>
                changeEventType(
                  event.target.value as EventType,
                )
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-600"
            >
              {Object.entries(eventTypeNames).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ),
              )}
            </select>
          </Field>

          <Field label="Titel">
            <input
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              type="text"
              placeholder="Exempel: Kabbalat Shabbat"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-600"
            />
          </Field>

          <Field label="Beskrivning">
            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              rows={4}
              placeholder="Information om händelsen"
              className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-600"
            />
          </Field>
        </FormSection>

        <FormSection title="Datum och tid">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Datum"
              icon={<CalendarDays className="h-4 w-4" />}
            >
              <input
                value={startDate}
                onChange={(event) =>
                  setStartDate(event.target.value)
                }
                type="date"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-600"
              />
            </Field>

            <Field
              label="Starttid"
              icon={<Clock className="h-4 w-4" />}
            >
              <input
                value={startTime}
                onChange={(event) =>
                  setStartTime(event.target.value)
                }
                type="time"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-600"
              />
            </Field>
          </div>

          <Field label="Sluttid, valfritt">
            <input
              value={endTime}
              onChange={(event) =>
                setEndTime(event.target.value)
              }
              type="time"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-600"
            />
          </Field>

          <Field
            label="Plats"
            icon={<MapPin className="h-4 w-4" />}
          >
            <input
              value={location}
              onChange={(event) =>
                setLocation(event.target.value)
              }
              type="text"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-600"
            />
          </Field>
        </FormSection>

        {eventType === 'jahrzeit' && (
          <FormSection title="Jahrzeit">
            <Field label="Namn på den avlidne">
              <input
                value={memorialName}
                onChange={(event) =>
                  setMemorialName(event.target.value)
                }
                type="text"
                placeholder="Exempel: Moshe ben Avraham"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-600"
              />
            </Field>

            <Field label="Hebreiskt namn, valfritt">
              <input
                value={memorialHebrewName}
                onChange={(event) =>
                  setMemorialHebrewName(event.target.value)
                }
                type="text"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-600"
              />
            </Field>

            <Toggle
              label="Visa namnet i appen"
              description="Namnet visas för de användare som kan se händelsen."
              checked={showMemorialName}
              onChange={setShowMemorialName}
            />

            <Toggle
              label="Kaddish kommer att sägas"
              checked={kaddishWillBeSaid}
              onChange={setKaddishWillBeSaid}
            />
          </FormSection>
        )}

        {eventType === 'kiddush' && (
          <FormSection title="Kiddush">
            <Field label="Värd eller familj">
              <input
                value={kiddushHost}
                onChange={(event) =>
                  setKiddushHost(event.target.value)
                }
                type="text"
                placeholder="Exempel: Familjen Cohen"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-600"
              />
            </Field>

            <Field label="Dedikation, valfritt">
              <textarea
                value={kiddushDedication}
                onChange={(event) =>
                  setKiddushDedication(event.target.value)
                }
                rows={3}
                placeholder="Till minne av eller till ära av..."
                className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-600"
              />
            </Field>
          </FormSection>
        )}

        <FormSection title="Synlighet och anmälan">
          <Field
            label="Vem får se händelsen?"
            icon={<Eye className="h-4 w-4" />}
          >
            <select
              value={visibility}
              onChange={(event) =>
                setVisibility(
                  event.target
                    .value as EventVisibility,
                )
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-600"
            >
              <option value="allRegistered">
                Alla registrerade
              </option>

              <option value="membersOnly">
                Endast medlemmar
              </option>

              <option value="adminsOnly">
                Endast administratörer
              </option>
            </select>
          </Field>

          <Toggle
            label="Visa på startsidan"
            checked={showOnHome}
            onChange={setShowOnHome}
          />

          <Toggle
            label="Visa i kalendern"
            checked={showInCalendar}
            onChange={setShowInCalendar}
          />

          <Toggle
            label="Tillåt anmälan"
            icon={<Users className="h-5 w-5" />}
            checked={allowRegistration}
            onChange={setAllowRegistration}
          />

          {allowRegistration && (
            <>
              <Toggle
                label="Visa antal anmälda"
                checked={showAttendeeCount}
                onChange={setShowAttendeeCount}
              />

              <Toggle
                label="Visa namn på anmälda"
                checked={showAttendeeNames}
                onChange={setShowAttendeeNames}
              />
            </>
          )}

          <Toggle
            label="Skicka pushnotis"
            icon={<Bell className="h-5 w-5" />}
            checked={sendPushNotification}
            onChange={setSendPushNotification}
          />
        </FormSection>

        <FormSection title="Återkommande">
          <Field
            label="Upprepning"
            icon={<Repeat2 className="h-4 w-4" />}
          >
            <select
              value={recurrence}
              onChange={(event) =>
                setRecurrence(
                  event.target.value as RecurrenceType,
                )
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-600"
            >
              <option value="none">
                Endast detta tillfälle
              </option>
              <option value="weekly">Varje vecka</option>
              <option value="monthly">Varje månad</option>
              <option value="yearly">Varje år</option>
            </select>
          </Field>

          {recurrence !== 'none' && (
            <Field label="Upprepa till och med, valfritt">
              <input
                value={recurrenceEndDate}
                onChange={(event) =>
                  setRecurrenceEndDate(event.target.value)
                }
                type="date"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-600"
              />
            </Field>
          )}
        </FormSection>

        {error && (
          <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
            {error}
          </div>
        )}

        {saved && (
          <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            <Check className="h-5 w-5" />
            Händelsen har sparats i Firebase.
          </div>
        )}

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#183b70] px-5 py-4 font-bold text-white transition hover:bg-[#102d57]"
        >
          <Save className="h-5 w-5" />
          Publicera händelse
        </button>

        <p className="px-3 text-center text-xs leading-5 text-slate-400">
          Händelsen sparas permanent i Firebase.
        </p>
      </form>
    </div>
  )
}

type FormSectionProps = {
  title: string
  children: React.ReactNode
}

function FormSection({
  title,
  children,
}: FormSectionProps) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="mb-5 text-lg font-bold text-[#183b70]">
        {title}
      </h2>

      <div className="space-y-4">{children}</div>
    </section>
  )
}

type FieldProps = {
  label: string
  icon?: React.ReactNode
  children: React.ReactNode
}

function Field({ label, icon, children }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
        {icon}
        {label}
      </span>

      {children}
    </label>
  )
}

type ToggleProps = {
  label: string
  description?: string
  icon?: React.ReactNode
  checked: boolean
  onChange: (checked: boolean) => void
}

function Toggle({
  label,
  description,
  icon,
  checked,
  onChange,
}: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center gap-4 rounded-2xl bg-slate-50 px-4 py-3 text-left"
    >
      {icon && (
        <span className="text-[#183b70]">{icon}</span>
      )}

      <span className="flex-1">
        <span className="block text-sm font-bold text-slate-700">
          {label}
        </span>

        {description && (
          <span className="mt-1 block text-xs leading-5 text-slate-500">
            {description}
          </span>
        )}
      </span>

      <span
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          checked ? 'bg-emerald-600' : 'bg-slate-300'
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
            checked ? 'left-6' : 'left-1'
          }`}
        />
      </span>
    </button>
  )
}

export default NewEventPage