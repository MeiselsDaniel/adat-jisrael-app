export type Page = 'home' | 'calendar' | 'kiddush' | 'profile'

export type Attendance = boolean

export type Tefila = {
  id: number
  day: string
  date: string
  title: string
  time: string
  attending: number
}

export type CalendarEvent = {
  id: number
  dateNumber: string
  month: string
  weekday: string
  title: string
  time: string
  category: 'Tefila' | 'Aktivitet' | 'Högtid' | 'Kiddush'
}

export type KiddushDate = {
  id: number
  date: string
  available: boolean
  host?: string
  dedication?: string
}