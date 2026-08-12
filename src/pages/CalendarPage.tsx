import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  CalendarDays,
  Clock,
  Flame,
  Plus,
  Star,} from 'lucide-react'
import {
  subscribeToEventsBetween,
  type StoredAppEvent,
} from '../services/eventService'
import {
  subscribeToTfilotBetween,
  type TefilaRecord,
} from '../services/tefilaService'
import { getHebcalDayInfo } from '../services/hebcalService'
import { generateStandardTfilot } from '../utils/generateStandardTfilot'
import { useAuth } from '../hooks/useAuth'
import {
  getJahrzeitDatesBetween,
  subscribeToUserJahrzeits,
  type JahrzeitRecord,
} from '../services/jahrzeitService'
import JahrzeitForm from '../components/jahrzeit/JahrzeitForm'
import JahrzeitList from '../components/jahrzeit/JahrzeitList'
import DeleteJahrzeitDialog from '../components/jahrzeit/DeleteJahrzeitDialog'
import TefilaPreferencesCard from '../components/TefilaPreferencesCard'
import RichEventCard from '../components/RichEventCard'
import type { Tefila } from '../types'

type CalendarFilter =
  | 'all'
  | 'tfilot'
  | 'events'
  | 'jahrzeit'

type CalendarItem = {
  id: string
  date: string
  time?: string
  title: string
  subtitle?: string
  event?: StoredAppEvent
  category:
    | 'tefila'
    | 'event'
    | 'jewish'
    | 'jahrzeit'
}

const standardTfilot =
  generateStandardTfilot(new Date(), 90)

