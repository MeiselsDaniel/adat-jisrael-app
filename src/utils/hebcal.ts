import {
  HDate,
  HebrewCalendar,
  Location,
  Event,
} from '@hebcal/core'

const stockholm = Location.lookup('Stockholm')

export function getHebrewDate(date = new Date()) {
  const hd = new HDate(date)

  return hd.renderGematriya()
}

export function getParasha(date = new Date()) {
  const events = HebrewCalendar.calendar({
    start: date,
    end: date,
    location: stockholm,
  })

  const parasha = events.find((event: Event) =>
    event.getDesc().startsWith('Parashat'),
  )

  return parasha?.getDesc() ?? null
}

export function getTodayEvents(date = new Date()) {
  return HebrewCalendar.calendar({
    start: date,
    end: date,
    location: stockholm,
  })
}

export function getCandleLighting(date = new Date()) {
  const events = getTodayEvents(date)

  return (
    events.find((event) =>
      event.getDesc().includes('Candle lighting'),
    ) ?? null
  )
}

export function getHavdala(date = new Date()) {
  const events = getTodayEvents(date)

  return (
    events.find((event) =>
      event.getDesc().includes('Havdalah'),
    ) ?? null
  )
}

export function isRoshChodesh(date = new Date()) {
  return getTodayEvents(date).some((event) =>
    event.getDesc().startsWith('Rosh Chodesh'),
  )
}