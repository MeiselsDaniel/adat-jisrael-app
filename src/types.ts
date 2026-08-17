export type Page =
  | 'home'
  | 'calendar'
  | 'information'
  | 'kiddush'
  | 'membership'
  | 'boardContact'
  | 'documents'
  | 'profile'
  | 'more'

export type UserRole =
  | 'user'
  | 'admin'
  | 'superadmin'

export type UserCategory =
  | 'member'
  | 'nonMember'
  | 'guest'
  | 'staff'
  | 'rabbi'
  | 'board'

export type UserStatus =
  | 'pending'
  | 'approved'
  | 'blocked'

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

  imageUrl?: string

  memberPrice?: number
  nonMemberPrice?: number

  swishNumber?: string
  swishMessage?: string

  registrationDeadline?: string
  maxParticipants?: number

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

  memorialName?: string
  memorialHebrewName?: string
  showMemorialName?: boolean
  kaddishWillBeSaid?: boolean

  kiddushHost?: string
  kiddushDedication?: string
}

export type EventRegistration = {
  id: string
  eventId: string
  userId: string

  userName?: string

  partySize: number
  memberCount?: number
  nonMemberCount?: number
  participantNames?: string[]

  registeredAt: string
  updatedAt?: string
}

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

export type Tefila = {
  /*
   * Tillfällig kompatibilitet med äldre testdata.
   * Nya automatiskt genererade tfilot använder sträng-ID.
   */
  id: string | number

  /*
   * Stabilt dokument-ID för Firestore.
   * Exempel: 2026-08-07-shacharit
   */
  firestoreId?: string

  /*
   * Maskinläsbart datum i formatet YYYY-MM-DD.
   */
  dateValue?: string

  day: string
  date: string
  title: string
  time: string

  /*
   * Äldre testvärde. Riktigt antal hämtas numera
   * från Firestore-registreringarna.
   */
  attending?: number
  kind?: 'regular' | 'erevHoliday' | 'holiday'

  allowRegistration?: boolean
}

export type CalendarEvent = {
  id: number
  dateNumber: string
  month: string
  weekday: string
  title: string
  time: string
  category:
    | 'Tefila'
    | 'Aktivitet'
    | 'Högtid'
    | 'Kiddush'
  membersOnly?: boolean
}

export type KiddushDate = {
  id: number
  date: string
  available: boolean
  host?: string
  dedication?: string
}