import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  Minus,
  PartyPopper,
  Plus,
  Star,
  Trash2,
  Users,
} from 'lucide-react'
import {
  useEffect,
  useState,
} from 'react'
import { useAuth } from '../hooks/useAuth'
import type { StoredAppEvent } from '../services/eventService'
import {
  countEventParticipants,
  deleteEventRegistration,
  saveEventRegistration,
  subscribeToEventRegistrations,
  subscribeToUserEventRegistration,
  type StoredEventRegistration,
} from '../services/eventRegistrationService'

type RichEventCardProps = {
  event: StoredAppEvent
}

function RichEventCard({
  event,
}: RichEventCardProps) {
  const {
    firebaseUser,
    profile,
  } = useAuth()

  const [open, setOpen] =
    useState(false)

  const [
    registrationOpen,
    setRegistrationOpen,
  ] = useState(false)

  const [
    registrations,
    setRegistrations,
  ] = useState<
    StoredEventRegistration[]
  >([])

  const [
    myRegistration,
    setMyRegistration,
  ] = useState<
    StoredEventRegistration | null
  >(null)

  const [partySize, setPartySize] =
    useState(1)

  const [memberCount, setMemberCount] =
    useState(1)

  const [
    participantNames,
    setParticipantNames,
  ] = useState<string[]>([])

  const [saving, setSaving] =
    useState(false)

  const [
    registrationError,
    setRegistrationError,
  ] = useState('')

  useEffect(() => {
    if (!event.allowRegistration) {
      return
    }

    return subscribeToEventRegistrations(
      event.id,
      setRegistrations,
      (error) => {
        console.error(
          'Kunde inte läsa eventanmälningar:',
          error,
        )
      },
    )
  }, [
    event.id,
    event.allowRegistration,
  ])

  useEffect(() => {
    if (
      !firebaseUser ||
      !event.allowRegistration
    ) {
      setMyRegistration(null)
      return
    }

    return subscribeToUserEventRegistration(
      event.id,
      firebaseUser.uid,
      (registration) => {
        setMyRegistration(
          registration,
        )

        if (registration) {
          setPartySize(
            Math.max(
              1,
              registration.partySize,
            ),
          )

          setMemberCount(
            Math.max(
              0,
              Math.min(
                registration.partySize,
                registration.memberCount ??
                  registration.partySize,
              ),
            ),
          )

          setParticipantNames(
            registration.participantNames ??
              [],
          )
        }
      },
      (error) => {
        console.error(
          'Kunde inte läsa min eventanmälan:',
          error,
        )
      },
    )
  }, [
    event.id,
    event.allowRegistration,
    firebaseUser,
  ])

  const presentation =
    getEventPresentation(event)

  const date =
    new Date(
      `${event.startDate}T12:00:00`,
    )

  const displayDate =
    new Intl.DateTimeFormat(
      'sv-SE',
      {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      },
    ).format(date)

  const totalParticipants =
    countEventParticipants(
      registrations,
    )

  const ownCurrentPartySize =
    myRegistration?.partySize ?? 0

  const otherParticipants =
    Math.max(
      0,
      totalParticipants -
        ownCurrentPartySize,
    )

  const spotsRemaining =
    event.maxParticipants !== undefined
      ? Math.max(
          0,
          event.maxParticipants -
            totalParticipants,
        )
      : undefined

  const registrationClosed =
    event.registrationDeadline
      ? formatDateValue(new Date()) >
        event.registrationDeadline
      : false

  const isFull =
    event.maxParticipants !== undefined &&
    totalParticipants >=
      event.maxParticipants &&
    !myRegistration

  const nonMemberCount =
    Math.max(
      0,
      partySize -
        memberCount,
    )

  const memberSubtotal =
    (event.memberPrice ?? 0) *
    memberCount

  const nonMemberSubtotal =
    (event.nonMemberPrice ?? 0) *
    nonMemberCount

  const totalPrice =
    event.memberPrice !== undefined ||
    event.nonMemberPrice !== undefined
      ? memberSubtotal +
        nonMemberSubtotal
      : undefined

  const hasPrices =
    event.memberPrice !== undefined ||
    event.nonMemberPrice !== undefined

  function openRegistration() {
    setRegistrationError('')

    if (myRegistration) {
      setPartySize(
        Math.max(
          1,
          myRegistration.partySize,
        ),
      )

      setMemberCount(
        Math.max(
          0,
          Math.min(
            myRegistration.partySize,
            myRegistration.memberCount ??
              myRegistration.partySize,
          ),
        ),
      )

      setParticipantNames(
        myRegistration.participantNames ??
          [],
      )
    } else {
      setPartySize(1)

      setMemberCount(
        profile?.role === 'guest'
          ? 0
          : 1,
      )

      setParticipantNames(
        profile?.name
          ? [profile.name]
          : [''],
      )
    }

    setRegistrationOpen(true)
    setOpen(true)
  }

  function changePartySize(
    nextSize: number,
  ) {
    const safeSize =
      Math.max(
        1,
        Math.min(
          20,
          nextSize,
        ),
      )

    setPartySize(safeSize)

    setMemberCount(
      (current) =>
        Math.min(
          current,
          safeSize,
        ),
    )

    setParticipantNames(
      (current) => {
        const next =
          [...current]

        while (
          next.length <
          safeSize
        ) {
          next.push('')
        }

        return next.slice(
          0,
          safeSize,
        )
      },
    )
  }

  function updateParticipantName(
    index: number,
    value: string,
  ) {
    setParticipantNames(
      (current) => {
        const next =
          [...current]

        while (
          next.length <
          partySize
        ) {
          next.push('')
        }

        next[index] = value
        return next
      },
    )
  }

  async function saveRegistration() {
    if (!firebaseUser) {
      setRegistrationError(
        'Du måste vara inloggad för att anmäla dig.',
      )
      return
    }

    if (registrationClosed) {
      setRegistrationError(
        'Sista anmälningsdag har passerat.',
      )
      return
    }

    if (
      event.maxParticipants !== undefined &&
      otherParticipants +
        partySize >
        event.maxParticipants
    ) {
      setRegistrationError(
        `Det finns inte plats för ${partySize} personer.`,
      )
      return
    }

    setSaving(true)
    setRegistrationError('')

    try {
      await saveEventRegistration({
        eventId: event.id,
        userId:
          firebaseUser.uid,
        userName:
          profile?.name ||
          undefined,
        partySize,
        memberCount,
        nonMemberCount,
        participantNames:
          participantNames
            .slice(
              0,
              partySize,
            )
            .map(
              (name) =>
                name.trim(),
            )
            .filter(Boolean),
      })

      setRegistrationOpen(false)
    } catch (error) {
      console.error(
        'Kunde inte spara eventanmälan:',
        error,
      )

      setRegistrationError(
        'Anmälan kunde inte sparas.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function cancelRegistration() {
    if (
      !firebaseUser ||
      !myRegistration
    ) {
      return
    }

    const confirmed =
      window.confirm(
        `Vill du avboka din anmälan till "${event.title}"?`,
      )

    if (!confirmed) {
      return
    }

    setSaving(true)
    setRegistrationError('')

    try {
      await deleteEventRegistration(
        event.id,
        firebaseUser.uid,
      )

      setRegistrationOpen(false)
      setPartySize(1)
      setMemberCount(1)
      setParticipantNames([])
    } catch (error) {
      console.error(
        'Kunde inte avboka eventet:',
        error,
      )

      setRegistrationError(
        'Anmälan kunde inte tas bort.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <article
      className={`overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ${presentation.ring}`}
    >
      {event.type === 'activity' &&
        event.imageUrl && (
          <img
            src={event.imageUrl}
            alt=""
            className="h-44 w-full object-cover"
          />
        )}

      <div
        className={`${presentation.header} px-5 py-3 text-white`}
      >
        <div className="flex items-center gap-2">
          {presentation.icon}

          <p className="text-sm font-bold uppercase tracking-wide">
            {presentation.label}
          </p>
        </div>
      </div>

      <div className="p-5">
        <p
          className={`text-sm font-semibold capitalize ${presentation.accent}`}
        >
          {displayDate}
        </p>

        <h2 className="mt-1 text-2xl font-bold text-[#183b70]">
          {event.title}
        </h2>

        <div className="mt-4 space-y-2 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" />

            <span>
              {normalizeTime(
                event.startTime,
              )}

              {event.endTime
                ? `–${normalizeTime(
                    event.endTime,
                  )}`
                : ''}
            </span>
          </div>

          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-400" />

              <span>
                {event.location}
              </span>
            </div>
          )}

          {event.allowRegistration && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-400" />

              <span>
                {event.showAttendeeCount
                  ? `${totalParticipants} anmälda`
                  : 'Anmälan krävs'}

                {event.maxParticipants !== undefined &&
                  event.showAttendeeCount &&
                  ` / ${event.maxParticipants}`}
              </span>
            </div>
          )}
        </div>

        {myRegistration && (
          <div className="mt-4 rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
            <div className="flex items-center gap-2 text-emerald-800">
              <CheckCircle2 className="h-5 w-5" />

              <p className="font-bold">
                Du är anmäld
              </p>
            </div>

            <p className="mt-1 text-sm text-emerald-800">
              {myRegistration.partySize}{' '}
              {myRegistration.partySize === 1
                ? 'person'
                : 'personer'}
            </p>
          </div>
        )}

        {event.description && (
          <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-600">
            {open
              ? event.description
              : event.description.length >
                    140
                ? `${event.description.slice(
                    0,
                    140,
                  )}…`
                : event.description}
          </p>
        )}

        {open && hasPrices && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {event.memberPrice !== undefined && (
              <PriceBox
                label="Medlem"
                price={event.memberPrice}
              />
            )}

            {event.nonMemberPrice !== undefined && (
              <PriceBox
                label="Icke medlem"
                price={event.nonMemberPrice}
                secondary
              />
            )}
          </div>
        )}

        {event.allowRegistration &&
          !registrationOpen && (
            <div className="mt-5 space-y-2">
              {registrationClosed ? (
                <StatusBox text="Anmälan är stängd" />
              ) : isFull ? (
                <StatusBox
                  text="Fullbokat"
                  error
                />
              ) : (
                <button
                  type="button"
                  onClick={
                    openRegistration
                  }
                  className="w-full rounded-2xl bg-[#183b70] px-4 py-3.5 text-sm font-bold text-white"
                >
                  {myRegistration
                    ? 'Ändra anmälan'
                    : 'Anmäl sällskap'}
                </button>
              )}

              {myRegistration && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    void cancelRegistration()
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  Avboka
                </button>
              )}
            </div>
          )}

        {registrationOpen && (
          <div className="mt-5 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <h3 className="font-bold text-[#183b70]">
              {myRegistration
                ? 'Ändra anmälan'
                : 'Anmälan'}
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Du kan anmäla flera personer i samma sällskap.
            </p>

            <div className="mt-4">
              <p className="text-sm font-bold text-slate-700">
                Antal personer
              </p>

              <div className="mt-2 flex items-center gap-4">
                <CounterButton
                  disabled={
                    partySize <= 1
                  }
                  onClick={() =>
                    changePartySize(
                      partySize - 1,
                    )
                  }
                >
                  <Minus className="h-5 w-5" />
                </CounterButton>

                <span className="min-w-8 text-center text-xl font-black text-[#183b70]">
                  {partySize}
                </span>

                <CounterButton
                  disabled={
                    event.maxParticipants !== undefined &&
                    otherParticipants +
                      partySize >=
                      event.maxParticipants
                  }
                  onClick={() =>
                    changePartySize(
                      partySize + 1,
                    )
                  }
                >
                  <Plus className="h-5 w-5" />
                </CounterButton>
              </div>
            </div>

            {hasPrices && (
              <div className="mt-5 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <p className="text-sm font-bold text-slate-700">
                  Fördelning
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Ange hur många i sällskapet som är medlemmar.
                </p>

                <div className="mt-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-[#183b70]">
                      Medlemmar
                    </p>

                    <p className="text-xs text-slate-500">
                      {event.memberPrice !== undefined
                        ? `${event.memberPrice} kr/person`
                        : '–'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <CounterButton
                      small
                      disabled={
                        memberCount <= 0
                      }
                      onClick={() =>
                        setMemberCount(
                          (current) =>
                            Math.max(
                              0,
                              current - 1,
                            ),
                        )
                      }
                    >
                      <Minus className="h-4 w-4" />
                    </CounterButton>

                    <span className="min-w-5 text-center font-black text-[#183b70]">
                      {memberCount}
                    </span>

                    <CounterButton
                      small
                      disabled={
                        memberCount >=
                        partySize
                      }
                      onClick={() =>
                        setMemberCount(
                          (current) =>
                            Math.min(
                              partySize,
                              current + 1,
                            ),
                        )
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </CounterButton>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                  <div>
                    <p className="text-sm font-bold text-slate-700">
                      Icke-medlemmar
                    </p>

                    <p className="text-xs text-slate-500">
                      {event.nonMemberPrice !== undefined
                        ? `${event.nonMemberPrice} kr/person`
                        : '–'}
                    </p>
                  </div>

                  <p className="text-lg font-black text-slate-800">
                    {nonMemberCount}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-5 space-y-3">
              <p className="text-sm font-bold text-slate-700">
                Namn
              </p>

              {Array.from({
                length: partySize,
              }).map(
                (_, index) => (
                  <input
                    key={index}
                    value={
                      participantNames[
                        index
                      ] ?? ''
                    }
                    onChange={(
                      inputEvent,
                    ) =>
                      updateParticipantName(
                        index,
                        inputEvent.target
                          .value,
                      )
                    }
                    placeholder={
                      index === 0
                        ? 'Ditt namn'
                        : `Person ${index + 1}`
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-sky-600"
                  />
                ),
              )}
            </div>

            {totalPrice !== undefined && (
              <div className="mt-5 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Totalt
                </p>

                <p className="mt-1 text-2xl font-black text-[#183b70]">
                  {totalPrice === 0
                    ? 'Gratis'
                    : `${totalPrice} kr`}
                </p>

                <div className="mt-2 space-y-1 text-xs text-slate-500">
                  {memberCount > 0 &&
                    event.memberPrice !== undefined && (
                      <p>
                        {memberCount} ×{' '}
                        {event.memberPrice} kr medlem
                      </p>
                    )}

                  {nonMemberCount > 0 &&
                    event.nonMemberPrice !== undefined && (
                      <p>
                        {nonMemberCount} ×{' '}
                        {event.nonMemberPrice} kr icke-medlem
                      </p>
                    )}
                </div>
              </div>
            )}

            {registrationError && (
              <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
                {registrationError}
              </p>
            )}

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  void saveRegistration()
                }}
                className="rounded-2xl bg-[#183b70] px-3 py-3 text-sm font-bold text-white disabled:opacity-60"
              >
                {saving
                  ? 'Sparar…'
                  : myRegistration
                    ? 'Spara ändring'
                    : 'Anmäl'}
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  setRegistrationOpen(
                    false,
                  )
                }
                className="rounded-2xl bg-white px-3 py-3 text-sm font-bold text-slate-600 ring-1 ring-slate-200"
              >
                Avbryt
              </button>
            </div>
          </div>
        )}

        {myRegistration &&
          totalPrice !== undefined &&
          totalPrice > 0 &&
          event.swishNumber && (
            <div className="mt-5 rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                Betalning
              </p>

              <p className="mt-2 text-sm text-slate-700">
                Swisha{' '}
                <strong>
                  {totalPrice} kr
                </strong>{' '}
                till
              </p>

              <p className="mt-1 text-lg font-black text-[#183b70]">
                {event.swishNumber}
              </p>

              <p className="mt-2 text-sm text-slate-600">
                Meddelande:{' '}
                <strong>
                  {event.swishMessage ||
                    event.title}
                </strong>
              </p>
            </div>
          )}

        {event.registrationDeadline && open && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <CalendarDays className="h-4 w-4 shrink-0" />

            Sista anmälningsdag:{' '}
            {formatReadableDate(
              event.registrationDeadline,
            )}
          </div>
        )}

        {open &&
          spotsRemaining !== undefined &&
          event.allowRegistration &&
          !isFull && (
            <p className="mt-3 text-xs font-semibold text-slate-500">
              {spotsRemaining}{' '}
              {spotsRemaining === 1
                ? 'plats kvar'
                : 'platser kvar'}
            </p>
          )}

        {event.description ||
        hasPrices ||
        event.registrationDeadline ||
        event.allowRegistration ? (
          <button
            type="button"
            onClick={() =>
              setOpen(
                (current) =>
                  !current,
              )
            }
            className="mt-5 w-full rounded-2xl bg-sky-50 px-4 py-3 text-sm font-bold text-[#183b70]"
          >
            {open
              ? 'Visa mindre'
              : 'Visa information'}
          </button>
        ) : null}
      </div>
    </article>
  )
}

function getEventPresentation(
  event: StoredAppEvent,
) {
  switch (event.type) {
    case 'shiur':
      return {
        label: 'Shiur',
        header: 'bg-blue-700',
        ring: 'ring-blue-200',
        accent: 'text-blue-700',
        icon: (
          <BookOpen className="h-5 w-5" />
        ),
      }

    case 'meeting':
      return {
        label: 'Möte',
        header: 'bg-slate-700',
        ring: 'ring-slate-300',
        accent: 'text-slate-600',
        icon: (
          <Users className="h-5 w-5" />
        ),
      }

    case 'holiday':
      return {
        label: 'Högtid',
        header: 'bg-amber-700',
        ring: 'ring-amber-300',
        accent: 'text-amber-800',
        icon: (
          <Star className="h-5 w-5" />
        ),
      }

    case 'activity':
      return {
        label: 'Fest',
        header: 'bg-violet-700',
        ring: 'ring-violet-200',
        accent: 'text-violet-700',
        icon: (
          <PartyPopper className="h-5 w-5" />
        ),
      }

    default:
      return {
        label: 'Övrigt',
        header: 'bg-[#183b70]',
        ring: 'ring-slate-200',
        accent: 'text-slate-600',
        icon: (
          <CalendarDays className="h-5 w-5" />
        ),
      }
  }
}

function PriceBox({
  label,
  price,
  secondary = false,
}: {
  label: string
  price: number
  secondary?: boolean
}) {
  return (
    <div
      className={`rounded-2xl p-3 ${
        secondary
          ? 'bg-slate-50'
          : 'bg-sky-50'
      }`}
    >
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-lg font-bold text-[#183b70]">
        {price === 0
          ? 'Gratis'
          : `${price} kr`}
      </p>
    </div>
  )
}

function StatusBox({
  text,
  error = false,
}: {
  text: string
  error?: boolean
}) {
  return (
    <div
      className={`rounded-2xl px-4 py-3 text-center text-sm font-bold ${
        error
          ? 'bg-rose-50 text-rose-700'
          : 'bg-slate-100 text-slate-500'
      }`}
    >
      {text}
    </div>
  )
}

function CounterButton({
  children,
  onClick,
  disabled = false,
  small = false,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  small?: boolean
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex items-center justify-center rounded-xl bg-white text-[#183b70] shadow-sm ring-1 ring-slate-200 disabled:opacity-30 ${
        small
          ? 'h-9 w-9'
          : 'h-11 w-11'
      }`}
    >
      {children}
    </button>
  )
}

function normalizeTime(
  value: string,
) {
  return value.replace('.', ':')
}

function formatDateValue(
  date: Date,
) {
  return [
    date.getFullYear(),
    String(
      date.getMonth() + 1,
    ).padStart(2, '0'),
    String(
      date.getDate(),
    ).padStart(2, '0'),
  ].join('-')
}

function formatReadableDate(
  value: string,
) {
  return new Intl.DateTimeFormat(
    'sv-SE',
    {
      day: 'numeric',
      month: 'long',
    },
  ).format(
    new Date(
      `${value}T12:00:00`,
    ),
  )
}

export default RichEventCard
