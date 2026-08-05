import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
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

export type FirebaseUserProfile = {
  uid: string
  firstName: string
  lastName: string
  name: string
  email: string
  phone?: string
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

  return snapshot.data() as FirebaseUserProfile
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<
    Pick<
      FirebaseUserProfile,
      | 'firstName'
      | 'lastName'
      | 'name'
      | 'phone'
      | 'role'
      | 'status'
    >
  >,
): Promise<void> {
  await updateDoc(doc(db, 'users', uid), {
    ...updates,
    updatedAt: serverTimestamp(),
  })
}