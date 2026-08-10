import {
  BookOpen,
  Clock,
  Heart,
  Mic2,
  Star,
  Utensils,
  Wine,
} from 'lucide-react'
import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import LiveMinyanCard from '../components/LiveMinyanCard'
import RichEventCard from '../components/RichEventCard'
import TefilaInvitationCards from '../components/TefilaInvitationCards'
import { synagogueSettings } from '../data/settings'
import { getHebcalDayInfo } from '../services/hebcalService'
import {
  GeoLocation,
  Zmanim,
} from '@hebcal/core'
import {
  subscribeToDaySettings,
  type DaySettings,
} from '../services/daySettingsService'
import {
  subscribeToKiddushDate,
  type KiddushBooking,
} from '../services/kiddushService'
import {
  subscribeToTfilotBetween,
  type TefilaRecord,
} from '../services/tefilaService'
import {
  subscribeToEventsBetween,
  type StoredAppEvent,
} from '../services/eventService'
import {
  todayProgram,
  type ProgramItem,
} from '../data/todayProgram'
import type { Tefila } from '../types'
import { generateStandardTfilot } from '../utils/generateStandardTfilot'
import { getDefaultSermon } from '../utils/getDefaultSermon'
import {
  getJahrzeitDatesBetween,
  subscribeToAllJahrzeits,
  type JahrzeitRecord,
} from '../services/jahrzeitService'
import {
  subscribeToPinnedMessage,
  type PinnedMessage,
} from '../services/pinnedMessageService'
type HomePageProps = Record<string, never>

const upcomingTfilot = generateStandardTfilot()

const nextFriday = findNextWeekday(new Date(), 5)
const nextSaturday = addDays(nextFriday, 1)

const secondFriday = addDays(nextFriday, 7)
const secondSaturday = addDays(nextSaturday, 7)

const fridayDateValue = formatDateValue(nextFriday)
const saturdayDateValue = formatDateValue(nextSaturday)

const secondFridayDateValue =
  formatDateValue(secondFriday)

const secondSaturdayDateValue =
  formatDateValue(secondSaturday)

const scheduleWithKabbalat =
  synagogueSettings.schedule as typeof synagogueSettings.schedule & {
    kabbalatShabbat?: string
  }

const kabbalatShabbat: Tefila = {
  id: `${fridayDateValue}-kabbalat-shabbat`,
  firestoreId: `${fridayDateValue}-kabbalat-shabbat`,
  dateValue: fridayDateValue,
  day: 'Fredag',
  date: formatSwedishDate(nextFriday),
  title: 'Kabbalat Shabbat',
  time: scheduleWithKabbalat.kabbalatShabbat ?? '19.30',
  attending: 0,
}

const secondKabbalatShabbat: Tefila = {
  id: `${secondFridayDateValue}-kabbalat-shabbat`,
  firestoreId:
    `${secondFridayDateValue}-kabbalat-shabbat`,
  dateValue: secondFridayDateValue,
  day: 'Fredag',
  date: formatSwedishDate(secondFriday),
  title: 'Kabbalat Shabbat',
  time:
    scheduleWithKabbalat.kabbalatShabbat ??
    '19.30',
  attending: 0,
}