function CalendarPage() {
  const {
    firebaseUser,
    profile,
  } = useAuth()

  const canRegisterJahrzeit =
    profile?.status === 'approved' &&
    (
      profile.role === 'member' ||
      profile.role === 'admin'
    )

  const canUseTefilaPreferences =
    canRegisterJahrzeit &&
    (
      profile?.role === 'admin' ||
      profile?.countsForMinyan === true
    )

  const [jahrzeits, setJahrzeits] =
    useState<JahrzeitRecord[]>([])

  const [jahrzeitOpen, setJahrzeitOpen] =
    useState(false)

  const [
    editingJahrzeit,
    setEditingJahrzeit,
  ] = useState<JahrzeitRecord | null>(
    null,
  )

  const [
    deletingJahrzeit,
    setDeletingJahrzeit,
  ] = useState<JahrzeitRecord | null>(
    null,
  )

  const [filter, setFilter] =
    useState<CalendarFilter>('all')

  const [firebaseTfilot, setFirebaseTfilot] =
    useState<TefilaRecord[]>([])

  const [events, setEvents] =
    useState<StoredAppEvent[]>([])

  const [error, setError] =
    useState('')

  const range = useMemo(() => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)

    const end = new Date(start)
    end.setDate(end.getDate() + 90)

    return {
      start,
      end,
      startValue: formatDateValue(start),
      endValue: formatDateValue(end),
    }
  }, [])

  useEffect(() => {
    if (!firebaseUser) {
      setJahrzeits([])
      return
    }

    return subscribeToUserJahrzeits(
      firebaseUser.uid,
      setJahrzeits,
      (caughtError) => {
        console.error(
          caughtError,
        )

        setError(
          'Jahrzeit kunde inte hämtas.',
        )
      },
    )
  }, [firebaseUser])

  useEffect(() => {
    const unsubscribeTfilot =
      subscribeToTfilotBetween(
        range.startValue,
        range.endValue,
        setFirebaseTfilot,
        (caughtError) => {
          console.error(caughtError)
          setError(
            'Alla tfilot kunde inte hämtas.',
          )
        },
      )

    const unsubscribeEvents =
      subscribeToEventsBetween(
        range.startValue,
        range.endValue,
        setEvents,
        (caughtError) => {
          console.error(caughtError)
          setError(
            'Alla evenemang kunde inte hämtas.',
          )
        },
      )

    return () => {
      unsubscribeTfilot()
      unsubscribeEvents()
    }
  }, [
    range.startValue,
    range.endValue,
  ])

  const items = useMemo(
    () =>
      buildCalendarItems({
        start: range.start,
        end: range.end,
        standardTfilot,
        firebaseTfilot,
        events,
        jahrzeits,
      }),
    [
      range.start,
      range.end,
      firebaseTfilot,
      events,
      jahrzeits,
    ],
  )

  const filteredItems =
    items.filter((item) => {
      if (filter === 'all') {
        return true
      }

      if (filter === 'tfilot') {
        return (
          item.category === 'tefila' ||
          item.category === 'jewish'
        )
      }

      if (filter === 'events') {
        return item.category === 'event'
      }

      /*
       * Jahrzeit-fliken är en personlig
       * administrationsvy, inte en filtrerad
       * version av kalendern.
       */
      return false
    })

  const groupedItems =
    groupItemsByDate(filteredItems)

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm leading-6 text-slate-500">
          Tfilot, Shabbat, högtider och
          aktiviteter samlade på ett ställe.
        </p>
      </div>

      <div
        className={`grid rounded-2xl bg-slate-200/70 p-1 ${
          canRegisterJahrzeit
            ? 'grid-cols-4'
            : 'grid-cols-3'
        }`}
      >
        <FilterButton
          label="Alla"
          active={filter === 'all'}
          onClick={() => setFilter('all')}
        />

        <FilterButton
          label="Tfilot"
          active={filter === 'tfilot'}
          onClick={() => setFilter('tfilot')}
        />

        <FilterButton
          label="Evenemang"
          active={filter === 'events'}
          onClick={() => setFilter('events')}
        />

        {canRegisterJahrzeit && (
          <FilterButton
            label="Jahrzeit"
            active={filter === 'jahrzeit'}
            onClick={() => {
              setFilter('jahrzeit')
              setJahrzeitOpen(false)
              setEditingJahrzeit(null)
            }}
          />
        )}
      </div>

      {(filter === 'all' ||
        filter === 'tfilot') &&
        canUseTefilaPreferences &&
        firebaseUser && (
          <TefilaPreferencesCard
            userId={firebaseUser.uid}
            userName={
              profile?.name ?? ''
            }
          />
        )}

      {filter === 'jahrzeit' &&
        canRegisterJahrzeit && (
          <div className="space-y-4">
            <section className="rounded-3xl bg-amber-50 p-5 ring-1 ring-amber-200">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-800 shadow-sm">
                    <Flame className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="font-bold text-[#183b70]">
                      Mina Jahrzeits
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-500">
                      {jahrzeits.length}{' '}
                      {jahrzeits.length === 1
                        ? 'registrerad'
                        : 'registrerade'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingJahrzeit(null)
                    setJahrzeitOpen(true)
                  }}
                  className="flex shrink-0 items-center gap-1.5 rounded-2xl bg-[#68123f] px-3 py-2.5 text-xs font-bold text-white shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  Registrera
                </button>
              </div>
            </section>

            {jahrzeitOpen && (
              <JahrzeitForm
                userId={
                  firebaseUser?.uid ?? ''
                }
                userName={
                  profile?.name ?? ''
                }
                existingJahrzeit={
                  editingJahrzeit
                }
                onClose={() => {
                  setJahrzeitOpen(false)
                  setEditingJahrzeit(null)
                }}
              />
            )}

            {jahrzeits.length > 0 ? (
              <JahrzeitList
                jahrzeits={jahrzeits}
                onEdit={(jahrzeit) => {
                  setEditingJahrzeit(
                    jahrzeit,
                  )
                  setJahrzeitOpen(true)
                }}
                onDelete={(jahrzeit) =>
                  setDeletingJahrzeit(
                    jahrzeit,
                  )
                }
              />
            ) : (
              <section className="rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200">
                <Flame className="mx-auto h-7 w-7 text-amber-700" />

                <p className="mt-3 font-bold text-slate-700">
                  Ingen Jahrzeit registrerad
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Registrera en Jahrzeit så håller
                  appen reda på det hebreiska
                  datumet varje år.
                </p>
              </section>
            )}
          </div>
        )}

      {error && (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 ring-1 ring-amber-200">
          {error}
        </p>
      )}

      {filter !== 'jahrzeit' &&
        groupedItems.map(
        ([dateValue, dateItems]) => (
          <section
            key={dateValue}
            className="space-y-2"
          >
            <DateHeading
              dateValue={dateValue}
            />

            <div className="space-y-2">
              {dateItems.map((item) => (
                <CalendarRow
                  key={item.id}
                  item={item}
                />
              ))}
            </div>
          </section>
        ),
      )}

      {filter !== 'jahrzeit' &&
        groupedItems.length === 0 && (
        <div className="rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200">
          <CalendarDays className="mx-auto h-7 w-7 text-slate-400" />

          <p className="mt-3 font-bold text-slate-700">
            Inget att visa
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Det finns inga poster för det
            valda filtret.
          </p>
        </div>
      )}
      {deletingJahrzeit && (
        <DeleteJahrzeitDialog
          jahrzeit={
            deletingJahrzeit
          }
          onClose={() =>
            setDeletingJahrzeit(null)
          }
        />
      )}
    </div>
  )
}

