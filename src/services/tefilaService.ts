import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import type {
  DocumentData,
  QueryDocumentSnapshot,
  Unsubscribe,
} from 'firebase/firestore'
import { db } from '../firebase/config'

export type TefilaStatus =
  | 'scheduled'
  | 'cancelled'
  | 'completed'

export type MinyanResult =
  | 'confirmed'
  | 'notConfirmed'

export type TefilaRecord = {
  id: string
  title: string
  date: string
  time: string
  status: TefilaStatus
  allowRegistration: boolean

  minyanResult?: MinyanResult
  actualAttendance?: number
  confirmedBy?: string
  confirmedAt?: unknown

  createdAt?: unknown
  updatedAt?: unknown
}

export type TefilaRegistration = {
  id: string
  tefilaId: string
  userId: string
  userName: string
  attending: boolean
  guestCount: number
  guestComment?: string
  createdAt?: unknown
  updatedAt?: unknown
}

export type SaveRegistrationInput = {
  tefilaId: string
  userId: string
  userName: string
  guestCount?: number
  guestComment?: string
}

export type ConfirmMinyanInput = {
  tefilaId: string
  result: MinyanResult
  actualAttendance: number
  confirmedBy: string
}

export type EnsureTefilaInput = {
  id: string
  title: string
  date: string
  time: string
}