function HomePage(
  {}: HomePageProps,
) {
  const [firebaseTfilot, setFirebaseTfilot] =
    useState<TefilaRecord[]>([])

  const [homeEvents, setHomeEvents] =
    useState<StoredAppEvent[]>([])

  const [jahrzeits, setJahrzeits] =
    useState<JahrzeitRecord[]>([])

  const [now, setNow] =
    useState(() => new Date())

const [pinnedMessage, setPinnedMessage] =
  useState<PinnedMessage | null>(null)

useEffect(() => {
  return subscribeToPinnedMessage(
    setPinnedMessage,
    (error) => {
      console.error(
        'Kunde inte läsa fäst meddelande:',
        error,
      )
    },
  )
}, [])

useEffect(() => {
    const intervalId = window.setInterval(
      () => {
        setNow(new Date())
      },
      60_000,
    )

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    const startDateValue =
      formatDateValue(new Date())

    const endDateValue =
      formatDateValue(
        addDays(new Date(), 14),
      )

    return subscribeToTfilotBetween(
      startDateValue,
      endDateValue,
      setFirebaseTfilot,
      (error) => {
        /*
         * Standardschemat fortsätter visas även om
         * Firestore tillfälligt inte kan läsas.
         */
        console.error(
          'Kunde inte läsa tfilot till startsidan:',
          error,
        )
      },
    )
  }, [])

  useEffect(() => {
    const startDateValue =
      formatDateValue(new Date())

    const endDateValue =
      formatDateValue(
        addDays(new Date(), 14),
      )

    return subscribeToEventsBetween(
      startDateValue,
      endDateValue,
      (events) => {
        setHomeEvents(
          events.filter(
            (event) =>
              event.status === 'published' &&
              event.showOnHome === true &&
              event.type !== 'tefila' &&
              event.type !== 'jahrzeit' &&
              event.type !== 'kiddush',
          ),
        )
      },
      (error) => {
        console.error(
          'Kunde inte läsa aktiviteter till startsidan:',
          error,
        )
      },
    )
  }, [])

  useEffect(() => {
    return subscribeToAllJahrzeits(
      setJahrzeits,
      (error) => {
        console.error(
          'Kunde inte läsa Jahrzeits till startsidan:',
          error,
        )
      },
    )
  }, [])

  const jahrzeitsByDate =
    useMemo(() => {
      const result =
        new Map<
          string,
          JahrzeitRecord[]
        >()

      const start =
        new Date(now)

      start.setHours(
        0,
        0,
        0,
        0,
      )

      const end =
        addDays(
          start,
          14,
        )

      for (
        const jahrzeit
        of jahrzeits
      ) {
        const dates =
          getJahrzeitDatesBetween(
            jahrzeit,
            start,
            end,
          )

        for (
          const occurrence
          of dates
        ) {
          const dateValue =
            formatDateValue(
              occurrence,
            )

          const existing =
            result.get(
              dateValue,
            ) ?? []

          existing.push(
            jahrzeit,
          )

          result.set(
            dateValue,
            existing,
          )
        }
      }

      return result
    }, [
      jahrzeits,
      now,
    ])

  const mergedTfilot = useMemo(
    () =>
      mergeStandardAndFirebaseTfilot(
        upcomingTfilot,
        firebaseTfilot,
      )
        .filter((tefila) =>
          isTefilaStillCurrent(
            tefila,
            now,
          ),
        )
        .map((tefila) => {
          if (!tefila.dateValue) {
            return tefila
          }

          const hebcalInfo =
            getHebcalDayInfo(
              tefila.dateValue,
            )

          if (
            !hebcalInfo.isRoshChodesh ||
            !hebcalInfo.roshChodeshName
          ) {
            return tefila
          }

          return {
            ...tefila,
            day:
              `${tefila.day} · ${hebcalInfo.roshChodeshName}`,
          }
        }),
    [firebaseTfilot, now],
  )

  const currentHomeEvents =
    useMemo(
      () =>
        homeEvents.filter(
          (event) =>
            isEventStillCurrent(
              event,
              now,
            ),
        ),
      [homeEvents, now],
    )

  const eventsBeforeShabbat =
    currentHomeEvents.filter(
      (event) =>
        event.startDate <
        saturdayDateValue,
    )

  const eventsBetweenShabbatot =
    currentHomeEvents.filter(
      (event) =>
        event.startDate >
          saturdayDateValue &&
        event.startDate <
          secondSaturdayDateValue,
    )

  const eventsAfterSecondShabbat =
    currentHomeEvents.filter(
      (event) =>
        event.startDate >
        secondSaturdayDateValue,
    )

  const displayedKabbalatShabbat =
    mergedTfilot.find(
      (tefila) =>
        tefila.firestoreId ===
        kabbalatShabbat.firestoreId,
    ) ?? kabbalatShabbat

  const showKabbalatShabbat =
    isTefilaStillCurrent(
      displayedKabbalatShabbat,
      now,
    )

  const displayedSecondKabbalatShabbat =
    mergedTfilot.find(
      (tefila) =>
        tefila.firestoreId ===
        secondKabbalatShabbat.firestoreId,
    ) ?? secondKabbalatShabbat

  const showSecondKabbalatShabbat =
    isTefilaStillCurrent(
      displayedSecondKabbalatShabbat,
      now,
    )

  const tfilotBeforeShabbat =
    mergedTfilot.filter(
      (tefila) =>
        (tefila.dateValue ?? '') <
          saturdayDateValue &&
        tefila.firestoreId !==
          kabbalatShabbat.firestoreId,
    )

  const tfilotBetweenShabbatot =
    mergedTfilot.filter(
      (tefila) =>
        (tefila.dateValue ?? '') >
          saturdayDateValue &&
        (tefila.dateValue ?? '') <
          secondSaturdayDateValue &&
        tefila.firestoreId !==
          secondKabbalatShabbat.firestoreId,
    )

  const tfilotAfterSecondShabbat =
    mergedTfilot.filter(
      (tefila) =>
        (tefila.dateValue ?? '') >
        secondSaturdayDateValue,
    )

  const itemsBeforeShabbat =
    buildHomeFlowItems(
      tfilotBeforeShabbat,
      eventsBeforeShabbat,
    )

  const itemsBetweenShabbatot =
    buildHomeFlowItems(
      tfilotBetweenShabbatot,
      eventsBetweenShabbatot,
    )

  const itemsAfterSecondShabbat =
    buildHomeFlowItems(
      tfilotAfterSecondShabbat,
      eventsAfterSecondShabbat,
    )

  return (
    <div className="space-y-7">
      {pinnedMessage &&
        pinnedMessage.active &&
        formatDateValue(now) >= pinnedMessage.startDate &&
        formatDateValue(now) <= pinnedMessage.endDate && (
          <section className="rounded-3xl bg-amber-50 p-5 shadow-sm ring-1 ring-amber-200">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-700 shadow-sm">
                <Star className="h-6 w-6" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wide text-amber-800">
                  {pinnedMessage.type === 'mazelTov'
                    ? 'Mazel tov!'
                    : pinnedMessage.type === 'important'
                      ? 'Viktig information'
                      : pinnedMessage.type === 'fundraiser'
                        ? 'Insamling'
                        : 'Meddelande'}
                </p>

                <p className="mt-2 whitespace-pre-line text-base font-semibold leading-7 text-slate-800">
                  {pinnedMessage.text}
                </p>
              </div>
            </div>
          </section>
        )}

      <section>
        <h1 className="text-2xl font-bold text-[#183b70]">
          På gång
        </h1>
      </section>

      <TefilaInvitationCards />

      <section className="space-y-3">
        {itemsBeforeShabbat.map((item) =>
          item.type === 'tefila' ? (
            <HomeTefilaCard
              key={`tefila-${item.tefila.id}`}
              tefila={item.tefila}
              jahrzeits={
                jahrzeitsByDate.get(
                  item.tefila.dateValue ??
                    '',
                ) ?? []
              }
            />
          ) : (
            <RichEventCard
              key={`event-${item.event.id}`}
              event={item.event}
            />
          ),
        )}

        {showKabbalatShabbat && (
          <ErevShabbatCard
            tefila={displayedKabbalatShabbat}
          />
        )}

        <ProgramCard
          dateValue={saturdayDateValue}
        />

        {itemsBetweenShabbatot.map((item) =>
          item.type === 'tefila' ? (
            <HomeTefilaCard
              key={`tefila-${item.tefila.id}`}
              tefila={item.tefila}
              jahrzeits={
                jahrzeitsByDate.get(
                  item.tefila.dateValue ??
                    '',
                ) ?? []
              }
            />
          ) : (
            <RichEventCard
              key={`event-${item.event.id}`}
              event={item.event}
            />
          ),
        )}

        {showSecondKabbalatShabbat && (
          <ErevShabbatCard
            tefila={
              displayedSecondKabbalatShabbat
            }
          />
        )}

        <ProgramCard
          dateValue={
            secondSaturdayDateValue
          }
        />

        {itemsAfterSecondShabbat.map((item) =>
          item.type === 'tefila' ? (
            <HomeTefilaCard
              key={`tefila-${item.tefila.id}`}
              tefila={item.tefila}
              jahrzeits={
                jahrzeitsByDate.get(
                  item.tefila.dateValue ??
                    '',
                ) ?? []
              }
            />
          ) : (
            <RichEventCard
              key={`event-${item.event.id}`}
              event={item.event}
            />
          ),
        )}
      </section>

      <SupportSection />

      <SponsorsSection />
    </div>
  )
}