function buildCalendarItems({
  start,
  end,
  standardTfilot,
  firebaseTfilot,
  events,
  jahrzeits,
}: {
  start: Date
  end: Date
  standardTfilot: Tefila[]
  firebaseTfilot: TefilaRecord[]
  events: StoredAppEvent[]
  jahrzeits: JahrzeitRecord[]
}): CalendarItem[] {
  const items: CalendarItem[] = []

  /*
   * Tfilot:
   * standardschemat är grunden.
   * Firebase-versionen tar över om samma id finns.
   */
  const mergedTfilot =
    new Map<string, CalendarItem>()

  for (const tefila of standardTfilot) {
    if (!tefila.dateValue) {
      continue
    }

    mergedTfilot.set(
      String(
        tefila.firestoreId ?? tefila.id,
      ),
      {
        id:
          `tefila-${
            tefila.firestoreId ??
            tefila.id
          }`,
        date: tefila.dateValue,
        time: normalizeTime(tefila.time),
        title: tefila.title,
        category: 'tefila',
      },
    )
  }

  for (const tefila of firebaseTfilot) {
    if (tefila.status === 'cancelled') {
      mergedTfilot.delete(tefila.id)
      continue
    }

    mergedTfilot.set(
      tefila.id,
      {
        id: `tefila-${tefila.id}`,
        date: tefila.date,
        time: normalizeTime(tefila.time),
        title: tefila.title,
        category: 'tefila',
      },
    )
  }

  /*
   * Kabbalat Shabbat återkommer varje fredag.
   *
   * Firebase-versionen får fortfarande ta över
   * om admin har skapat/ändrat just den tfilan.
   */
  const kabbalatCursor =
    new Date(start)

  while (kabbalatCursor <= end) {
    if (kabbalatCursor.getDay() === 5) {
      const dateValue =
        formatDateValue(
          kabbalatCursor,
        )

      const tefilaId =
        `${dateValue}-kabbalat-shabbat`

      /*
       * Lägg bara standardversionen om
       * Firebase inte redan har samma ID.
       */
      if (!mergedTfilot.has(tefilaId)) {
        mergedTfilot.set(
          tefilaId,
          {
            id:
              `tefila-${tefilaId}`,
            date: dateValue,
            time: '19:30',
            title:
              'Kabbalat Shabbat',
            category: 'tefila',
          },
        )
      }
    }

    kabbalatCursor.setDate(
      kabbalatCursor.getDate() + 1,
    )
  }

  items.push(...mergedTfilot.values())

  /*
   * Vanliga evenemang från Firebase.
   */
  for (const event of events) {
    if (
      event.status !== 'published' ||
      event.showInCalendar === false ||
      event.type === 'tefila' ||
      event.type === 'jahrzeit' ||
      event.type === 'kiddush'
    ) {
      continue
    }

    items.push({
      id: `event-${event.id}`,
      date: event.startDate,
      time: normalizeTime(
        event.startTime,
      ),
      title: event.title,
      subtitle:
        event.location ||
        event.description,
      event,
      category: 'event',
    })
  }

  /*
   * Användarens registrerade Jahrzeits.
   * Svenskt datum beräknas från det
   * hebreiska datumet varje år.
   */
  for (const jahrzeit of jahrzeits) {
    const occurrenceDates =
      getJahrzeitDatesBetween(
        jahrzeit,
        start,
        end,
      )

    for (
      const occurrenceDate
      of occurrenceDates
    ) {
      items.push({
        id:
          `jahrzeit-${jahrzeit.id}-${formatDateValue(occurrenceDate)}`,
        date:
          formatDateValue(
            occurrenceDate,
          ),
        title:
          `Jahrzeit – ${jahrzeit.deceasedName}`,
        subtitle:
          [
            `${jahrzeit.hebrewDay} ${jahrzeit.hebrewMonth}`,
            jahrzeit.relation,
          ]
            .filter(Boolean)
            .join(' · ') ||
          undefined,
        category: 'jahrzeit',
      })
    }
  }

  /*
   * Judisk kalender från HebCal.
   *
   * Lördagar visas alltid som Shabbat.
   * Högtider och Rosh Chodesh visas på
   * sina faktiska datum.
   */
  const cursor = new Date(start)

  while (cursor <= end) {
    const dateValue =
      formatDateValue(cursor)

    const hebcal =
      getHebcalDayInfo(dateValue)

    const isShabbat =
      cursor.getDay() === 6

    if (isShabbat) {
      /*
       * På vanlig Shabbat prioriterar vi
       * parashan som huvudrubrik.
       *
       * En riktig högtid som sammanfaller
       * med Shabbat får däremot vara titel.
       *
       * Notiser som Leil Selichot ska inte
       * ersätta parashan.
       */
      const specialShabbatNames = [
        'Shabbat Shuva',
        'Shabbat Shekalim',
        'Shabbat Zachor',
        'Shabbat Parah',
        'Shabbat HaChodesh',
        'Shabbat HaGadol',
        'Shabbat Chazon',
        'Shabbat Nachamu',
      ]

      const significantHoliday =
        hebcal.holidayNames.find(
          (name) =>
            !name
              .toLowerCase()
              .includes('selichot') &&
            !name
              .toLowerCase()
              .includes('slichot') &&
            !specialShabbatNames.includes(name),
        )

      const shabbatTitle =
        significantHoliday ||
        hebcal.parasha ||
        'Shabbat'

      const secondaryNotice =
        hebcal.holidayNames.find(
          (name) =>
            name !== shabbatTitle,
        )

      const subtitleParts = [
        hebcal.hebrewDate,
        hebcal.isShabbatMevarchim
          ? 'Shabbat Mevarchim'
          : null,
        hebcal.roshChodeshName,
        secondaryNotice,
      ].filter(Boolean)

      items.push({
        id: `hebcal-shabbat-${dateValue}`,
        date: dateValue,
        time: '09:00',
        title: shabbatTitle,
        subtitle:
          subtitleParts.join(' · ') ||
          undefined,
        category: 'jewish',
      })
    } else {
      if (
        hebcal.isRoshChodesh &&
        hebcal.roshChodeshName
      ) {
        items.push({
          id: `hebcal-rosh-chodesh-${dateValue}`,
          date: dateValue,
          title: hebcal.roshChodeshName,
          subtitle:
            hebcal.hebrewDate ||
            undefined,
          category: 'jewish',
        })
      }

      for (
        let index = 0;
        index <
        hebcal.holidayNames.length;
        index += 1
      ) {
        items.push({
          id:
            `hebcal-holiday-${dateValue}-${index}`,
          date: dateValue,
          title:
            hebcal.holidayNames[index],
          subtitle:
            hebcal.hebrewDate ||
            undefined,
          category: 'jewish',
        })
      }
    }

    cursor.setDate(
      cursor.getDate() + 1,
    )
  }

  return items
    .filter(
      (item) =>
        item.date >=
          formatDateValue(start) &&
        item.date <=
          formatDateValue(end),
    )
    .sort(compareCalendarItems)
}

