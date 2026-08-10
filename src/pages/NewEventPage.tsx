import { useState } from 'react'
import { saveEvent } from '../services/eventService'
import {
  createNewsPost,
} from '../services/newsService'
import {
  saveTefila,
  type TefilaRecord,
} from '../services/tefilaService'
import type { FormEvent } from 'react'
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  Check,
  Clock,
  Eye,
  ImagePlus,
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
import { synagogueSettings } from '../data/settings'
import { uploadEventImage } from '../services/imageUploadService'
import type { StoredAppEvent } from '../services/eventService'

type NewEventPageProps = {
  currentUserId: string
  initialEvent?: StoredAppEvent | null
  onBack: () => void
  onSave: (event: AppEvent) => void
}

const eventTypeNames: Partial<
  Record<EventType, string>
> = {
  tefila: 'Tefila',
  jahrzeit: 'Jahrzeit',
  shiur: 'Shiur',
  activity: 'Fest',
  holiday: 'Högtid',
  meeting: 'Möte',
  other: 'Annat',
}

function supportsRichEvent(
  type: EventType,
): boolean {
  return (
    type === 'activity' ||
    type === 'shiur' ||
    type === 'meeting' ||
    type === 'holiday' ||
    type === 'other'
  )
}

function supportsEventPricing(
  type: EventType,
): boolean {
  return (
    type === 'activity' ||
    type === 'shiur' ||
    type === 'meeting' ||
    type === 'other'
  )
}

