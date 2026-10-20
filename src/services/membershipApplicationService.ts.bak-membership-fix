import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '../firebase/config'

export type MembershipApplicationInput = {
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
  const reference =
    await addDoc(
      collection(
        db,
        'membershipApplications',
      ),
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

        status: 'pending',

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp(),
      },
    )

  return reference.id
}


export type MembershipApplicationStatus =
  | 'pending'
  | 'processing'
  | 'approved'
  | 'rejected'

export type MembershipApplication = {
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
    },
  )
}
