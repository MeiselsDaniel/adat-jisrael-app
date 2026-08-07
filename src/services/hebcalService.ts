import {
  HDate,
  HebrewCalendar,
  Location,
  TimedEvent,
  type Event,
} from '@hebcal/core'

export type HebcalDayInfo = {
  dateValue: string
  hebrewDate: string

  isShabbat: boolean
  isErevShabbat: boolean
  isRoshChodesh: boolean
  isShabbatMevarchim: boolean
  isHoliday: boolean
  isErevHoliday: boolean

  parasha: string | null
  holidayNames: string[]
  roshChodeshName: string | null

  candleLightingTime: string | null
  havdalaTime: string | null
}

/*
 * Hämtar all HebCal-information för ett datum.
 *
 * Funktionen kastar inte fel till React-gränssnittet.
 * Om HebCal skulle misslyckas returneras en säker
 * grundmodell, så att appen inte blir helt vit.
 */
export function getHebcalDayInfo(
  dateValue: string,
): HebcalDayInfo {
  const date = createLocalDate(dateValue)

  const fallback =
    createFallbackInfo(dateValue, date)

  try {
    const location = new Location(
      59.3293,
      18.0686,
      false,
      'Europe/Stockholm',
      'Stockholm, Sweden',
      'SE',
    )

    const events =
      HebrewCalendar.calendar({
        start: date,
        end: date,
        location,
        candlelighting: true,
        sedrot: true,
        addHebrewDates: true,
      })

    return {
      dateValue,
      hebrewDate:
        new HDate(date).render('en'),

      isShabbat:
        date.getDay() === 6,

      isErevShabbat:
        date.getDay() === 5,

      isRoshChodesh:
        events.some(isRoshChodeshEvent),

      isShabbatMevarchim:
        isShabbatMevarchimDate(date),

      isHoliday:
        events.some(isHolidayEvent),

      isErevHoliday:
        events.some(isErevHolidayEvent),

      parasha:
        getParasha(events),

      holidayNames:
        getHolidayNames(events),

      roshChodeshName:
        getRoshChodeshName(events),

      candleLightingTime:
        getTimedEventValue(
          events,
          'Candle lighting',
        ),

      havdalaTime:
        getTimedEventValue(
          events,
          'Havdalah',
        ),
    }
  } catch (error) {
    console.error(
      `HebCal kunde inte läsa ${dateValue}:`,
      error,
    )

    return fallback
  }
}

/*
 * Hämtar flera dagar utan att en felaktig dag
 * kan krascha resten av kalendern.
 */
export function getHebcalRange(
  startDateValue: string,
  numberOfDays: number,
): HebcalDayInfo[] {
  const startDate =
    createLocalDate(startDateValue)

  const safeNumberOfDays = Math.max(
    0,
    Math.floor(numberOfDays),
  )

  const result: HebcalDayInfo[] = []

  for (
    let offset = 0;
    offset < safeNumberOfDays;
    offset += 1
  ) {
    const date = new Date(startDate)

    date.setDate(
      date.getDate() + offset,
    )

    result.push(
      getHebcalDayInfo(
        formatDateValue(date),
      ),
    )
  }

  return result
}

function createFallbackInfo(
  dateValue: string,
  date: Date,
): HebcalDayInfo {
  let hebrewDate = ''

  try {
    hebrewDate =
      new HDate(date).render('en')
  } catch {
    hebrewDate = ''
  }

  return {
    dateValue,
    hebrewDate,

    isShabbat:
      date.getDay() === 6,

    isErevShabbat:
      date.getDay() === 5,

    isRoshChodesh: false,
    isShabbatMevarchim: false,
    isHoliday: false,
    isErevHoliday: false,

    parasha: null,
    holidayNames: [],
    roshChodeshName: null,

    candleLightingTime: null,
    havdalaTime: null,
  }
}

function getTimedEventValue(
  events: Event[],
  description: string,
): string | null {
  const event = events.find(
    (item) =>
      item instanceof TimedEvent &&
      item
        .getDesc()
        .includes(description),
  )

  if (!(event instanceof TimedEvent)) {
    return null
  }

  return event.eventTimeStr
}

function getParasha(
  events: Event[],
): string | null {
  const event = events.find(
    (item) =>
      item
        .getDesc()
        .startsWith('Parashat'),
  )

  return event?.getDesc() ?? null
}

function isShabbatMevarchimDate(
  date: Date,
): boolean {
  if (date.getDay() !== 6) {
    return false
  }

  for (
    let offset = 1;
    offset <= 7;
    offset += 1
  ) {
    const candidate = new Date(date)

    candidate.setDate(
      candidate.getDate() + offset,
    )

    const candidateInfo =
      HebrewCalendar.calendar({
        start: candidate,
        end: candidate,
      })

    const hasRoshChodesh =
      candidateInfo.some(
        isRoshChodeshEvent,
      )

    if (!hasRoshChodesh) {
      continue
    }

    /*
     * Tishrei välsignas inte på Shabbat
     * Mevarchim före Rosh Hashana.
     */
    const hebrewMonth =
      new HDate(candidate).getMonth()

    return hebrewMonth !== 7
  }

  return false
}

function getRoshChodeshName(
  events: Event[],
): string | null {
  const event = events.find(
    isRoshChodeshEvent,
  )

  return event?.getDesc() ?? null
}

function getHolidayNames(
  events: Event[],
): string[] {
  return Array.from(
    new Set(
      events
        .filter(isHolidayEvent)
        .map(
          (event) =>
            event.getDesc(),
        ),
    ),
  )
}

function isRoshChodeshEvent(
  event: Event,
): boolean {
  return event
    .getDesc()
    .startsWith('Rosh Chodesh')
}

function isErevHolidayEvent(
  event: Event,
): boolean {
  return event
    .getDesc()
    .startsWith('Erev ')
}

function isHolidayEvent(
  event: Event,
): boolean {
  const description =
    event.getDesc()

  if (
    description.includes(
      'Candle lighting',
    ) ||
    description.includes(
      'Havdalah',
    ) ||
    description.startsWith(
      'Parashat',
    ) ||
    description.startsWith(
      'Rosh Chodesh',
    )
  ) {
    return false
  }

  return event
    .getCategories()
    .includes('holiday')
}

function createLocalDate(
  dateValue: string,
): Date {
  const match = dateValue.match(
    /^(\d{4})-(\d{2})-(\d{2})$/,
  )

  if (!match) {
    throw new Error(
      `Ogiltigt datum: ${dateValue}`,
    )
  }

  const year = Number(match[1])
  const month = Number(match[2]) - 1
  const day = Number(match[3])

  return new Date(
    year,
    month,
    day,
    12,
    0,
    0,
    0,
  )
}

function formatDateValue(
  date: Date,
): string {
  const year =
    date.getFullYear()

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0')

  const day = String(
    date.getDate(),
  ).padStart(2, '0')

  return `${year}-${month}-${day}`
}
