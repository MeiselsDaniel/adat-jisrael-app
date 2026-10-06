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
  mevarchimText: string | null

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
        molad: true,
        shabbatMevarchim: true,
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

      mevarchimText:
        getMevarchimText(
          date,
          events,
        ),

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
    mevarchimText: null,

    candleLightingTime: null,
    havdalaTime: null,
  }
}

function getMevarchimText(
  date: Date,
  events: Event[],
): string | null {
  if (!isShabbatMevarchimDate(date)) {
    return null
  }

  const moladEvent = events.find(
    (event) =>
      event.constructor.name ===
      'MoladEvent',
  )

  if (!moladEvent) {
    return null
  }

  const description =
    moladEvent.getDesc()

  const monthMatch =
    description.match(
      /^Molad (.+?) \d+$/,
    )

  const rendered =
    moladEvent.render('en')

  const moladMatch =
    rendered.match(
      /^Molad .+?: ([A-Za-z]+), (\d+):(\d{2}) and (\d+)\s*chalakim$/,
    )

  if (!monthMatch || !moladMatch) {
    return null
  }

  const month = monthMatch[1]

  const weekdayMap: Record<
    string,
    string
  > = {
    Sunday: 'söndag',
    Monday: 'måndag',
    Tuesday: 'tisdag',
    Wednesday: 'onsdag',
    Thursday: 'torsdag',
    Friday: 'fredag',
    Saturday: 'lördag',
  }

  const moladWeekday =
    weekdayMap[moladMatch[1]] ??
    moladMatch[1]

  const hour =
    moladMatch[2].padStart(2, '0')

  const minute = moladMatch[3]
  const chalakim = moladMatch[4]

  const roshChodeshDays: string[] = []

  for (
    let offset = 1;
    offset <= 7;
    offset += 1
  ) {
    const candidate = new Date(date)

    candidate.setDate(
      candidate.getDate() + offset,
    )

    const candidateEvents =
      HebrewCalendar.calendar({
        start: candidate,
        end: candidate,
      })

    if (
      !candidateEvents.some(
        isRoshChodeshEvent,
      )
    ) {
      continue
    }

    const weekday =
      new Intl.DateTimeFormat(
        'sv-SE',
        { weekday: 'long' },
      ).format(candidate)

    roshChodeshDays.push(weekday)
  }

  if (roshChodeshDays.length === 0) {
    return null
  }

  const roshChodeshText =
    roshChodeshDays.length === 1
      ? roshChodeshDays[0]
      : `${roshChodeshDays
          .slice(0, -1)
          .join(', ')} och ${
          roshChodeshDays[
            roshChodeshDays.length - 1
          ]
        }`

  return `Mevarchim Hachodesh ${month}. Rosh Chodesh är ${roshChodeshText}. Molad ${moladWeekday} kl. ${hour}.${minute} och ${chalakim} chalakim.`
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
     *
     * Rosh Chodesh Cheshvan kan börja den
     * 30 Tishrei och fortsätta den 1 Cheshvan.
     * Hoppa därför över en Rosh Chodesh-dag
     * som fortfarande ligger i Tishrei och
     * fortsätt leta i stället för att direkt
     * returnera false.
     */
    const hebrewMonth =
      new HDate(candidate).getMonth()

    if (hebrewMonth !== 7) {
      return true
    }
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
