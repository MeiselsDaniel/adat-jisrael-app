import { synagogueSettings } from '../data/settings'
import type { Tefila } from '../types'

const DAYS_TO_GENERATE = 14

const weekdayNames = [
  'Söndag',
  'Måndag',
  'Tisdag',
  'Onsdag',
  'Torsdag',
  'Fredag',
  'Lördag',
]

export function generateStandardTfilot(
  startDate = new Date(),
  daysToGenerate = DAYS_TO_GENERATE,
): Tefila[] {
  const generatedTfilot: Tefila[] = []
  const firstDate = startOfDay(startDate)

  for (
    let offset = 0;
    offset < daysToGenerate;
    offset += 1
  ) {
    const currentDate = addDays(
      firstDate,
      offset,
    )

    const weekday = currentDate.getDay()

    /*
     * Shabbat visas som ett separat programkort
     * utan vanlig minjananmälan.
     */
    if (weekday === 6) {
      continue
    }

    const isSunday = weekday === 0
    const dateValue =
      formatDateValue(currentDate)

    const firestoreId =
      `${dateValue}-shacharit`

    generatedTfilot.push({
      id: firestoreId,
      firestoreId,
      dateValue,
      day: weekdayNames[weekday],
      date: formatSwedishDate(currentDate),
      title: 'Shacharit',
      time: isSunday
        ? synagogueSettings.schedule
            .sundayShacharit
        : synagogueSettings.schedule
            .weekdayShacharit,
      attending: 0,
    })
  }

  return generatedTfilot
}

function startOfDay(date: Date): Date {
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