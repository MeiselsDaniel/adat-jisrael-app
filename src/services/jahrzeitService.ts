import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import type {
  Unsubscribe,
} from 'firebase/firestore'
import { HDate } from '@hebcal/core'
import { db } from '../firebase/config'

export type JahrzeitGender =
  | 'male'
  | 'female'

export type JahrzeitRecord = {
  id: string

  ownerId: string
  ownerName: string

  deceasedName: string
  hebrewName?: string | null
  relation?: string | null
  gender?: JahrzeitGender | null
  notes?: string | null

  hebrewDay: number
  hebrewMonth: string

  remind: boolean

  createdAt?: unknown
  updatedAt?: unknown
}

export type CreateJahrzeitInput = {
  ownerId: string
  ownerName: string

  deceasedName: string
  hebrewName?: string
  relation?: string
  gender?: JahrzeitGender
  notes?: string

  hebrewDay: number
  hebrewMonth: string

  remind: boolean
}

export type UpdateJahrzeitInput = {
  deceasedName: string
  hebrewName?: string
  relation?: string
  gender?: JahrzeitGender
  notes?: string

  hebrewDay: number
  hebrewMonth: string

  remind: boolean
}

export async function createJahrzeit(
  input: CreateJahrzeitInput,
): Promise<void> {
  await addDoc(
    collection(db, 'jahrzeits'),
    {
      ownerId: input.ownerId,
      ownerName: input.ownerName,

      deceasedName:
        input.deceasedName.trim(),

      hebrewName:
        normalizeOptional(
          input.hebrewName,
        ),

      relation:
        normalizeOptional(
          input.relation,
        ),

      gender:
        input.gender ?? null,

      notes:
        normalizeOptional(
          input.notes,
        ),

      hebrewDay:
        input.hebrewDay,

      hebrewMonth:
        input.hebrewMonth,

      remind:
        input.remind,

      createdAt:
        serverTimestamp(),

      updatedAt:
        serverTimestamp(),
    },
  )
}

export async function updateJahrzeit(
  jahrzeitId: string,
  input: UpdateJahrzeitInput,
): Promise<void> {
  await updateDoc(
    doc(
      db,
      'jahrzeits',
      jahrzeitId,
    ),
    {
      deceasedName:
        input.deceasedName.trim(),

      hebrewName:
        normalizeOptional(
          input.hebrewName,
        ),

      relation:
        normalizeOptional(
          input.relation,
        ),

      gender:
        input.gender ?? null,

      notes:
        normalizeOptional(
          input.notes,
        ),

      hebrewDay:
        input.hebrewDay,

      hebrewMonth:
        input.hebrewMonth,

      remind:
        input.remind,

      updatedAt:
        serverTimestamp(),
    },
  )
}

export async function deleteJahrzeit(
  jahrzeitId: string,
): Promise<void> {
  await deleteDoc(
    doc(
      db,
      'jahrzeits',
      jahrzeitId,
    ),
  )
}

export function subscribeToAllJahrzeits(
  callback: (
    jahrzeits: JahrzeitRecord[],
  ) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    collection(db, 'jahrzeits'),
    (snapshot) => {
      callback(
        snapshot.docs.map(
          (document) => ({
            id: document.id,
            ...(document.data() as Omit<
              JahrzeitRecord,
              'id'
            >),
          }),
        ),
      )
    },
    (error) => {
      console.error(
        'Kunde inte läsa församlingens Jahrzeits:',
        error,
      )

      onError?.(error)
    },
  )
}

export function subscribeToUserJahrzeits(
  userId: string,
  callback: (
    jahrzeits: JahrzeitRecord[],
  ) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const jahrzeitQuery = query(
    collection(db, 'jahrzeits'),
    where(
      'ownerId',
      '==',
      userId,
    ),
  )

  return onSnapshot(
    jahrzeitQuery,
    (snapshot) => {
      callback(
        snapshot.docs.map(
          (document) => ({
            id: document.id,
            ...(document.data() as Omit<
              JahrzeitRecord,
              'id'
            >),
          }),
        ),
      )
    },
    (error) => {
      console.error(
        'Kunde inte läsa Jahrzeits:',
        error,
      )

      onError?.(error)
    },
  )
}

export function getNextJahrzeitDate(
  jahrzeit: Pick<
    JahrzeitRecord,
    'hebrewDay' | 'hebrewMonth'
  >,
  fromDate = new Date(),
): Date | null {
  try {
    const todayHebrew =
      new HDate(fromDate)

    const currentHebrewYear =
      todayHebrew.getFullYear()

    const thisYear =
      getGregorianJahrzeitDate(
        jahrzeit,
        currentHebrewYear,
      )

    if (
      thisYear &&
      startOfDay(thisYear) >=
        startOfDay(fromDate)
    ) {
      return thisYear
    }

    return getGregorianJahrzeitDate(
      jahrzeit,
      currentHebrewYear + 1,
    )
  } catch (error) {
    console.error(
      'Kunde inte räkna ut Jahrzeit:',
      error,
    )

    return null
  }
}

export function getJahrzeitDatesBetween(
  jahrzeit: Pick<
    JahrzeitRecord,
    'hebrewDay' | 'hebrewMonth'
  >,
  start: Date,
  end: Date,
): Date[] {
  const result: Date[] = []

  try {
    const startHebrewYear =
      new HDate(start).getFullYear()

    const endHebrewYear =
      new HDate(end).getFullYear()

    for (
      let year =
        startHebrewYear - 1;
      year <=
        endHebrewYear + 1;
      year += 1
    ) {
      const date =
        getGregorianJahrzeitDate(
          jahrzeit,
          year,
        )

      if (
        date &&
        startOfDay(date) >=
          startOfDay(start) &&
        startOfDay(date) <=
          startOfDay(end)
      ) {
        result.push(date)
      }
    }
  } catch (error) {
    console.error(
      'Kunde inte skapa Jahrzeit-intervall:',
      error,
    )
  }

  return result
}

function getGregorianJahrzeitDate(
  jahrzeit: Pick<
    JahrzeitRecord,
    'hebrewDay' | 'hebrewMonth'
  >,
  hebrewYear: number,
): Date | null {
  try {
    const hebrewDate =
      new HDate(
        jahrzeit.hebrewDay,
        jahrzeit.hebrewMonth,
        hebrewYear,
      )

    return hebrewDate.greg()
  } catch {
    return null
  }
}

function startOfDay(
  date: Date,
): Date {
  const result = new Date(date)

  result.setHours(
    0,
    0,
    0,
    0,
  )

  return result
}

function normalizeOptional(
  value?: string,
): string | null {
  const normalized =
    value?.trim()

  return normalized || null
}
