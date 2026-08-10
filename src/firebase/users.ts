import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import type {
  DocumentData,
  QueryDocumentSnapshot,
  Unsubscribe,
} from 'firebase/firestore'
import { db } from './config'

export type FirebaseUserRole =
  | 'guest'
  | 'member'
  | 'admin'

export type FirebaseUserStatus =
  | 'pending'
  | 'approved'
  | 'blocked'


export type NotificationPreferences = {
  importantInformation: boolean
  tfilot: boolean
  shiurim: boolean
  parties: boolean
  jahrzeit: boolean
  mazelTov: boolean
}

export const defaultNotificationPreferences:
  NotificationPreferences = {
    importantInformation: true,
    tfilot: true,
    shiurim: true,
    parties: true,
    jahrzeit: true,
    mazelTov: true,
  }

export type FirebaseUserProfile = {
  /*
   * Sätts endast av admin.
   * Avgör om användaren kan räknas och
   * anmäla sig till minjan.
   */
  countsForMinyan?: boolean

  uid: string
  firstName: string
  lastName: string
  name: string
  email: string
  phone?: string
  birthDate?: string

  notificationPreferences?:
    NotificationPreferences

  role: FirebaseUserRole
  status: FirebaseUserStatus
  createdAt?: unknown
  updatedAt?: unknown
}

export type CreateUserProfileInput = {
  uid: string
  firstName: string
  lastName: string
  email: string
  phone?: string
}

export type UpdateUserProfileInput = {
  firstName?: string
  lastName?: string
  name?: string
  phone?: string
  birthDate?: string

  notificationPreferences?:
    NotificationPreferences

  role?: FirebaseUserRole
  status?: FirebaseUserStatus
  countsForMinyan?: boolean
}

export async function createUserProfile({
  uid,
  firstName,
  lastName,
  email,
  phone,
}: CreateUserProfileInput): Promise<void> {
  const trimmedFirstName = firstName.trim()
  const trimmedLastName = lastName.trim()
  const trimmedEmail = email.trim().toLowerCase()
  const trimmedPhone = phone?.trim()

  const profile: FirebaseUserProfile = {
    uid,
    firstName: trimmedFirstName,
    lastName: trimmedLastName,
    name: `${trimmedFirstName} ${trimmedLastName}`.trim(),
    email: trimmedEmail,
    notificationPreferences: {
      ...defaultNotificationPreferences,
    },
    role: 'guest',
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  if (trimmedPhone) {
    profile.phone = trimmedPhone
  }

  await setDoc(doc(db, 'users', uid), profile)
}

export async function getUserProfile(
  uid: string,
): Promise<FirebaseUserProfile | null> {
  const snapshot = await getDoc(
    doc(db, 'users', uid),
  )

  if (!snapshot.exists()) {
    return null
  }

  return mapUserProfile(snapshot)
}

export function subscribeToUsers(
  callback: (
    users: FirebaseUserProfile[],
  ) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const usersQuery = query(
    collection(db, 'users'),
    orderBy('name', 'asc'),
  )

  return onSnapshot(
    usersQuery,
    (snapshot) => {
      callback(
        snapshot.docs.map(mapUserProfile),
      )
    },
    (error) => {
      console.error(
        'Kunde inte läsa användarna:',
        error,
      )

      onError?.(error)
    },
  )
}

export async function updateUserProfile(
  uid: string,
  updates: UpdateUserProfileInput,
): Promise<void> {
  await updateDoc(doc(db, 'users', uid), {
    ...updates,
    updatedAt: serverTimestamp(),
  })
}

export async function approveUserAsGuest(
  uid: string,
): Promise<void> {
  await updateUserProfile(uid, {
    role: 'guest',
    status: 'approved',
  })
}

export async function approveUserAsMember(
  uid: string,
): Promise<void> {
  await updateUserProfile(uid, {
    role: 'member',
    status: 'approved',
  })
}

export async function makeUserAdmin(
  uid: string,
): Promise<void> {
  await updateUserProfile(uid, {
    role: 'admin',
    status: 'approved',
  })
}

export async function blockUser(
  uid: string,
): Promise<void> {
  await updateUserProfile(uid, {
    status: 'blocked',
  })
}

export async function restoreUser(
  uid: string,
): Promise<void> {
  await updateUserProfile(uid, {
    status: 'approved',
  })
}

function mapUserProfile(
  snapshot: QueryDocumentSnapshot<DocumentData>,
): FirebaseUserProfile {
  return {
    uid: snapshot.id,
    ...(snapshot.data() as Omit<
      FirebaseUserProfile,
      'uid'
    >),
  }
}