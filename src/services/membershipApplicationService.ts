import {
  deleteDoc,
  getDoc,
  setDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type Unsubscribe,

  Timestamp,
  deleteField,} from 'firebase/firestore'
import { db } from '../firebase/config'

export type MembershipApplicationInput = {
  under26: boolean
  jfstMember: boolean | null
  seat: boolean
  gender: 'man' | 'woman' | null
  annualFee: number

  userId: string
  name: string
  email: string
  phone?: string
  address?: string
  message?: string
}

export async function createMembershipApplication(
  input: MembershipApplicationInput,
): Promise<string> {
  const reference = doc(db, 'membershipApplications', input.userId)

  const existing = await getDoc(reference)
  if (existing.exists()) {
    throw new Error('Du har redan skickat en medlemsansökan.')
  }

  await setDoc(reference,
      {
        userId: input.userId,
        name: input.name.trim(),
        email: input.email.trim(),
        phone:
          input.phone?.trim() || null,
        address:
          input.address?.trim() || null,
        message:
          input.message?.trim() || null,

        under26: input.under26,
        jfstMember: input.jfstMember,
        seat: input.seat,
        gender: input.gender,
        annualFee: input.annualFee,

        status: 'pending',

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp(),
      },
    )

  return reference.id
}

export async function getMembershipApplication(userId: string) {
  const snapshot = await getDoc(doc(db, 'membershipApplications', userId))
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as MembershipApplication : null
}


export type MembershipApplicationStatus =
  | 'pending'
  | 'processed'
  | 'processing'
  | 'approved'
  | 'rejected'

export type MembershipApplication = {
  under26: boolean
  jfstMember: boolean | null
  seat: boolean
  gender: 'man' | 'woman' | null
  annualFee: number

  id: string
  userId: string
  name: string
  email: string
  phone?: string | null
  address?: string | null
  message?: string | null
  status: MembershipApplicationStatus
  createdAt?: unknown
  updatedAt?: unknown
}

export function subscribeToMembershipApplications(
  callback: (
    applications: MembershipApplication[],
  ) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const applicationsQuery =
    query(
      collection(
        db,
        'membershipApplications',
      ),
      orderBy(
        'createdAt',
        'desc',
      ),
    )

  return onSnapshot(
    applicationsQuery,
    (snapshot) => {
      callback(
        snapshot.docs.map(
          (document) => ({
            id: document.id,
            ...(document.data() as Omit<
              MembershipApplication,
              'id'
            >),
          }),
        ),
      )
    },
    (error) => {
      console.error(
        'Kunde inte läsa medlemsansökningar:',
        error,
      )

      onError?.(error)
    },
  )
}

export async function updateMembershipApplicationStatus(
  applicationId: string,
  status: MembershipApplicationStatus,
): Promise<void> {
  await updateDoc(
    doc(
      db,
      'membershipApplications',
      applicationId,
    ),
    {
      status,
      updatedAt: serverTimestamp(),
      deleteAt:
        status === 'processed'
          ? Timestamp.fromDate(
              new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
            )
          : deleteField(),
    },
  )
}


export async function deleteMembershipApplication(
  applicationId: string,
): Promise<void> {
  const reference = doc(
    db,
    'membershipApplications',
    applicationId,
  )

  const snapshot = await getDoc(reference)

  if (!snapshot.exists()) {
    throw new Error('Ansökan finns inte längre.')
  }

  if (snapshot.data().status !== 'processed') {
    throw new Error('Endast behandlade ansökningar får raderas.')
  }

  await deleteDoc(reference)
}