function compareCalendarItems(
  first: CalendarItem,
  second: CalendarItem,
): number {
  const dateComparison =
    first.date.localeCompare(second.date)

  if (dateComparison !== 0) {
    return dateComparison
  }

  /*
   * Shabbat/högtid ligger först på dagen,
   * därefter poster med klockslag.
   */
  if (!first.time && second.time) {
    return -1
  }

  if (first.time && !second.time) {
    return 1
  }

  return (
    first.time ?? ''
  ).localeCompare(
    second.time ?? '',
  )
}

function groupItemsByDate(
  items: CalendarItem[],
): Array<[string, CalendarItem[]]> {
  const groups =
    new Map<string, CalendarItem[]>()

  for (const item of items) {
    const existing =
      groups.get(item.date) ?? []

    existing.push(item)
    groups.set(item.date, existing)
  }

  return Array.from(groups.entries())
}

function DateHeading({
  dateValue,
}: {
  dateValue: string
}) {
  const date = new Date(
    `${dateValue}T12:00:00`,
  )

  const weekday =
    new Intl.DateTimeFormat(
      'sv-SE',
      {
        weekday: 'long',
      },
    ).format(date)

  const dateText =
    new Intl.DateTimeFormat(
      'sv-SE',
      {
        day: 'numeric',
        month: 'long',
      },
    ).format(date)

  return (
    <div className="flex items-baseline gap-2 px-1 pt-2">
      <h2 className="font-bold capitalize text-[#183b70]">
        {weekday}
      </h2>

      <p className="text-sm text-slate-500">
        {dateText}
      </p>
    </div>
  )
}

