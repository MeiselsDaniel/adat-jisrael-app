import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '../firebase/config'

export type PinnedMessageType =
  | 'mazelTov'
  | 'important'
  | 'fundraiser'
  | 'general'

export type PinnedMessage = {
  type: PinnedMessageType
  text: string
  startDate: string
  endDate: string
  active: boolean
  updatedAt?: unknown
}

const messageRef = doc(
  db,
  'appSettings',
  'pinnedMessage',
)

export function subscribeToPinnedMessage(
  callback: (
    message: PinnedMessage | null,
  ) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    messageRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        callback(null)
        return
      }

      callback(
        snapshot.data() as PinnedMessage,
      )
    },
    (error) => {
      console.error(
        'Kunde inte läsa fäst meddelande:',
        error,
      )

      onError?.(error)
    },
  )
}

export async function savePinnedMessage(
  message: Omit<
    PinnedMessage,
    'updatedAt'
  >,
): Promise<void> {
  await setDoc(
    messageRef,
    {
      ...message,
      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    },
  )
}

export async function disablePinnedMessage():
Promise<void> {
  await setDoc(
    messageRef,
    {
      active: false,
      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    },
  )
}
