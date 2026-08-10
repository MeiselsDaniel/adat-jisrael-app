import {
  HDate,
  HebrewCalendar,
  Location,
} from '@hebcal/core'

const stockholm = Location.lookup('Stockholm')

export function getHebrewDate(
  date = new Date(),
): string {
  const hd = new HDate(date)

  return hd.renderGematriya()
}

export function getParasha(
  date = new Date(),
): string | null {
  const events = HebrewCalendar.calendar({
    start: date,
    end: date,
    location: stockholm,
  })

  const parasha = events.find((event) =>
    event.getDesc().startsWith('Parashat'),
  )

  return parasha?.getDesc() ?? null
}

export function getTodayEvents(
  date = new Date(),
) {
  return HebrewCalendar.calendar({
    start: date,
    end: date,
    location: stockholm,
    candlelighting: true,
    sedrot: true,
  })
}

export function getCandleLighting(
  date = new Date(),
) {
  const events = getTodayEvents(date)

  return (
    events.find((event) =>
      event
        .getDesc()
        .includes('Candle lighting'),
    ) ?? null
  )
}

export function getHavdala(
  date = new Date(),
) {
  const events = getTodayEvents(date)

  return (
    events.find((event) =>
      event.getDesc().includes('Havdalah'),
    ) ?? null
  )
}

export function isRoshChodesh(
  date = new Date(),
): boolean {
  return getRoshChodeshName(date) !== null
}

export function getRoshChodeshName(
  date = new Date(),
): string | null {
  const event = getTodayEvents(date).find(
    (item) =>
      item
        .getDesc()
        .startsWith('Rosh Chodesh'),
  )

  return event?.getDesc() ?? null
}

export function getHebrewDateFromIso(
  isoDate: string,
): string | null {
  const match = isoDate.match(
    /^(\d{4})-(\d{2})-(\d{2})$/,
  )

  if (!match) {
    return null
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])

  const date = new Date(
    year,
    month - 1,
    day,
    12,
    0,
    0,
  )

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }

  return new HDate(date).render()
}
