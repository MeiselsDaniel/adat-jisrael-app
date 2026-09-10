import {
  Heart,
  Star,
} from 'lucide-react'
import {
  useEffect,
  useMemo,
  useState,
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
import { subscribeToHavdalaTime } from '../services/havdalaTimesService'
import {
  subscribeToTfilotBetween,
  type TefilaRecord,
} from '../services/tefilaService'
import {
  subscribeToEventsBetween,
  type StoredAppEvent,
} from '../services/eventService'
import ProgramCardView from '../components/ProgramCardView'
import { buildProgramCardData } from '../utils/buildProgramCardData'
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

const thirdFriday = addDays(nextFriday, 14)
const thirdSaturday = addDays(nextSaturday, 14)

const fridayDateValue = formatDateValue(nextFriday)
const saturdayDateValue = formatDateValue(nextSaturday)

const secondFridayDateValue =
  formatDateValue(secondFriday)

const secondSaturdayDateValue =
  formatDateValue(secondSaturday)

const thirdFridayDateValue =
  formatDateValue(thirdFriday)

const thirdSaturdayDateValue =
  formatDateValue(thirdSaturday)

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
  title: 'Kabbalat Shabbat/Maariv',
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
  title: 'Kabbalat Shabbat/Maariv',
  time:
    scheduleWithKabbalat.kabbalatShabbat ??
    '19.30',
  attending: 0,
}

