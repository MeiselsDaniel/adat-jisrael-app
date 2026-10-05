import { getHebcalDayInfo } from '../services/hebcalService'

/*
 * Automatisk tid för Kabbalat Shabbat under
 * den del av sommarhalvåret då Adat Jisrael
 * använder fasta tider.
 *
 * Manuellt sparade tfilot i Firestore har
 * fortfarande företräde framför denna tid.
 */
export function getAutomaticKabbalatShabbatTime(
  date: Date,
): string {
  const dateValue =
    formatDateValue(date)

  const hebcalInfo =
    getHebcalDayInfo(dateValue)

  const candleLighting =
    hebcalInfo.candleLightingTime

  if (!candleLighting) {
    return '19.30'
  }

  const minutes =
    timeToMinutes(candleLighting)

  if (minutes === null) {
    return '19.30'
  }

  if (minutes >= 21 * 60 + 23) {
    return '20.15'
  }

  if (minutes >= 20 * 60 + 45) {
    return '20.00'
  }

  return '19.30'
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

function timeToMinutes(
  value: string,
): number | null {
  const normalized =
    value.trim().replace('.', ':')

  const match =
    normalized.match(
      /^(\d{1,2}):(\d{2})/,
    )

  if (!match) {
    return null
  }

  return (
    Number(match[1]) * 60 +
    Number(match[2])
  )
}
