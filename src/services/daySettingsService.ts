import {
  deleteField,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import type {
  Unsubscribe,
} from 'firebase/firestore'
import { db } from '../firebase/config'

export type DayType =
  | 'regular'
  | 'shabbat'
  | 'holiday'
  | 'shabbatHoliday'

export type DaySettings = {
  id: string
  date: string
  dayType: DayType

  holidayName?: string
  sermon?: string
  comment?: string
  moreInformation?: string
  customCandleLightingTime?: string
  customHavdalaTime?: string

  showCandleLighting?: boolean
  showHavdala?: boolean
  showMincha?: boolean

  createdAt?: unknown
  updatedAt?: unknown
  updatedBy?: string
}

export type SaveDaySettingsInput = {
  date: string
  dayType: DayType

  holidayName?: string
  sermon?: string
  comment?: string
  moreInformation?: string

  customCandleLightingTime?: string
  customHavdalaTime?: string

  showCandleLighting: boolean
  showHavdala: boolean
  showMincha: boolean

  updatedBy: string
}

/*
 * Inställningarna sparas med datumet som dokument-ID:
 *
 * daySettings/2026-09-11
 *
 * HebCal-data sparas inte här. Dokumentet innehåller
 * bara Adat Jisraels egna ändringar för datumet.
 */
export async function saveDaySettings({
  date,
  dayType,
  holidayName,
  sermon,
  comment,
  moreInformation,
  customCandleLightingTime,
  customHavdalaTime,
  showCandleLighting,
  showHavdala,
  showMincha,
  updatedBy,
}: SaveDaySettingsInput): Promise<void> {
  const reference = doc(
    db,
    'daySettings',
    date,
  )

  await setDoc(
    reference,
    {
      id: date,
      date,
      dayType,

      holidayName:
        normalizeOptionalText(holidayName),

      sermon:
        normalizeOptionalText(sermon),

      comment:
        normalizeOptionalText(comment),

      moreInformation:
        normalizeOptionalText(
          moreInformation,
        ),

      customCandleLightingTime:
        normalizeOptionalTime(
          customCandleLightingTime,
        ),

      customHavdalaTime:
        normalizeOptionalTime(
          customHavdalaTime,
        ),

      showCandleLighting,
      showHavdala,
      showMincha,

      updatedBy,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    {
      merge: true,
    },
  )
}

/*
 * Lyssnar i realtid på inställningarna för en dag.
 * Om dokumentet inte finns används HebCal och
 * standardschemat utan några manuella undantag.
 */
export function subscribeToDaySettings(
  date: string,
  callback: (
    settings: DaySettings | null,
  ) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    doc(db, 'daySettings', date),
    (snapshot) => {
      if (!snapshot.exists()) {
        callback(null)
        return
      }

      callback({
        id: snapshot.id,
        ...(snapshot.data() as Omit<
          DaySettings,
          'id'
        >),
      })
    },
    (error) => {
      console.error(
        'Kunde inte läsa dagsinställningarna:',
        error,
      )

      onError?.(error)
    },
  )
}

/*
 * Tar bort en egen ljuständningstid.
 * Därefter används HebCal-tiden automatiskt igen.
 */
export async function resetCandleLightingTime(
  date: string,
  updatedBy: string,
): Promise<void> {
  await setDoc(
    doc(db, 'daySettings', date),
    {
      customCandleLightingTime:
        deleteField(),
      updatedBy,
      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    },
  )
}

/*
 * Tar bort en egen Havdala-tid.
 * Därefter används HebCal-tiden automatiskt igen.
 */
export async function resetHavdalaTime(
  date: string,
  updatedBy: string,
): Promise<void> {
  await setDoc(
    doc(db, 'daySettings', date),
    {
      customHavdalaTime:
        deleteField(),
      updatedBy,
      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    },
  )
}

export function getDisplayedCandleLightingTime(
  hebcalTime: string | null,
  settings: DaySettings | null,
): string | null {
  return (
    settings?.customCandleLightingTime ??
    hebcalTime
  )
}

export function getDisplayedHavdalaTime(
  hebcalTime: string | null,
  settings: DaySettings | null,
): string | null {
  return (
    settings?.customHavdalaTime ??
    hebcalTime
  )
}

function normalizeOptionalText(
  value?: string,
): string | null {
  const normalized = value?.trim()

  return normalized || null
}

function normalizeOptionalTime(
  value?: string,
): string | null {
  const normalized = value
    ?.trim()
    .replace('.', ':')
    .slice(0, 5)

  if (!normalized) {
    return null
  }

  if (
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(
      normalized,
    )
  ) {
    throw new Error(
      'Tiden måste anges i formatet HH:MM.',
    )
  }

  return normalized
}
