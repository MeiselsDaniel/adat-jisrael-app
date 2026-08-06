import {
  flags,
  HebrewCalendar,
} from '@hebcal/core'
import type {
  KiddushListItem,
  KiddushStatus,
} from '../components/KiddushCard'

const NUMBER_OF_WEEKS = 52

export function generateKiddushDates(
  startDate = new Date(),
): KiddushListItem[] {
  const firstSaturday = findNextSaturday(
    startOfDay(startDate),
  )

  const items: KiddushListItem[] = []

  for (
    let index = 0;
    index < NUMBER_OF_WEEKS;
    index += 1
  ) {
    const date = addDays(firstSaturday, index * 7)
    const dateValue = formatDateValue(date)

    items.push({
      id: `kiddush-${dateValue}`,
      date: formatLongSwedishDate(date),
      dateValue,
      occasion: getOccasionForDate(date),
      status: getDemoStatus(index),
      host: getDemoHost(index),
      dedication: getDemoDedication(index),
    })
  }

  return items
}

function getOccasionForDate(date: Date): string {
  const events = HebrewCalendar.calendar({
    start: date,
    end: date,
    sedrot: true,
    noMinorFast: true,
    noModern: true,
  })

  const holiday = events.find((event) => {
    const eventFlags = event.getFlags()

    return Boolean(
      eventFlags &
        (flags.CHAG |
          flags.CHOL_HAMOED |
          flags.MAJOR_FAST),
    )
  })

  if (holiday) {
    return formatOccasionName(
      holiday.render('en'),
    )
  }

  const parasha = events.find((event) =>
    Boolean(
      event.getFlags() & flags.PARSHA_HASHAVUA,
    ),
  )

  if (parasha) {
    return formatOccasionName(
      parasha.render('en'),
    )
  }

  return 'Shabbat'
}

function formatOccasionName(value: string): string {
  return value
    .replace(/^Parashat\s+/i, 'Parashat ')
    .replace(/Rosh Hashana/gi, 'Rosh Hashana')
    .replace(/Yom Kippur/gi, 'Yom Kippur')
    .replace(/Sukkot/gi, 'Sukkot')
    .replace(/Shmini Atzeret/gi, 'Shemini Atzeret')
    .replace(/Simchat Torah/gi, 'Simchat Torah')
    .replace(/Pesach/gi, 'Pesach')
    .replace(/Shavuot/gi, 'Shavuot')
    .replace(/Tish'a B'Av/gi, "Tisha B'Av")
}

function startOfDay(date: Date): Date {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)

  return result
}

function findNextSaturday(date: Date): Date {
  const result = new Date(date)

  const daysUntilSaturday =
    (6 - result.getDay() + 7) % 7

  result.setDate(
    result.getDate() + daysUntilSaturday,
  )

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

function formatDateValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0')
  const day = String(date.getDate()).padStart(
    2,
    '0',
  )

  return `${year}-${month}-${day}`
}

function formatLongSwedishDate(
  date: Date,
): string {
  return new Intl.DateTimeFormat('sv-SE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

/*
 * Tillfälliga exempelbokningar.
 * Dessa ersätts senare av bokningar från Firestore.
 */
function getDemoStatus(
  index: number,
): KiddushStatus {
  if (index === 1 || index === 5) {
    return 'booked'
  }

  if (index === 3) {
    return 'pending'
  }

  return 'available'
}

function getDemoHost(
  index: number,
): string | undefined {
  if (index === 1) {
    return 'Familjen Cohen'
  }

  if (index === 3) {
    return 'Familjen Levi'
  }

  if (index === 5) {
    return 'Familjen Fried'
  }

  return undefined
}

function getDemoDedication(
  index: number,
): string | undefined {
  if (index === 1) {
    return 'Till minne av en älskad familjemedlem.'
  }

  if (index === 5) {
    return 'Med anledning av en födelsedag.'
  }

  return undefined
}