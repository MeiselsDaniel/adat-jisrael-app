import { useEffect, useState } from 'react'
import {
  Flame,
  MoonStar,
} from 'lucide-react'
import {
  getCandleLighting,
} from '../utils/hebcal'
import {
  getDisplayedCandleLightingTime,
  subscribeToDaySettings,
  type DaySettings,
} from '../services/daySettingsService'

type ErevDayInfoCardProps = {
  dateValue: string
}

function ErevDayInfoCard({
  dateValue,
}: ErevDayInfoCardProps) {
  const [settings, setSettings] =
    useState<DaySettings | null>(null)

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    setLoading(true)

    return subscribeToDaySettings(
      dateValue,
      (nextSettings) => {
        setSettings(nextSettings)
        setLoading(false)
      },
      () => {
        /*
         * Om dokumentet inte kan läsas visar vi fortfarande
         * HebCal-tiden som reserv.
         */
        setSettings(null)
        setLoading(false)
      },
    )
  }, [dateValue])

  const date = new Date(
    `${dateValue}T12:00:00`,
  )

  const hebcalTime = getEventTime(
    getCandleLighting(date),
  )

  const displayedTime =
    getDisplayedCandleLightingTime(
      hebcalTime,
      settings,
    )

  const showCandleLighting =
    settings?.showCandleLighting ??
    true

  if (
    loading ||
    !showCandleLighting ||
    !displayedTime
  ) {
    return null
  }

  const hasCustomTime = Boolean(
    settings?.customCandleLightingTime,
  )

  const title =
    settings?.dayType === 'holiday' ||
    settings?.dayType ===
      'shabbatHoliday'
      ? settings.holidayName
        ? `Erev ${settings.holidayName}`
        : 'Erev högtid'
      : 'Erev Shabbat'

  return (
    <article className="overflow-hidden rounded-3xl bg-[#68123f] text-white shadow-sm">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
            <MoonStar className="h-6 w-6" />
          </div>

          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-wide text-rose-100">
              {title}
            </p>

            <div className="mt-3 flex items-center gap-3">
              <Flame className="h-5 w-5 text-amber-200" />

              <div>
                <p className="text-sm font-semibold text-rose-100">
                  Ljuständning
                </p>

                <p className="text-2xl font-black">
                  {displayedTime}
                </p>
              </div>
            </div>

            {hasCustomTime &&
              hebcalTime &&
              hebcalTime !== displayedTime && (
                <p className="mt-3 text-xs text-rose-100">
                  HebCal: {hebcalTime}
                </p>
              )}
          </div>
        </div>
      </div>
    </article>
  )
}

function getEventTime(
  event: ReturnType<
    typeof getCandleLighting
  >,
): string | null {
  if (!event) {
    return null
  }

  const possibleEvent =
    event as unknown as {
      eventTime?: string
      eventTimeStr?: string
      getDesc: () => string
    }

  if (possibleEvent.eventTime) {
    return normalizeTime(
      possibleEvent.eventTime,
    )
  }

  if (possibleEvent.eventTimeStr) {
    return normalizeTime(
      possibleEvent.eventTimeStr,
    )
  }

  const match =
    possibleEvent
      .getDesc()
      .match(
        /([01]?\d|2[0-3]):[0-5]\d/,
      )

  return match
    ? normalizeTime(match[0])
    : null
}

function normalizeTime(
  value: string,
): string {
  const match = value.match(
    /([01]?\d|2[0-3]):[0-5]\d/,
  )

  return match?.[0] ?? value
}

export default ErevDayInfoCard
