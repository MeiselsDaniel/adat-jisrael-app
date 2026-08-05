import type { Tefila } from '../types'

const WEEKDAY_SHACHARIT_TIME = '07.30'
const SUNDAY_SHACHARIT_TIME = '08.15'

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

const monthNames = [
  'januari',
  'februari',
  'mars',
  'april',
  'maj',
  'juni',
  'juli',
  'augusti',
  'september',
  'oktober',
  'november',
  'december',
]

export function generateStandardTfilot(
  startDate = new Date(),
): Tefila[] {
  const generatedTfilot: Tefila[] = []

  const firstDate = startOfDay(startDate)

  for (
    let offset = 0;
    offset < DAYS_TO_GENERATE;
    offset += 1
  ) {
    const currentDate = addDays(firstDate, offset)
    const weekday = currentDate.getDay()

    /*
     * Lördagens Shacharit visas i Shabbat-kortet
     * och ska därför inte bli ett vanligt anmälningskort.
     */
    if (weekday === 6) {
      continue
    }

    const isSunday = weekday === 0

    generatedTfilot.push({
      id: createNumericId(currentDate),
      day: weekdayNames[weekday],
      date: formatSwedishDate(currentDate),
      title: 'Shacharit',
      time: isSunday
        ? SUNDAY_SHACHARIT_TIME
        : WEEKDAY_SHACHARIT_TIME,
      attending: getDemoAttendance(weekday),
    })
  }

  return generatedTfilot
}

function startOfDay(date: Date): Date {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)

  return result
}

function addDays(date: Date, numberOfDays: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + numberOfDays)

  return result
}

function formatSwedishDate(date: Date): string {
  return `${date.getDate()} ${monthNames[date.getMonth()]}`
}

function createNumericId(date: Date): number {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return Number(
    `${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}`,
  )
}

/*
 * Tillfälliga demonstrationssiffror.
 * Dessa ersätts senare av riktiga anmälningar från databasen.
 */
function getDemoAttendance(weekday: number): number {
  const demoAttendance: Record<number, number> = {
    0: 9,
    1: 8,
    2: 11,
    3: 6,
    4: 9,
    5: 7,
  }

  return demoAttendance[weekday] ?? 0
}