type HomeFlowItem =
  | {
      type: 'tefila'
      tefila: Tefila
      dateValue: string
      time: string
    }
  | {
      type: 'event'
      event: StoredAppEvent
      dateValue: string
      time: string
    }

function buildHomeFlowItems(
  tfilot: Tefila[],
  events: StoredAppEvent[],
): HomeFlowItem[] {
  const items: HomeFlowItem[] = [
    ...tfilot.map(
      (tefila): HomeFlowItem => ({
        type: 'tefila',
        tefila,
        dateValue:
          tefila.dateValue ?? '',
        time:
          normalizeHomeTime(
            tefila.time,
          ),
      }),
    ),

    ...events.map(
      (event): HomeFlowItem => ({
        type: 'event',
        event,
        dateValue:
          event.startDate,
        time:
          normalizeHomeTime(
            event.startTime,
          ),
      }),
    ),
  ]

  return items.sort(
    (first, second) => {
      const dateComparison =
        first.dateValue.localeCompare(
          second.dateValue,
        )

      if (dateComparison !== 0) {
        return dateComparison
      }

      return first.time.localeCompare(
        second.time,
      )
    },
  )
}

function isEventStillCurrent(
  event: StoredAppEvent,
  now: Date,
): boolean {
  const normalizedTime =
    normalizeHomeTime(
      event.endTime ||
        event.startTime,
    )

  const end =
    new Date(
      `${event.startDate}T${normalizedTime}:00`,
    )

  /*
   * Om sluttid saknas låter vi aktiviteten
   * ligga kvar två timmar efter start.
   */
  if (!event.endTime) {
    end.setHours(
      end.getHours() + 2,
    )
  }

  return end.getTime() >
    now.getTime()
}