function NewEventPage({
  currentUserId,
  initialEvent,
  onBack,
  onSave,
}: NewEventPageProps) {
  const [eventType, setEventType] =
    useState<EventType>(
      initialEvent?.type ?? 'tefila',
    )

  const [title, setTitle] = useState(
    initialEvent?.title ?? 'Shacharit',
  )
  const [description, setDescription] = useState(
    initialEvent?.description ?? '',
  )
  const [startDate, setStartDate] = useState(
    initialEvent?.startDate ?? '',
  )
  const [startTime, setStartTime] = useState(
    initialEvent?.startTime ?? '',
  )
  const [endTime, setEndTime] = useState(
    initialEvent?.endTime ?? '',
  )
  const [location, setLocation] = useState(
    initialEvent?.location ?? 'Adat Jisrael',
  )

  const [imageUrl, setImageUrl] =
    useState(initialEvent?.imageUrl ?? '')

  const [imageUploading, setImageUploading] =
    useState(false)

  const [imageError, setImageError] =
    useState('')

  const [memberPrice, setMemberPrice] =
    useState(
      initialEvent?.memberPrice !== undefined
        ? String(initialEvent.memberPrice)
        : '',
    )

  const [nonMemberPrice, setNonMemberPrice] =
    useState(
      initialEvent?.nonMemberPrice !== undefined
        ? String(initialEvent.nonMemberPrice)
        : '',
    )

  const [swishNumber, setSwishNumber] =
    useState(
      initialEvent?.swishNumber ??
        synagogueSettings.swish.number,
    )

  const [swishMessage, setSwishMessage] =
    useState(initialEvent?.swishMessage ?? '')

  const [
    registrationDeadline,
    setRegistrationDeadline,
  ] = useState(
    initialEvent?.registrationDeadline ?? '',
  )

  const [
    maxParticipants,
    setMaxParticipants,
  ] = useState(
    initialEvent?.maxParticipants !== undefined
      ? String(initialEvent.maxParticipants)
      : '',
  )

  const [visibility, setVisibility] =
    useState<EventVisibility>('allRegistered')

  const [showOnHome, setShowOnHome] = useState(
    initialEvent?.showOnHome ?? true,
  )
  const [showInCalendar, setShowInCalendar] = useState(
    initialEvent?.showInCalendar ?? true,
  )
  const [allowRegistration, setAllowRegistration] =
    useState(
      initialEvent?.allowRegistration ?? true,
    )
  const [showAttendeeCount, setShowAttendeeCount] =
    useState(true)
  const [showAttendeeNames, setShowAttendeeNames] =
    useState(true)
  const [sendPushNotification, setSendPushNotification] =
    useState(false)

  const [publishAsNews, setPublishAsNews] =
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

    if (nextType === 'shiur') {
      setTitle('Shiur')
      setAllowRegistration(true)
      setShowOnHome(true)
    }

    if (nextType === 'activity') {
      setTitle('')
      setAllowRegistration(true)
      setShowOnHome(true)

      setSwishNumber(
        synagogueSettings.swish.number,
      )

      setSwishMessage('')
    }

    if (nextType === 'holiday') {
      setTitle('')
      setAllowRegistration(false)
      setShowOnHome(true)
    }

    if (nextType === 'meeting') {
      setTitle('')
      setAllowRegistration(true)
      setShowOnHome(true)
    }

    if (nextType === 'other') {
      setTitle('')
      setAllowRegistration(false)
      setShowOnHome(true)
    }
  }

  async function handleImageFile(
    file: File | null,
  ) {
    if (!file) {
      return
    }

    setImageUploading(true)
    setImageError('')

    try {
      const eventId =
        initialEvent?.id ??
        crypto.randomUUID()

      const uploadedUrl =
        await uploadEventImage(
          file,
          eventId,
        )

      setImageUrl(
        uploadedUrl,
      )
    } catch (caughtError) {
      console.error(
        'Kunde inte ladda upp bild:',
        caughtError,
      )

      setImageError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Bilden kunde inte laddas upp.',
      )
    } finally {
      setImageUploading(false)
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
      id:
        initialEvent?.id ??
        crypto.randomUUID(),
      type: eventType,
      title: title.trim(),
      description: description.trim() || undefined,
      startDate,
      startTime,
      endTime: endTime || undefined,
      location: location.trim() || undefined,

      imageUrl:
        eventType === 'activity' &&
        imageUrl.trim()
          ? imageUrl.trim()
          : undefined,

      memberPrice:
        supportsEventPricing(eventType) &&
        memberPrice.trim()
          ? Number(memberPrice)
          : undefined,

      nonMemberPrice:
        supportsEventPricing(eventType) &&
        nonMemberPrice.trim()
          ? Number(nonMemberPrice)
          : undefined,

      swishNumber:
        supportsEventPricing(eventType) &&
        swishNumber.trim()
          ? swishNumber.trim()
          : undefined,

      swishMessage:
        supportsEventPricing(eventType) &&
        swishMessage.trim()
          ? swishMessage.trim()
          : undefined,

      registrationDeadline:
        supportsRichEvent(eventType) &&
        registrationDeadline
          ? registrationDeadline
          : undefined,

      maxParticipants:
        supportsRichEvent(eventType) &&
        maxParticipants.trim()
          ? Number(maxParticipants)
          : undefined,

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
      createdAt:
        typeof initialEvent?.createdAt === 'string'
          ? initialEvent.createdAt
          : new Date().toISOString(),
      createdBy:
        initialEvent?.createdBy ??
        currentUserId,

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
      const isTefila =
        eventType === 'tefila' ||
        eventType === 'jahrzeit'

      if (isTefila) {
        const tefilaRecord: TefilaRecord = {
          id: newEvent.id,
          title: newEvent.title,
          date: newEvent.startDate,
          time: newEvent.startTime,
          status: 'scheduled',
          allowRegistration:
            newEvent.allowRegistration,
        }

        await saveTefila(tefilaRecord)
      } else {
        await saveEvent(newEvent)

        if (
          eventType === 'activity' &&
          publishAsNews &&
          !initialEvent
        ) {
          const date = new Date(
            `${newEvent.startDate}T12:00:00`,
          )

          const formattedDate =
            new Intl.DateTimeFormat(
              'sv-SE',
              {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              },
            ).format(date)

          const timingParts = [
            formattedDate,
            newEvent.startTime
              ? `kl. ${newEvent.startTime}`
              : '',
            newEvent.location ?? '',
          ].filter(Boolean)

          const timing =
            timingParts.join(' • ')

          const newsContent = [
            timing,
            newEvent.description ?? '',
          ]
            .filter(Boolean)
            .join('\n\n')

          await createNewsPost({
            title: newEvent.title,
            excerpt:
              newEvent.description?.trim() ||
              timing,
            content: newsContent,
            imageUrl:
              newEvent.imageUrl || undefined,
            isPinned: false,
            status: 'published',
            authorId: currentUserId,
          })
}
      }

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
            {initialEvent
              ? 'Redigera händelse'
              : 'Ny händelse'}
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

          {supportsRichEvent(eventType) && (
            <>
              {eventType === 'activity' && (
                <Field label="Bild">
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm font-bold text-[#183b70] transition hover:bg-slate-100">
                  <ImagePlus className="h-5 w-5" />

                  {imageUploading
                    ? 'Laddar upp…'
                    : imageUrl
                      ? 'Byt bild'
                      : 'Välj bild'}

                  <input
                    type="file"
                    accept="image/*"
                    disabled={imageUploading}
                    onChange={(event) => {
                      const file =
                        event.target.files?.[0] ??
                        null

                      void handleImageFile(
                        file,
                      )

                      event.target.value = ''
                    }}
                    className="hidden"
                  />
                </label>

                {imageError && (
                  <p className="mt-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
                    {imageError}
                  </p>
                )}

                {imageUrl && (
                  <div className="mt-3 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
                    <img
                      src={imageUrl}
                      alt="Förhandsvisning"
                      className="h-44 w-full object-cover"
                    />

                    <div className="p-3">
                      <button
                        type="button"
                        onClick={() =>
                          setImageUrl('')
                        }
                        className="text-sm font-bold text-rose-700"
                      >
                        Ta bort bild
                      </button>
                    </div>
                  </div>
                )}
                </Field>
              )}

              {supportsEventPricing(eventType) && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                <Field label="Pris medlem">
                  <input
                    value={memberPrice}
                    onChange={(event) =>
                      setMemberPrice(
                        event.target.value,
                      )
                    }
                    type="number"
                    min="0"
                    step="1"
                    placeholder="250"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-600"
                  />
                </Field>

                <Field label="Pris icke medlem">
                  <input
                    value={nonMemberPrice}
                    onChange={(event) =>
                      setNonMemberPrice(
                        event.target.value,
                      )
                    }
                    type="number"
                    min="0"
                    step="1"
                    placeholder="350"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-600"
                  />
                </Field>
              </div>

              <Field label="Swish-nummer">
                <input
                  value={swishNumber}
                  onChange={(event) =>
                    setSwishNumber(
                      event.target.value,
                    )
                  }
                  type="text"
                  placeholder="123 456 78 90"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-600"
                />
              </Field>

              <Field label="Swish-meddelande">
                <input
                  value={swishMessage}
                  onChange={(event) =>
                    setSwishMessage(
                      event.target.value,
                    )
                  }
                  type="text"
                  placeholder="Exempel: Chanukafest"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-600"
                />
              </Field>

                </>
              )}

              <Field label="Sista anmälningsdag">
                <input
                  value={
                    registrationDeadline
                  }
                  onChange={(event) =>
                    setRegistrationDeadline(
                      event.target.value,
                    )
                  }
                  type="date"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-600"
                />
              </Field>

              <Field label="Max antal deltagare">
                <input
                  value={maxParticipants}
                  onChange={(event) =>
                    setMaxParticipants(
                      event.target.value,
                    )
                  }
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Lämna tomt för obegränsat"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-600"
                />
              </Field>
            </>
          )}

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

          {eventType === 'activity' &&
            !initialEvent && (
              <Toggle
                label="Publicera även som nyhet"
                description="Skapar automatiskt en publicerad nyhet med aktivitetens titel, datum och information."
                checked={publishAsNews}
                onChange={setPublishAsNews}
              />
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
            {eventType === 'tefila' ||
              eventType === 'jahrzeit'
                ? 'Tfilan har sparats i Firebase.'
                : 'Händelsen har sparats i Firebase.'}
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