const thirdKabbalatShabbat: Tefila = {
  id: `${thirdFridayDateValue}-kabbalat-shabbat`,
  firestoreId:
    `${thirdFridayDateValue}-kabbalat-shabbat`,
  dateValue: thirdFridayDateValue,
  day: 'Fredag',
  date: formatSwedishDate(thirdFriday),
  title: 'Kabbalat Shabbat/Maariv',
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
          secondSaturdayDateValue &&
        event.startDate <
          thirdSaturdayDateValue,
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

  const displayedThirdKabbalatShabbat =
    mergedTfilot.find(
      (tefila) =>
        tefila.firestoreId ===
        thirdKabbalatShabbat.firestoreId,
    ) ?? thirdKabbalatShabbat

  const showThirdKabbalatShabbat =
    isTefilaStillCurrent(
      displayedThirdKabbalatShabbat,
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
          secondSaturdayDateValue &&
        (tefila.dateValue ?? '') <
          thirdSaturdayDateValue &&
        tefila.firestoreId !==
          thirdKabbalatShabbat.firestoreId,
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

      <section className="space-y-3 [&>*:nth-child(n+15)]:hidden">
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

        {showThirdKabbalatShabbat && (
          <ErevShabbatCard
            tefila={displayedThirdKabbalatShabbat}
          />
        )}

        <ProgramCard
          dateValue={thirdSaturdayDateValue}
        />
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
    tefila.firestoreId?.endsWith(
      '-shacharit',
    ) ||
    String(tefila.id).endsWith(
      '-shacharit',
    ) ||
    tefila.title
      .toLowerCase()
      .includes(
        'shacharit',
      )

  const tefilaDateValue =
    tefila.dateValue ?? ''

  const [daySettings, setDaySettings] =
    useState<DaySettings | null>(null)

  useEffect(() => {
    if (!tefilaDateValue) {
      setDaySettings(null)
      return
    }

    return subscribeToDaySettings(
      tefilaDateValue,
      setDaySettings,
      (caughtError) => {
        console.error(
          'Kunde inte läsa dagsinställningar för minjankort:',
          caughtError,
        )
        setDaySettings(null)
      },
    )
  }, [tefilaDateValue])

  const isHolidayShacharit =
    isShacharit &&
    Boolean(tefilaDateValue) &&
    (
      daySettings?.dayType === 'holiday' ||
      daySettings?.dayType === 'shabbatHoliday'
    )

  if (isHolidayShacharit) {
    return (
      <ProgramCard
        dateValue={tefilaDateValue}
      />
    )
  }

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

  const isErevHolidayProgram =
    !isShacharit &&
    Boolean(tefilaDateValue) &&
    daySettings?.dayType === 'erevHoliday'

  const erevHolidayCandleLightingTime =
    isErevHolidayProgram &&
    daySettings?.showCandleLighting !== false
      ? (
          daySettings?.customCandleLightingTime?.trim() ||
          getHebcalDayInfo(
            tefilaDateValue,
          ).candleLightingTime
        )
      : null

  const displayedExtraInfo =
    isErevHolidayProgram &&
    erevHolidayCandleLightingTime
      ? {
          label: 'Ljuständning',
          value: erevHolidayCandleLightingTime,
        }
      : jahrzeitInfo

  return (
    <LiveMinyanCard
      tefila={
        isErevHolidayProgram
          ? {
              ...tefila,
              kind: 'erevHoliday',
              allowRegistration:
                daySettings?.allowRegistration ??
                true,
            }
          : tefila
      }
      extraInfo={displayedExtraInfo}
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

    const isErevShabbatErevHoliday =
      daySettings?.dayType ===
      'erevShabbatErevHoliday'

    const rawErevHolidayName =
      daySettings?.holidayName?.trim() ||
      cardFridayHebcalInfo.holidayNames[0] ||
      ''

    const erevHolidayName =
      rawErevHolidayName
        .toLowerCase()
        .startsWith('erev ')
        ? rawErevHolidayName
        : rawErevHolidayName
          ? `Erev ${rawErevHolidayName}`
          : ''

    const fridayHolidayLabel =
      isErevShabbatErevHoliday &&
      erevHolidayName
        ? `Erev Shabbat · ${erevHolidayName}`
        : undefined

  return (
      <LiveMinyanCard
        tefila={
          isErevShabbatErevHoliday
            ? {
                ...tefila,
                kind: 'erevHoliday',
              }
            : tefila
        }
        extraInfo={candleLightingInfo}
        holidayLabel={fridayHolidayLabel}
      />
  )
}

type ProgramCardProps = {
  dateValue: string
}

function ProgramCard({
  dateValue,
}: ProgramCardProps) {
  const cardDateValue =
    dateValue

  const cardDate =
    new Date(
      `${cardDateValue}T12:00:00`,
    )

  const cardHebcalInfo =
    getHebcalDayInfo(
      cardDateValue,
    )

  const [daySettings, setDaySettings] =
    useState<DaySettings | null>(null)

  const [kiddush, setKiddush] =
    useState<KiddushBooking | null>(null)

  const [
    registeredHavdalaTime,
    setRegisteredHavdalaTime,
  ] = useState<string | null>(null)

  useEffect(() => {
    return subscribeToDaySettings(
      cardDateValue,
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
  }, [cardDateValue])

  useEffect(() => {
    return subscribeToKiddushDate(
      cardDateValue,
      setKiddush,
      (error) => {
        console.error(
          'Kunde inte läsa Kiddush på startsidan:',
          error,
        )

        setKiddush(null)
      },
    )
  }, [cardDateValue])

  useEffect(() => {
    return subscribeToHavdalaTime(
      cardDateValue,
      setRegisteredHavdalaTime,
      (error) => {
        console.error(
          'Kunde inte läsa registrerad Havdala-tid på startsidan:',
          error,
        )

        setRegisteredHavdalaTime(null)
      },
    )
  }, [cardDateValue])

  const showCandleLighting =
    daySettings?.showCandleLighting ?? true

  const showHavdala =
    daySettings?.showHavdala ?? true

  const showMincha =
    daySettings?.showMincha ?? true

  const candleLightingTime =
    daySettings?.customCandleLightingTime?.trim() ||
    cardHebcalInfo.candleLightingTime

  const havdalaTime =
    daySettings?.customHavdalaTime?.trim() ||
    registeredHavdalaTime ||
    cardHebcalInfo.havdalaTime

  const minchaGedolaTime =
    getMinchaGedolaTime(cardDate)

  const customMinchaTime =
    daySettings?.customMinchaTime?.trim()

  const customMinchaLabel =
    daySettings?.customMinchaLabel?.trim()

  const useZmanForMincha =
    cardHebcalInfo.isShabbat

  const manualSermon =
    daySettings?.sermon?.trim()

  const sermon =
    manualSermon ||
    getDefaultSermon(cardDateValue)

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

  const cardData =
    buildProgramCardData({
      dateValue: cardDateValue,
      hebcalInfo: cardHebcalInfo,
      daySettings,
      sermon,
      candleLightingTime:
        showCandleLighting
          ? candleLightingTime
          : null,
      havdalaTime:
        showHavdala
          ? havdalaTime
          : null,
      minchaTime:
        showMincha
          ? (
              customMinchaTime ||
              (
                useZmanForMincha
                  ? minchaGedolaTime
                  : undefined
              )
            )
          : null,
      minchaLabel:
        customMinchaLabel ||
        undefined,
      kiddush: {
        show: showKiddush,
        sponsor: kiddushSponsor,
        dedication: kiddushDedication,
        dedicationType: kiddush?.dedicationType,
      },
    })

  return (
    <ProgramCardView
      isHoliday={cardData.isHoliday}
      headerLabel={cardData.headerLabel}
      displayDate={cardData.displayDate}
      displayTitle={cardData.displayTitle}
      hebrewDate={cardData.hebrewDate}
      program={cardData.program}
      comment={cardData.comment}
      moreInformation={cardData.moreInformation}
    />
  )
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

