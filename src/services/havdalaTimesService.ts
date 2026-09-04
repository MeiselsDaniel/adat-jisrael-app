import {
  doc,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '../firebase/config'

export type HavdalaTimeEntry = {
  date: string
  time: string
}

/*
 * Församlingens ordinarie Havdala-tider.
 *
 * Ett dokument per datum:
 *
 * havdalaTimes/2026-09-12
 * {
 *   date: '2026-09-12',
 *   time: '20:04'
 * }
 *
 * Dessa tider ligger mellan dagsinställningarnas manuella
 * override och HebCal:
 *
 * customHavdalaTime → havdalaTimes → HebCal
 */
export function subscribeToHavdalaTime(
  date: string,
  callback: (time: string | null) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    doc(db, 'havdalaTimes', date),
    (snapshot) => {
      if (!snapshot.exists()) {
        callback(null)
        return
      }

      const data =
        snapshot.data() as Partial<HavdalaTimeEntry>

      const time =
        typeof data.time === 'string'
          ? data.time.trim()
          : ''

      callback(time || null)
    },
    (error) => {
      console.error(
        'Kunde inte läsa Havdala-tid:',
        error,
      )

      callback(null)
      onError?.(error)
    },
  )
}
