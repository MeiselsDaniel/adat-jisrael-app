import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  setDoc,
  writeBatch,
} from 'firebase/firestore'
import type {
  DocumentData,
  QueryDocumentSnapshot,
  Unsubscribe,
} from 'firebase/firestore'
import { db } from '../firebase/config'

export type KiddushStatus =
  | 'pending'
  | 'approved'
  | 'blocked'

export type KiddushDedicationType =
  | 'occasion'
  | 'memory'
  | 'celebration'
  | 'custom'

export type KiddushBooking = {
  id: string
  date: string
  status: KiddushStatus

  sponsor?: string
  dedication?: string
  dedicationType?: KiddushDedicationType

  /*
   * Bara för administration.
   * Ska inte visas offentligt.
   */
  comment?: string

  requestedBy?: string
  requestedByName?: string

  approvedBy?: string
  approvedAt?: unknown

  createdAt?: unknown
  updatedAt?: unknown
}

export type CreateKiddushRequestInput = {
  date: string
  sponsor: string
  dedication?: string
  dedicationType?: KiddushDedicationType
  comment?: string
  requestedBy: string
  requestedByName?: string
}

export type UpdateApprovedKiddushInput = {
  date: string
  sponsor: string
  dedication?: string
  comment?: string
}

/*
 * Datumet är dokumentets id:
 *
 * kiddush/2026-09-12
 *
 * Finns inget dokument är datumet ledigt och
 * Adat Jisrael bjuder på Kiddush.
 */
export async function createKiddushRequest({
  date,
  sponsor,
  dedication,
  dedicationType,
  comment,
  requestedBy,
  requestedByName,
}: CreateKiddushRequestInput): Promise<void> {
  const reference = doc(
    db,
    'kiddush',
    date,
  )

  const existing =
    await getDoc(reference)

  if (existing.exists()) {
    throw new Error(
      'Det finns redan en Kiddushbokning eller förfrågan för detta datum.',
    )
  }

  await setDoc(
    reference,
    removeUndefinedValues({
      date,
      status: 'approved',
      sponsor: sponsor.trim(),
      dedication:
        dedication?.trim() || undefined,
      dedicationType:
        dedication?.trim()
          ? dedicationType
          : undefined,
      comment:
        comment?.trim() || undefined,
      requestedBy,
      requestedByName:
        requestedByName?.trim() ||
        undefined,
      approvedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
  )
}

export function subscribeToKiddushDate(
  date: string,
  callback: (
    booking: KiddushBooking | null,
  ) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    doc(db, 'kiddush', date),
    (snapshot) => {
      callback(
        snapshot.exists()
          ? mapKiddushDocument(
              snapshot.id,
              snapshot.data(),
            )
          : null,
      )
    },
    (error) => {
      console.error(
        'Kunde inte läsa Kiddush:',
        error,
      )

      onError?.(error)
    },
  )
}

export function subscribeToAllKiddush(
  callback: (
    bookings: KiddushBooking[],
  ) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const approvedQuery = query(
    collection(db, 'kiddush'),
    where('status', '==', 'approved'),
  )

  return onSnapshot(
    approvedQuery,
    (snapshot) => {
      const bookings =
        snapshot.docs
          .map((document) =>
            mapKiddushSnapshot(document),
          )
          .sort((first, second) =>
            first.date.localeCompare(
              second.date,
            ),
          )

      callback(bookings)
    },
    (error) => {
      console.error(
        'Kunde inte läsa Kiddushbokningar:',
        error,
      )

      onError?.(error)
    },
  )
}

export async function approveKiddush(
  date: string,
  approvedBy: string,
): Promise<void> {
  await setDoc(
    doc(db, 'kiddush', date),
    {
      status: 'approved',
      approvedBy,
      approvedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    },
  )
}

export async function updateApprovedKiddush({
  date,
  sponsor,
  dedication,
  comment,
}: UpdateApprovedKiddushInput): Promise<void> {
  await setDoc(
    doc(db, 'kiddush', date),
    removeUndefinedValues({
      sponsor: sponsor.trim(),
      dedication:
        dedication?.trim() || null,
      comment:
        comment?.trim() || null,
      updatedAt: serverTimestamp(),
    }),
    {
      merge: true,
    },
  )
}

/*
 * Avslag tar bort förfrågan helt.
 * Då blir datumet åter ledigt.
 */
export async function rejectKiddush(
  date: string,
): Promise<void> {
  await deleteDoc(
    doc(db, 'kiddush', date),
  )
}

/*
 * Admin kan markera en dag där ingen Kiddush
 * ska finnas, exempelvis Yom Kippur.
 */
export async function blockKiddushDate(
  date: string,
): Promise<void> {
  await setDoc(
    doc(db, 'kiddush', date),
    {
      date,
      status: 'blocked',
      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    },
  )
}

export async function unblockKiddushDate(
  date: string,
): Promise<void> {
  await deleteDoc(
    doc(db, 'kiddush', date),
  )
}

/*
 * Flyttar hela bokningen till ett nytt datum.
 *
 * Skrivning och borttagning görs i samma batch,
 * så vi får aldrig ett halvflyttat Kiddush.
 */
export async function moveKiddush(
  fromDate: string,
  toDate: string,
): Promise<void> {
  if (fromDate === toDate) {
    return
  }

  const fromReference =
    doc(db, 'kiddush', fromDate)

  const toReference =
    doc(db, 'kiddush', toDate)

  const [
    fromSnapshot,
    toSnapshot,
  ] = await Promise.all([
    getDoc(fromReference),
    getDoc(toReference),
  ])

  if (!fromSnapshot.exists()) {
    throw new Error(
      'Kiddushbokningen som ska flyttas finns inte.',
    )
  }

  if (toSnapshot.exists()) {
    throw new Error(
      'Det nya datumet är redan bokat eller blockerat.',
    )
  }

  const existing =
    fromSnapshot.data()

  const batch = writeBatch(db)

  batch.set(
    toReference,
    {
      ...existing,
      date: toDate,
      movedFrom: fromDate,
      updatedAt: serverTimestamp(),
    },
  )

  batch.delete(fromReference)

  await batch.commit()
}

export async function deleteKiddush(
  date: string,
): Promise<void> {
  await deleteDoc(
    doc(db, 'kiddush', date),
  )
}

function mapKiddushSnapshot(
  snapshot: QueryDocumentSnapshot<DocumentData>,
): KiddushBooking {
  return mapKiddushDocument(
    snapshot.id,
    snapshot.data(),
  )
}

function mapKiddushDocument(
  id: string,
  data: DocumentData,
): KiddushBooking {
  return {
    id,
    ...(data as Omit<
      KiddushBooking,
      'id'
    >),
  }
}

function removeUndefinedValues(
  value: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(value).filter(
      ([, fieldValue]) =>
        fieldValue !== undefined,
    ),
  )
}