function normalizeHomeTime(
  value: string,
): string {
  return value.replace('.', ':')
}

type HomeTefilaCardProps = {
  tefila: Tefila
  jahrzeits: JahrzeitRecord[]
}

function HomeTefilaCard({
  tefila,
  jahrzeits,
}: HomeTefilaCardProps) {
  const isShacharit =
    tefila.title
      .toLowerCase()
      .includes(
        'shacharit',
      )

  const relevantJahrzeits =
    isShacharit
      ? jahrzeits
      : []

  const jahrzeitNames =
    Array.from(
      new Set(
        relevantJahrzeits.map(
          (jahrzeit) =>
            jahrzeit.hebrewName?.trim() ||
            jahrzeit.deceasedName.trim(),
        ),
      ),
    ).filter(Boolean)

  const jahrzeitInfo =
    jahrzeitNames.length > 0
      ? {
          label:
            jahrzeitNames.length === 1
              ? 'Jahrzeit'
              : 'Jahrzeits',
          value:
            jahrzeitNames.join(
              ' · ',
            ),
        }
      : undefined

  return (
    <LiveMinyanCard
      tefila={tefila}
      extraInfo={jahrzeitInfo}
    />
  )
}

type ErevShabbatCardProps = {
  tefila: Tefila
}

function ErevShabbatCard({
  tefila,
}: ErevShabbatCardProps) {
  const cardFridayDateValue =
    tefila.dateValue ??
    fridayDateValue

  const cardFridayHebcalInfo =
    getHebcalDayInfo(
      cardFridayDateValue,
    )

  const [daySettings, setDaySettings] =
    useState<DaySettings | null>(null)

  useEffect(() => {
    return subscribeToDaySettings(
      cardFridayDateValue,
      setDaySettings,
      (error) => {
        console.error(
          'Kunde inte läsa fredagens dagsinställningar:',
          error,
        )

        setDaySettings(null)
      },
    )
  }, [cardFridayDateValue])

  const showCandleLighting =
    daySettings?.showCandleLighting ?? true

  const candleLightingTime =
    daySettings?.customCandleLightingTime?.trim() ||
    cardFridayHebcalInfo.candleLightingTime

  const candleLightingInfo =
    showCandleLighting &&
    candleLightingTime
      ? {
          label: 'Ljuständning',
          value: candleLightingTime,
        }
      : undefined

  return (
    <LiveMinyanCard
      tefila={tefila}
      extraInfo={candleLightingInfo}
    />
  )
}