export async function ensureTefilaExists({
  id,
  title,
  date,
  time,
}: EnsureTefilaInput): Promise<void> {
  const reference = doc(db, 'tfilot', id)
  const snapshot = await getDoc(reference)

  if (snapshot.exists()) {
    return
  }

  await setDoc(reference, {
    id,
    title,
    date,
    time,
    status: 'scheduled',
    allowRegistration: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function saveTefila(
  tefila: TefilaRecord,
): Promise<void> {
  await setDoc(
    doc(db, 'tfilot', tefila.id),
    {
      ...tefila,
      updatedAt: serverTimestamp(),
      createdAt:
        tefila.createdAt ?? serverTimestamp(),
    },
    {
      merge: true,
    },
  )
}

export async function getTefila(
  tefilaId: string,
): Promise<TefilaRecord | null> {
  const snapshot = await getDoc(
    doc(db, 'tfilot', tefilaId),
  )

  if (!snapshot.exists()) {
    return null
  }

  return mapTefila(snapshot)
}

export function subscribeToTefila(
  tefilaId: string,
  callback: (
    tefila: TefilaRecord | null,
  ) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    doc(db, 'tfilot', tefilaId),
    (snapshot) => {
      callback(
        snapshot.exists()
          ? mapTefila(snapshot)
          : null,
      )
    },
    (error) => {
      console.error(
        'Kunde inte läsa tfilan:',
        error,
      )
      onError?.(error)
    },
  )
}

export async function getTfilotBetween(
  startDate: string,
  endDate: string,
): Promise<TefilaRecord[]> {
  const tfilotQuery = query(
    collection(db, 'tfilot'),
    where('date', '>=', startDate),
    where('date', '<=', endDate),
  )

  const snapshot = await getDocs(tfilotQuery)

  return snapshot.docs
    .map(mapTefila)
    .sort(compareTefilaRecords)
}

export function subscribeToTfilotBetween(
  startDate: string,
  endDate: string,
  callback: (tfilot: TefilaRecord[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const tfilotQuery = query(
    collection(db, 'tfilot'),
    where('date', '>=', startDate),
    where('date', '<=', endDate),
  )

  return onSnapshot(
    tfilotQuery,
    (snapshot) => {
      callback(
        snapshot.docs
          .map(mapTefila)
          .sort(compareTefilaRecords),
      )
    },
    (error) => {
      console.error(
        'Kunde inte läsa tfilot:',
        error,
      )
      onError?.(error)
    },
  )
}

export async function saveRegistration({
  tefilaId,
  userId,
  userName,
  guestCount = 0,
  guestComment,
}: SaveRegistrationInput): Promise<void> {
  const normalizedGuestCount = Math.max(
    0,
    Math.min(50, Math.floor(guestCount)),
  )

  const trimmedComment =
    guestComment?.trim()

  const registration: Omit<
    TefilaRegistration,
    'createdAt' | 'updatedAt'
  > & {
    createdAt: unknown
    updatedAt: unknown
  } = {
    id: userId,
    tefilaId,
    userId,
    userName: userName.trim(),
    attending: true,
    guestCount: normalizedGuestCount,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  if (trimmedComment) {
    registration.guestComment =
      trimmedComment
  }

  await setDoc(
    doc(
      db,
      'tfilot',
      tefilaId,
      'registrations',
      userId,
    ),
    registration,
    {
      merge: true,
    },
  )
}

export async function updateRegistrationGuests(
  tefilaId: string,
  userId: string,
  guestCount: number,
  guestComment?: string,
): Promise<void> {
  const normalizedGuestCount = Math.max(
    0,
    Math.min(50, Math.floor(guestCount)),
  )

  const trimmedComment =
    guestComment?.trim()

  await updateDoc(
    doc(
      db,
      'tfilot',
      tefilaId,
      'registrations',
      userId,
    ),
    {
      guestCount: normalizedGuestCount,
      guestComment:
        trimmedComment || null,
      updatedAt: serverTimestamp(),
    },
  )
}

export async function removeRegistration(
  tefilaId: string,
  userId: string,
): Promise<void> {
  await deleteDoc(
    doc(
      db,
      'tfilot',
      tefilaId,
      'registrations',
      userId,
    ),
  )
}

export async function getRegistrations(
  tefilaId: string,
): Promise<TefilaRegistration[]> {
  const registrationsQuery = query(
    collection(
      db,
      'tfilot',
      tefilaId,
      'registrations',
    ),
    orderBy('userName', 'asc'),
  )

  const snapshot =
    await getDocs(registrationsQuery)

  return snapshot.docs.map(mapRegistration)
}

export function subscribeToRegistrations(
  tefilaId: string,
  callback: (
    registrations: TefilaRegistration[],
  ) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const registrationsQuery = query(
    collection(
      db,
      'tfilot',
      tefilaId,
      'registrations',
    ),
    orderBy('userName', 'asc'),
  )

  return onSnapshot(
    registrationsQuery,
    (snapshot) => {
      callback(
        snapshot.docs.map(mapRegistration),
      )
    },
    (error) => {
      console.error(
        'Kunde inte läsa anmälningarna:',
        error,
      )
      onError?.(error)
    },
  )
}

export function calculateAttendance(
  registrations: TefilaRegistration[],
): number {
  return registrations.reduce(
    (total, registration) => {
      if (!registration.attending) {
        return total
      }

      return (
        total +
        1 +
        Math.max(0, registration.guestCount)
      )
    },
    0,
  )
}

export async function setTefilaStatus(
  tefilaId: string,
  status: TefilaStatus,
): Promise<void> {
  await setDoc(
    doc(db, 'tfilot', tefilaId),
    {
      status,
      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    },
  )
}

export async function confirmMinyan({
  tefilaId,
  result,
  actualAttendance,
  confirmedBy,
}: ConfirmMinyanInput): Promise<void> {
  const normalizedAttendance = Math.max(
    0,
    Math.floor(actualAttendance),
  )

  await setDoc(
    doc(db, 'tfilot', tefilaId),
    {
      status: 'completed',
      minyanResult: result,
      actualAttendance:
        normalizedAttendance,
      confirmedBy,
      confirmedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    },
  )
}

function compareTefilaRecords(
  first: TefilaRecord,
  second: TefilaRecord,
): number {
  const dateComparison =
    first.date.localeCompare(second.date)

  if (dateComparison !== 0) {
    return dateComparison
  }

  return first.time
    .replace('.', ':')
    .localeCompare(
      second.time.replace('.', ':'),
    )
}

function mapTefila(
  snapshot: QueryDocumentSnapshot<DocumentData>,
): TefilaRecord {
  return {
    id: snapshot.id,
    ...(snapshot.data() as Omit<
      TefilaRecord,
      'id'
    >),
  }
}

function mapRegistration(
  snapshot: QueryDocumentSnapshot<DocumentData>,
): TefilaRegistration {
  const data =
    snapshot.data() as Omit<
      TefilaRegistration,
      'id'
    >

  return {
    id: snapshot.id,
    ...data,
    guestCount: Number(
      data.guestCount ?? 0,
    ),
  }
}