import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '../firebase/config'

export type Fundraiser = {
  title: string
  description: string
  goalAmount: number
  currentAmount: number
  active: boolean
  updatedAt?: unknown
}

const fundraiserRef = doc(
  db,
  'appSettings',
  'fundraiser',
)

export function subscribeToFundraiser(
  callback: (
    fundraiser: Fundraiser | null,
  ) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    fundraiserRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        callback(null)
        return
      }

      callback(
        snapshot.data() as Fundraiser,
      )
    },
    (error) => {
      console.error(
        'Kunde inte läsa insamling:',
        error,
      )

      onError?.(error)
    },
  )
}

export async function saveFundraiser(
  fundraiser: Omit<
    Fundraiser,
    'updatedAt'
  >,
): Promise<void> {
  await setDoc(
    fundraiserRef,
    {
      ...fundraiser,
      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    },
  )
}

export async function disableFundraiser():
Promise<void> {
  await setDoc(
    fundraiserRef,
    {
      active: false,
      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    },
  )
}
