import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '../firebase/config'

export type TefilaInvitationStatus =
  | 'pending'
  | 'accepted'
  | 'declined'

export type TefilaInvitation = {
  id: string
  tefilaId: string
  tefilaTitle: string
  tefilaDate: string
  tefilaTime: string
  userId: string
  userName: string
  status: TefilaInvitationStatus
  invitedBy: string
  createdAt?: unknown
  updatedAt?: unknown
}

export async function createTefilaInvitation({
  tefilaId,
  tefilaTitle,
  tefilaDate,
  tefilaTime,
  userId,
  userName,
  invitedBy,
}: Omit<
  TefilaInvitation,
  'id' | 'status' | 'createdAt' | 'updatedAt'
>): Promise<void> {
  const id =
    `${tefilaId}__${userId}`

  await setDoc(
    doc(
      db,
      'tefilaInvitations',
      id,
    ),
    {
      id,
      tefilaId,
      tefilaTitle,
      tefilaDate,
      tefilaTime,
      userId,
      userName,
      status: 'pending',
      invitedBy,
      createdAt:
        serverTimestamp(),
      updatedAt:
        serverTimestamp(),
    },
    {
      merge: true,
    },
  )
}

export function subscribeToUserInvitations(
  userId: string,
  callback: (
    invitations: TefilaInvitation[],
  ) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const invitationsQuery =
    query(
      collection(
        db,
        'tefilaInvitations',
      ),
      where(
        'userId',
        '==',
        userId,
      ),
    )

  return onSnapshot(
    invitationsQuery,
    (snapshot) => {
      callback(
        snapshot.docs.map(
          (document) => ({
            id: document.id,
            ...(document.data() as Omit<
              TefilaInvitation,
              'id'
            >),
          }),
        ),
      )
    },
    (error) => {
      console.error(
        'Kunde inte läsa inbjudningar:',
        error,
      )
      onError?.(error)
    },
  )
}

export async function respondToTefilaInvitation(
  invitationId: string,
  status: 'accepted' | 'declined',
): Promise<void> {
  await updateDoc(
    doc(
      db,
      'tefilaInvitations',
      invitationId,
    ),
    {
      status,
      updatedAt:
        serverTimestamp(),
    },
  )
}
