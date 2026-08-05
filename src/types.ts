export type Page = 'home' | 'calendar' | 'kiddush' | 'more'

export type UserRole = 'user' | 'admin' | 'superadmin'

export type UserCategory =
  | 'member'
  | 'nonMember'
  | 'guest'
  | 'staff'
  | 'rabbi'
  | 'board'

export type UserStatus = 'pending' | 'approved' | 'blocked'

export type Permissions = {
  registerForTfilot: boolean
  viewAttendanceCount: boolean
  viewAttendeeNames: boolean
  viewMemberCalendar: boolean
  bookKiddush: boolean
  viewMemberInformation: boolean
}

export type AppUser = {
  id: string
  name: string
  email: string
  phone?: string
  role: UserRole
  category: UserCategory
  status: UserStatus
  permissions: Permissions
}

/*
 * Den gemensamma händelsemodellen.
 * Tfilot, Jahrzeit, aktiviteter och högtider använder samma struktur.
 */

export type EventType =
  | 'tefila'
  | 'jahrzeit'
  | 'kiddush'
  | 'shiur'
  | 'activity'
  | 'holiday'
  | 'meeting'
  | 'other'

export type EventVisibility =
  | 'allRegistered'
  | 'membersOnly'
  | 'adminsOnly'

export type EventStatus =
  | 'draft'
  | 'scheduled'
  | 'published'
  | 'cancelled'

export type RecurrenceType =
  | 'none'
  | 'weekly'
  | 'monthly'
  | 'yearly'

export type AppEvent = {
  id: string

  type: EventType
  title: string
  description?: string

  startDate: string
  startTime: string
  endTime?: string

  location?: string

  visibility: EventVisibility
  status: EventStatus

  showOnHome: boolean
  showInCalendar: boolean
  allowRegistration: boolean
  showAttendeeCount: boolean
  showAttendeeNames: boolean
  sendPushNotification: boolean

  recurrence: RecurrenceType
  recurrenceEndDate?: string

  createdAt: string
  createdBy: string

  /*
   * Används främst för Jahrzeit.
   */
  memorialName?: string
  memorialHebrewName?: string
  showMemorialName?: boolean
  kaddishWillBeSaid?: boolean

  /*
   * Används främst för Kiddush.
   */
  kiddushHost?: string
  kiddushDedication?: string
}

/*
 * Anmälan till en händelse.
 */

export type EventRegistration = {
  id: string
  eventId: string
  userId: string
  registeredAt: string
}

/*
 * Informationsinlägg och medlemsnyheter.
 */

export type InformationStatus =
  | 'draft'
  | 'scheduled'
  | 'published'

export type InformationVisibility =
  | 'allRegistered'
  | 'membersOnly'
  | 'adminsOnly'

export type InformationPost = {
  id: string
  title: string
  summary?: string
  content: string
  imageUrl?: string

  visibility: InformationVisibility
  status: InformationStatus
  pinned: boolean
  sendPushNotification: boolean

  publishAt?: string
  publishedAt?: string

  createdAt: string
  createdBy: string
}

/*
 * Ansökan om medlemskap.
 */

export type MembershipApplicationStatus =
  | 'pending'
  | 'approved'
  | 'needsMoreInformation'
  | 'rejected'

export type MembershipApplication = {
  id: string
  userId: string

  fullName: string
  email: string
  phone?: string
  address?: string
  message?: string

  status: MembershipApplicationStatus

  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
}

/*
 * Äldre datatyper som den nuvarande prototypen fortfarande använder.
 * Vi behåller dem tills sidorna har flyttats över till AppEvent.
 */

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
  membersOnly?: boolean
}

export type KiddushDate = {
  id: number
  date: string
  available: boolean
  host?: string
  dedication?: string
}