type ProgramCardProps = {
  dateValue: string
}

function ProgramCard({
  dateValue,
}: ProgramCardProps) {
  const cardSaturdayDateValue =
    dateValue

  const cardSaturday =
    new Date(
      `${cardSaturdayDateValue}T12:00:00`,
    )

  const shabbatHebcalInfo =
    getHebcalDayInfo(
      cardSaturdayDateValue,
    )

  const [daySettings, setDaySettings] =
    useState<DaySettings | null>(null)

  const [kiddush, setKiddush] =
    useState<KiddushBooking | null>(null)

  useEffect(() => {
    return subscribeToDaySettings(
      cardSaturdayDateValue,
      setDaySettings,
      (error) => {
        /*
         * Om Day Settings inte kan läsas ska
         * Shabbat-kortet ändå fungera med HebCal.
         */
        console.error(
          'Kunde inte läsa dagsinställningar på startsidan:',
          error,
        )

        setDaySettings(null)
      },
    )
  }, [cardSaturdayDateValue])

  useEffect(() => {
    return subscribeToKiddushDate(
      cardSaturdayDateValue,
      setKiddush,
      (error) => {
        console.error(
          'Kunde inte läsa Kiddush på startsidan:',
          error,
        )

        setKiddush(null)
      },
    )
  }, [cardSaturdayDateValue])

  const isHoliday =
    daySettings?.dayType === 'holiday' ||
    daySettings?.dayType === 'shabbatHoliday' ||
    shabbatHebcalInfo.isHoliday

  const customHolidayName =
    daySettings?.holidayName?.trim()

  const baseDisplayTitle =
    customHolidayName ||
    shabbatHebcalInfo.holidayNames[0] ||
    shabbatHebcalInfo.parasha ||
    todayProgram.title

  const shabbatNotices = [
    shabbatHebcalInfo.isShabbatMevarchim
      ? 'Shabbat Mevarchim'
      : null,
    shabbatHebcalInfo.roshChodeshName,
  ].filter(Boolean)

  const displayTitle =
    [
      baseDisplayTitle,
      ...shabbatNotices,
    ].join(' · ')

  const displayDate =
    `Lördag ${formatSwedishDate(cardSaturday)}`

  const hebrewDate =
    shabbatHebcalInfo.hebrewDate

  const showHavdala =
    daySettings?.showHavdala ?? true

  const showMincha =
    daySettings?.showMincha ?? true

  const havdalaTime =
    daySettings?.customHavdalaTime?.trim() ||
    shabbatHebcalInfo.havdalaTime


  const minchaGedolaTime =
    getMinchaGedolaTime(cardSaturday)

  const manualSermon =
    daySettings?.sermon?.trim()

  const sermon =
    manualSermon ||
    getDefaultSermon(
      cardSaturdayDateValue,
    )

  const comment =
    daySettings?.comment?.trim()

  const moreInformation =
    daySettings?.moreInformation?.trim()

  const showKiddush =
    kiddush?.status !== 'blocked'

  const kiddushSponsor =
    kiddush?.status === 'approved'
      ? kiddush.sponsor?.trim()
      : undefined

  const kiddushDedication =
    kiddush?.status === 'approved'
      ? kiddush.dedication?.trim()
      : undefined

  /*
   * Bygg först de vanliga programraderna.
   * Därefter sätter vi ordningen explicit:
   *
   * Shacharit → Predikan → Kiddush →
   * Mincha → Havdala
   */
  const baseProgram =
    todayProgram.program.flatMap(
      (item): ProgramItem[] => {
        if (
          item.id === 'mincha' &&
          !showMincha
        ) {
          return []
        }

        if (item.id === 'havdala') {
          if (!showHavdala) {
            return []
          }

          return [
            {
              ...item,
              value:
                havdalaTime ||
                item.value,
            },
          ]
        }

        if (
          item.id === 'sermon' ||
          item.label
            .toLowerCase()
            .includes('predikan')
        ) {
          if (!sermon) {
            return []
          }

          return [
            {
              ...item,
              value: sermon,
            },
          ]
        }

        return [item]
      },
    )

  const findProgramItem = (
    id: string,
    label: string,
  ) =>
    baseProgram.find(
      (item) =>
        item.id === id ||
        item.label
          .toLowerCase()
          .includes(label),
    )

  const shacharitItem =
    findProgramItem(
      'shacharit',
      'shacharit',
    )

  const sermonProgramItem =
    baseProgram.find(
      (item) =>
        item.id === 'sermon' ||
        item.label
          .toLowerCase()
          .includes('predikan'),
    )

  const minchaSource =
    findProgramItem(
      'mincha',
      'mincha',
    )

  const minchaItem: ProgramItem | undefined =
    minchaSource
      ? {
          ...minchaSource,
          value:
            minchaGedolaTime ||
            minchaSource.value,
        }
      : undefined

  const havdalaItem =
    findProgramItem(
      'havdala',
      'havdala',
    )

  const kiddushProgramItem: ProgramItem | null =
    showKiddush
      ? {
          id: 'firebase-kiddush',
          label: 'Kiddush',
          value: kiddushSponsor
            ? kiddushDedication
              ? `${kiddushSponsor} bjuder på Kiddush. ${formatKiddushDedication(
                  kiddushDedication,
                  kiddush?.dedicationType,
                )}`
              : `${kiddushSponsor} bjuder på Kiddush.`
            : 'Adat Jisrael bjuder på Kiddush.',
          icon: 'wine',
        }
      : null

  const displayProgram: ProgramItem[] = [
    shacharitItem,
    sermonProgramItem,
    kiddushProgramItem,
    minchaItem,
    havdalaItem,
  ].filter(
    (item): item is ProgramItem =>
      item !== undefined &&
      item !== null,
  )


  const accentColor = isHoliday
    ? 'bg-amber-700'
    : 'bg-[#68123f]'

  const accentTextColor = isHoliday
    ? 'text-amber-800'
    : 'text-[#68123f]'

  const accentBackground = isHoliday
    ? 'bg-amber-100'
    : 'bg-rose-100'

  return (
    <article
      className={`overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ${
        isHoliday
          ? 'ring-amber-700/25'
          : 'ring-[#68123f]/25'
      }`}
    >
      <div className={`${accentColor} px-5 py-3 text-white`}>
        <div className="flex items-center gap-2">
          {isHoliday && (
            <Star className="h-5 w-5" />
          )}

          <p className="text-sm font-bold uppercase tracking-wide">
            {isHoliday
              ? 'Högtid'
              : 'Shabbat'}
          </p>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p
              className={`text-sm font-semibold ${accentTextColor}`}
            >
              {displayDate}
            </p>

            <h2 className="mt-1 text-2xl font-bold text-[#183b70]">
              {displayTitle}
            </h2>

            {hebrewDate && (
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {hebrewDate}
              </p>
            )}
          </div>

          {isHoliday && (
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${accentBackground} ${accentTextColor}`}
            >
              <Star className="h-6 w-6" />
            </div>
          )}
        </div>

        <div className="mt-5 divide-y divide-slate-100">
          {displayProgram.map((item) => (
            <ProgramDetail
              key={item.id}
              item={item}
            />
          ))}
        </div>

        {comment && (
          <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
            {comment}
          </div>
        )}

        {moreInformation && (
          <div className="mt-5 rounded-2xl bg-sky-50 p-4 ring-1 ring-sky-100">
            <p className="text-xs font-bold uppercase tracking-wide text-[#183b70]">
              Mer information
            </p>

            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
              {moreInformation}
            </p>
          </div>
        )}

      </div>
    </article>
  )
}

type ProgramDetailProps = {
  item: ProgramItem
}

function ProgramDetail({
  item,
}: ProgramDetailProps) {
  return (
    <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#183b70]">
        {getProgramIcon(item.icon)}
      </div>

      <div className="flex-1">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
          {item.label}
        </p>

        <p className="mt-0.5 font-semibold text-slate-800">
          {item.value}
        </p>
      </div>
    </div>
  )
}

function getProgramIcon(
  icon: ProgramItem['icon'],
): ReactNode {
  const iconClassName = 'h-5 w-5'

  switch (icon) {
    case 'book':
      return <BookOpen className={iconClassName} />

    case 'clock':
      return <Clock className={iconClassName} />

    case 'mic':
      return <Mic2 className={iconClassName} />

    case 'wine':
      return <Wine className={iconClassName} />

    case 'food':
      return <Utensils className={iconClassName} />

    case 'moon':
      return <Clock className={iconClassName} />

    default:
      return <Star className={iconClassName} />
  }
}

function SupportSection() {
  async function handleSwish() {
    try {
      await navigator.clipboard.writeText(
        synagogueSettings.swish.number,
      )

      window.alert(
        `Swishnummer ${synagogueSettings.swish.number} har kopierats.`,
      )
    } catch {
      window.alert(
        `Swish: ${synagogueSettings.swish.number}`,
      )
    }
  }

  return (
    <section className="overflow-hidden rounded-3xl bg-[#183b70] text-white shadow-sm">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
            <Heart className="h-6 w-6" />
          </div>

          <div>
            <h2 className="text-xl font-bold">
              Stöd {synagogueSettings.synagogueName}
            </h2>

            <p className="mt-2 text-sm leading-6 text-blue-100">
              Din gåva bidrar till ett levande judiskt
              församlingsliv, våra tfilot och vår
              verksamhet.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-white/10 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wide text-blue-100">
            Swish
          </p>

          <p className="mt-1 text-2xl font-bold tracking-wide">
            {synagogueSettings.swish.number}
          </p>

          <p className="mt-1 text-sm text-blue-100">
            {synagogueSettings.swish.message}
          </p>
        </div>

        <button
          type="button"
          onClick={handleSwish}
          className="mt-4 w-full rounded-2xl bg-white px-4 py-3 font-bold text-[#183b70] transition hover:bg-blue-50"
        >
          Kopiera Swish-nummer
        </button>
      </div>
    </section>
  )
}

function SponsorsSection() {
  return (
    <section className="pb-2">
      <h2 className="text-center text-sm font-bold uppercase tracking-wide text-slate-400">
        Tack till våra sponsorer
      </h2>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {synagogueSettings.sponsors.map((sponsor) => (
          <div
            key={sponsor.id}
            className="flex min-h-28 items-center justify-center rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
          >
            <img
              src={sponsor.logoUrl}
              alt={sponsor.name}
              className="max-h-20 max-w-full object-contain"
            />
          </div>
        ))}
      </div>
    </section>
  )
}

function isTefilaStillCurrent(
  tefila: Tefila,
  now: Date,
): boolean {
  if (!tefila.dateValue) {
    return true
  }

  const normalizedTime =
    tefila.time.replace('.', ':')

  const timeMatch = normalizedTime.match(
    /^(\d{1,2}):(\d{2})$/,
  )

  if (!timeMatch) {
    return true
  }

  const start = new Date(
    `${tefila.dateValue}T00:00:00`,
  )

  start.setHours(
    Number(timeMatch[1]),
    Number(timeMatch[2]),
    0,
    0,
  )

  const removeAfter =
    new Date(
      start.getTime() +
        2 * 60 * 60 * 1000,
    )

  return now < removeAfter
}

function mergeStandardAndFirebaseTfilot(
  standardTfilot: Tefila[],
  firebaseTfilot: TefilaRecord[],
): Tefila[] {
  const merged = new Map<string, Tefila>()

  for (const tefila of standardTfilot) {
    merged.set(
      getTefilaKey(tefila),
      tefila,
    )
  }

  for (const record of firebaseTfilot) {
    const existing =
      merged.get(record.id)

    merged.set(
      record.id,
      convertTefilaRecord(
        record,
        existing,
      ),
    )
  }

  return Array.from(
    merged.values(),
  ).sort(compareTfilot)
}

function convertTefilaRecord(
  record: TefilaRecord,
  existing?: Tefila,
): Tefila {
  const date = new Date(
    `${record.date}T12:00:00`,
  )

  return {
    id: record.id,
    firestoreId: record.id,
    dateValue: record.date,
    day:
      existing?.day ??
      formatSwedishWeekday(date),
    date:
      existing?.date ??
      formatSwedishDate(date),
    title: record.title,
    time: record.time,
    attending:
      existing?.attending ?? 0,
  }
}

function getTefilaKey(
  tefila: Tefila,
): string {
  return (
    tefila.firestoreId ??
    `tefila-${tefila.id}`
  )
}

function compareTfilot(
  first: Tefila,
  second: Tefila,
): number {
  const firstDate =
    first.dateValue ?? ''

  const secondDate =
    second.dateValue ?? ''

  const dateComparison =
    firstDate.localeCompare(secondDate)

  if (dateComparison !== 0) {
    return dateComparison
  }

  return normalizeFeedTime(
    first.time,
  ).localeCompare(
    normalizeFeedTime(second.time),
  )
}

function normalizeFeedTime(
  value: string,
): string {
  return value.replace('.', ':')
}

function formatSwedishWeekday(
  date: Date,
): string {
  const weekday =
    new Intl.DateTimeFormat(
      'sv-SE',
      {
        weekday: 'long',
      },
    ).format(date)

  return (
    weekday.charAt(0).toUpperCase() +
    weekday.slice(1)
  )
}

function findNextWeekday(
  startDate: Date,
  weekday: number,
): Date {
  const result = new Date(startDate)
  result.setHours(0, 0, 0, 0)

  const daysUntil =
    (weekday - result.getDay() + 7) % 7

  result.setDate(result.getDate() + daysUntil)

  return result
}

function addDays(
  date: Date,
  numberOfDays: number,
): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + numberOfDays)

  return result
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

function formatSwedishDate(
  date: Date,
): string {
  return new Intl.DateTimeFormat('sv-SE', {
    day: 'numeric',
    month: 'long',
  }).format(date)
}

function formatKiddushDedication(
  dedication: string,
  type?: KiddushBooking['dedicationType'],
): string {
  const clean = dedication
    .trim()
    .replace(/[.!?]+$/, '')

  if (type === 'memory') {
    return `Till minne av ${clean}.`
  }

  if (type === 'celebration') {
    return `För att fira ${clean}.`
  }

  if (type === 'custom') {
    return `${clean}.`
  }

  if (type === 'occasion') {
    return `Med anledning av ${clean}.`
  }

  // Gamla bokningar saknar typ.
  return `${clean}.`
}

export default HomePage

function getMinchaGedolaTime(
  date: Date,
): string | null {
  try {
    const location = new GeoLocation(
      'Stockholm',
      59.3293,
      18.0686,
      0,
      'Europe/Stockholm',
    )

    const zmanim = new Zmanim(
      location,
      date,
      false,
    )

    const minchaGedola =
      zmanim.minchaGedola()

    return new Intl.DateTimeFormat(
      'sv-SE',
      {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Europe/Stockholm',
      },
    ).format(minchaGedola)
  } catch (error) {
    console.error(
      'Kunde inte beräkna Mincha Gedolah:',
      error,
    )

    return null
  }
}