function CalendarRow({
  item,
}: {
  item: CalendarItem
}) {
  const [eventOpen, setEventOpen] =
    useState(false)

  const styles =
    getCategoryStyles(item.category)

  const isRichEvent =
    item.category === 'event' &&
    item.event !== undefined

  return (
    <div className="space-y-3">
      <article
        className={`rounded-2xl bg-white p-4 shadow-sm ring-1 ${styles.ring}`}
      >
        <button
          type="button"
          disabled={!isRichEvent}
          onClick={() => {
            if (isRichEvent) {
              setEventOpen(
                (current) =>
                  !current,
              )
            }
          }}
          className="w-full text-left disabled:cursor-default"
        >
          <div className="flex items-start gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}
            >
              {item.category === 'jewish' ? (
                <Star className="h-5 w-5" />
              ) : item.category === 'jahrzeit' ? (
                <Flame className="h-5 w-5" />
              ) : item.category === 'tefila' ? (
                <Clock className="h-5 w-5" />
              ) : (
                <CalendarDays className="h-5 w-5" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-bold text-slate-900">
                  {item.title}
                </h3>

                {item.time && (
                  <span className="shrink-0 text-sm font-bold text-slate-600">
                    {item.time}
                  </span>
                )}
              </div>

              {item.subtitle && (
                <p className="mt-1 text-sm leading-5 text-slate-500">
                  {item.subtitle}
                </p>
              )}

              {item.category !== 'jewish' && (
                <p
                  className={`mt-2 text-[10px] font-bold uppercase tracking-wide ${styles.label}`}
                >
                  {item.category === 'tefila'
                    ? 'Tfila'
                    : item.category === 'jahrzeit'
                      ? 'Jahrzeit'
                      : isRichEvent
                        ? eventOpen
                          ? 'Stäng'
                          : 'Visa mer'
                        : 'Evenemang'}
                </p>
              )}
            </div>
          </div>
        </button>
      </article>

      {eventOpen &&
        item.event && (
          <RichEventCard
            event={item.event}
          />
        )}
    </div>
  )
}

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
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
      {label}
    </button>
  )
}

function getCategoryStyles(
  category: CalendarItem['category'],
) {
  if (category === 'jewish') {
    return {
      ring: 'ring-[#68123f]/20',
      icon:
        'bg-[#68123f]/10 text-[#68123f]',
      label: 'text-[#68123f]',
    }
  }

  if (category === 'jahrzeit') {
    return {
      ring: 'ring-amber-200',
      icon:
        'bg-amber-50 text-amber-800',
      label: 'text-amber-800',
    }
  }

  if (category === 'event') {
    return {
      ring: 'ring-sky-200',
      icon:
        'bg-sky-100 text-[#183b70]',
      label: 'text-sky-700',
    }
  }

  return {
    ring: 'ring-slate-200',
    icon:
      'bg-slate-100 text-[#183b70]',
    label: 'text-[#183b70]',
  }
}

function normalizeTime(
  value: string,
): string {
  return value.replace('.', ':')
}

function formatDateValue(
  date: Date,
): string {
  const year = date.getFullYear()

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0')

  const day = String(
    date.getDate(),
  ).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export default CalendarPage
