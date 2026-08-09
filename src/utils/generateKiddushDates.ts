import {
  flags,
  HebrewCalendar,
} from '@hebcal/core'
import type {
  KiddushListItem,
} from '../components/KiddushCard'

const NUMBER_OF_DAYS = 365

export function generateKiddushDates(
  startDate = new Date(),
): KiddushListItem[] {
  const start = startOfDay(startDate)

  const items: KiddushListItem[] = []

  for (
    let index = 0;
    index < NUMBER_OF_DAYS;
    index += 1
  ) {
    const date = addDays(start, index)

    if (!isKiddushDate(date)) {
      continue
    }

    const dateValue = formatDateValue(date)

    items.push({
      id: `kiddush-${dateValue}`,
      date: formatLongSwedishDate(date),
      dateValue,
      occasion: getOccasionForDate(date),
      status: 'available',
    })
  }

  return items
}

function isKiddushDate(date: Date): boolean {
  /*
   * Varje Shabbat är ett Kiddushdatum.
   */
  if (date.getDay() === 6) {
    return true
  }

  const events = getHebcalEvents(date)

  /*
   * Jom Tov-dagar får också Kiddushdatum.
   *
   * CHAG täcker bland annat:
   * Rosh Hashana, Sukkot, Shemini Atzeret,
   * Simchat Torah, Pesach och Shavuot.
   */
  const isYomTov = events.some((event) =>
    Boolean(
      event.getFlags() & flags.CHAG,
    ),
  )

  if (!isYomTov) {
    return false
  }

  /*
   * Yom Kippur har självklart ingen Kiddush.
   */
  const names = events.map((event) =>
    event.render('en').toLowerCase(),
  )

  if (
    names.some((name) =>
      name.includes('yom kippur'),
    )
  ) {
    return false
  }

  return true
}

function getOccasionForDate(
  date: Date,
): string {
  const events = getHebcalEvents(date)

  const holiday = events.find((event) =>
    Boolean(
      event.getFlags() & flags.CHAG,
    ),
  )

  /*
   * På en vanlig Shabbat vill vi visa parashan.
   * På Jom Tov vill vi visa högtiden.
   */
  if (holiday) {
    return formatOccasionName(
      holiday.render('en'),
    )
  }

  const parasha = events.find((event) =>
    Boolean(
      event.getFlags() &
        flags.PARSHA_HASHAVUA,
    ),
  )

  if (parasha) {
    return formatOccasionName(
      parasha.render('en'),
    )
  }

  return 'Shabbat'
}

function getHebcalEvents(
  date: Date,
) {
  return HebrewCalendar.calendar({
    start: date,
    end: date,

    /*
     * Adat Jisrael följer diasporakalender,
     * därför ska andra dagen Jom Tov finnas.
     */
    il: false,

    sedrot: true,
    noMinorFast: true,
    noModern: true,
  })
}

function formatOccasionName(
  value: string,
): string {
  return value
    .replace(
      /^Parashat\s+/i,
      'Parashat ',
    )
    .replace(
      /Rosh Hashana/gi,
      'Rosh Hashana',
    )
    .replace(
      /Yom Kippur/gi,
      'Yom Kippur',
    )
    .replace(
      /Sukkot/gi,
      'Sukkot',
    )
    .replace(
      /Shmini Atzeret/gi,
      'Shemini Atzeret',
    )
    .replace(
      /Simchat Torah/gi,
      'Simchat Torah',
    )
    .replace(
      /Pesach/gi,
      'Pesach',
    )
    .replace(
      /Shavuot/gi,
      'Shavuot',
    )
}

function startOfDay(
  date: Date,
): Date {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)

  return result
}

function addDays(
  date: Date,
  numberOfDays: number,
): Date {
  const result = new Date(date)

  result.setDate(
    result.getDate() + numberOfDays,
  )

  return result
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

function formatLongSwedishDate(
  date: Date,
): string {
  return new Intl.DateTimeFormat(
    'sv-SE',
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    },
  ).format(date)
}
