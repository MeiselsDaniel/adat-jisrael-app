import {
  collection, doc, onSnapshot, query, serverTimestamp,
  setDoc, updateDoc, where, type Unsubscribe,
} from 'firebase/firestore'
import { db } from '../firebase/config'

export type EventInvitation = {
  id: string
  eventId: string
  eventTitle: string
  eventDate: string
  eventTime: string
  userId: string
  userName: string
  invitedBy: string
  status: 'pending' | 'accepted' | 'declined'
  createdAt?: unknown
  updatedAt?: unknown
}

export async function createEventInvitation(
  input: Omit<EventInvitation, 'id' | 'status' | 'createdAt' | 'updatedAt'>
): Promise<void> {
  const id = `${input.eventId}__${input.userId}`
  await setDoc(doc(db, 'eventInvitations', id), {
    ...input,
    id,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export function subscribeToUserEventInvitations(
  userId: string,
  callback: (items: EventInvitation[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    query(collection(db, 'eventInvitations'), where('userId', '==', userId)),
    snapshot => callback(snapshot.docs.map(item => ({
      ...(item.data() as EventInvitation),
      id: item.id,
    }))),
    onError,
  )
}

export async function respondToEventInvitation(
  invitationId: string,
  status: 'accepted' | 'declined',
): Promise<void> {
  await updateDoc(doc(db, 'eventInvitations', invitationId), {
    status,
    updatedAt: serverTimestamp(),
  })
}
