import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '../firebase/config'

export type NewsRead = {
  id: string
  newsId: string
  userId: string
  readAt?: unknown
  openedAt?: unknown
}

export async function markNewsAsRead(
  newsId: string,
  userId: string,
  opened = false,
): Promise<void> {
  const id =
    `${newsId}__${userId}`

  await setDoc(
    doc(
      db,
      'newsReads',
      id,
    ),
    {
      id,
      newsId,
      userId,
      readAt:
        serverTimestamp(),
      ...(opened
        ? {
            openedAt:
              serverTimestamp(),
          }
        : {}),
    },
    {
      merge: true,
    },
  )
}

export function subscribeToUserNewsReads(
  userId: string,
  callback: (
    reads: NewsRead[],
  ) => void,
  onError?: (
    error: Error,
  ) => void,
): Unsubscribe {
  const readsQuery =
    query(
      collection(
        db,
        'newsReads',
      ),
      where(
        'userId',
        '==',
        userId,
      ),
    )

  return onSnapshot(
    readsQuery,
    (snapshot) => {
      callback(
        snapshot.docs.map(
          (document) => ({
            id: document.id,
            ...(document.data() as Omit<
              NewsRead,
              'id'
            >),
          }),
        ),
      )
    },
    (error) => {
      console.error(
        'Kunde inte läsa nyhetsstatus:',
        error,
      )

      onError?.(error)
    },
  )
}

export function subscribeToOpenedNewsReads(
  callback: (
    reads: NewsRead[],
  ) => void,
  onError?: (
    error: Error,
  ) => void,
): Unsubscribe {
  return onSnapshot(
    collection(
      db,
      'newsReads',
    ),
    (snapshot) => {
      callback(
        snapshot.docs
          .map(
            (document) => ({
              id: document.id,
              ...(document.data() as Omit<
                NewsRead,
                'id'
              >),
            }),
          )
          .filter(
            (read) =>
              Boolean(read.openedAt),
          ),
      )
    },
    (error) => {
      console.error(
        'Kunde inte läsa nyhetsstatistik:',
        error,
      )

      onError?.(error)
    },
  )
}
