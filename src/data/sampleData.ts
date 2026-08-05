import type {
  CalendarEvent,
  KiddushDate,
  Tefila,
} from '../types'

export const upcomingTfilot: Tefila[] = [
  {
    id: 1,
    day: 'Måndag',
    date: '10 augusti',
    title: 'Shacharit',
    time: '07.30',
    attending: 8,
  },
  {
    id: 2,
    day: 'Tisdag',
    date: '11 augusti',
    title: 'Shacharit',
    time: '07.30',
    attending: 11,
  },
  {
    id: 3,
    day: 'Onsdag',
    date: '12 augusti',
    title: 'Shacharit',
    time: '07.30',
    attending: 6,
  },
  {
    id: 4,
    day: 'Torsdag',
    date: '13 augusti',
    title: 'Shacharit',
    time: '07.30',
    attending: 9,
  },
  {
    id: 5,
    day: 'Fredag',
    date: '14 augusti',
    title: 'Shacharit',
    time: '07.30',
    attending: 7,
  },
  {
    id: 6,
    day: 'Fredag',
    date: '14 augusti',
    title: 'Kabbalat Shabbat',
    time: '18.00',
    attending: 14,
  },
]

export const calendarEvents: CalendarEvent[] = [
  {
    id: 1,
    dateNumber: '8',
    month: 'AUG',
    weekday: 'Lördag',
    title: 'Shacharit',
    time: '09.00',
    category: 'Tefila',
  },
  {
    id: 2,
    dateNumber: '9',
    month: 'AUG',
    weekday: 'Söndag',
    title: 'Shacharit',
    time: '09.00',
    category: 'Tefila',
  },
  {
    id: 3,
    dateNumber: '14',
    month: 'AUG',
    weekday: 'Fredag',
    title: 'Kabbalat Shabbat',
    time: '18.00',
    category: 'Tefila',
  },
  {
    id: 4,
    dateNumber: '15',
    month: 'AUG',
    weekday: 'Lördag',
    title: 'Kiddush',
    time: 'Efter Shacharit',
    category: 'Kiddush',
  },
  {
    id: 5,
    dateNumber: '23',
    month: 'AUG',
    weekday: 'Söndag',
    title: 'Föreläsning och fika',
    time: '17.00',
    category: 'Aktivitet',
  },
]

export const kiddushDates: KiddushDate[] = [
  {
    id: 1,
    date: '8 augusti',
    available: false,
    host: 'Familjen Cohen',
  },
  {
    id: 2,
    date: '15 augusti',
    available: true,
  },
  {
    id: 3,
    date: '22 augusti',
    available: true,
  },
  {
    id: 4,
    date: '29 augusti',
    available: false,
    host: 'Familjen Levi',
    dedication: 'Till minne av en anhörig',
  },
]