import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '../firebase/config'

export type StoredEventRegistration = {
  id: string
  eventId: string
  userId: string
  userName?: string
  partySize: number
  memberCount?: number
  nonMemberCount?: number
  participantNames?: string[]
  registeredAt?: unknown
  updatedAt?: unknown
}

export type SaveEventRegistrationInput = {
  eventId: string
  userId: string
  userName?: string
  partySize: number
  memberCount?: number
  nonMemberCount?: number
  participantNames?: string[]
}

export async function saveEventRegistration(
  input: SaveEventRegistrationInput,
): Promise<void> {
  const registrationId =
    `${input.eventId}__${input.userId}`

  const reference =
    doc(
      db,
      'eventRegistrations',
      registrationId,
    )

  await setDoc(
    reference,
    {
      id: registrationId,
      eventId: input.eventId,
      userId: input.userId,
      userName:
        input.userName?.trim() ||
        null,
      partySize:
        Math.max(
          1,
          input.partySize,
        ),
      memberCount:
        Math.max(
          0,
          input.memberCount ?? 0,
        ),
      nonMemberCount:
        Math.max(
          0,
          input.nonMemberCount ??
            input.partySize,
        ),
      participantNames:
        input.participantNames
          ?.map((name) =>
            name.trim(),
          )
          .filter(Boolean) ??
        [],
      registeredAt:
        serverTimestamp(),
      updatedAt:
        serverTimestamp(),
    },
    {
      merge: true,
    },
  )
}

export async function deleteEventRegistration(
  eventId: string,
  userId: string,
): Promise<void> {
  const registrationId =
    `${eventId}__${userId}`

  await deleteDoc(
    doc(
      db,
      'eventRegistrations',
      registrationId,
    ),
  )
}

export function subscribeToEventRegistrations(
  eventId: string,
  callback: (
    registrations:
      StoredEventRegistration[],
  ) => void,
  onError?: (
    error: Error,
  ) => void,
): Unsubscribe {
  const registrationsQuery =
    query(
      collection(
        db,
        'eventRegistrations',
      ),
      where(
        'eventId',
        '==',
        eventId,
      ),
    )

  return onSnapshot(
    registrationsQuery,
    (snapshot) => {
      callback(
        snapshot.docs.map(
          (document) => ({
            id: document.id,
            ...(document.data() as Omit<
              StoredEventRegistration,
              'id'
            >),
          }),
        ),
      )
    },
    (error) => {
      console.error(
        'Kunde inte läsa aktivitetsanmälningar:',
        error,
      )

      onError?.(error)
    },
  )
}

export function subscribeToUserEventRegistration(
  eventId: string,
  userId: string,
  callback: (
    registration:
      StoredEventRegistration | null,
  ) => void,
  onError?: (
    error: Error,
  ) => void,
): Unsubscribe {
  const registrationId =
    `${eventId}__${userId}`

  return onSnapshot(
    doc(
      db,
      'eventRegistrations',
      registrationId,
    ),
    (snapshot) => {
      if (!snapshot.exists()) {
        callback(null)
        return
      }

      callback({
        id: snapshot.id,
        ...(snapshot.data() as Omit<
          StoredEventRegistration,
          'id'
        >),
      })
    },
    (error) => {
      console.error(
        'Kunde inte läsa användarens aktivitetsanmälan:',
        error,
      )

      onError?.(error)
    },
  )
}

export function countEventParticipants(
  registrations:
    StoredEventRegistration[],
): number {
  return registrations.reduce(
    (total, registration) =>
      total +
      Math.max(
        1,
        registration.partySize ?? 1,
      ),
    0,
  )
}
