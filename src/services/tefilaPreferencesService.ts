import {
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import type {
  Unsubscribe,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { generateStandardTfilot } from '../utils/generateStandardTfilot'

export type TefilaDayKey =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'

export type TefilaAutoDays =
  Record<TefilaDayKey, boolean>

export type TefilaPreferences = {
  userId: string

  autoDays: TefilaAutoDays
  autoKabbalatShabbat: boolean

  notifyWhenNine: boolean
  notifyExtraMinyan: boolean

  vacationEnabled: boolean
  vacationFrom: string | null
  vacationTo: string | null

  updatedAt?: unknown
}

export const defaultTefilaPreferences = (
  userId: string,
): TefilaPreferences => ({
  userId,

  autoDays: {
    sunday: false,
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
  },

  autoKabbalatShabbat: false,

  notifyWhenNine: false,
  notifyExtraMinyan: false,

  vacationEnabled: false,
  vacationFrom: null,
  vacationTo: null,
})

export function subscribeToTefilaPreferences(
  userId: string,
  callback: (
    preferences: TefilaPreferences,
  ) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    doc(
      db,
      'tefilaPreferences',
      userId,
    ),
    (snapshot) => {
      if (!snapshot.exists()) {
        callback(
          defaultTefilaPreferences(
            userId,
          ),
        )
        return
      }

      const data =
        snapshot.data() as Partial<
          TefilaPreferences
        >

      const defaults =
        defaultTefilaPreferences(
          userId,
        )

      callback({
        ...defaults,
        ...data,

        userId,

        autoDays: {
          ...defaults.autoDays,
          ...(data.autoDays ?? {}),
        },

        autoKabbalatShabbat:
          data.autoKabbalatShabbat ??
          false,

        vacationFrom:
          data.vacationFrom ?? null,

        vacationTo:
          data.vacationTo ?? null,
      })
    },
    (error) => {
      console.error(
        'Kunde inte läsa tfila-preferenser:',
        error,
      )

      onError?.(error)
    },
  )
}

export async function saveTefilaPreferences(
  preferences: TefilaPreferences,
): Promise<void> {
  await setDoc(
    doc(
      db,
      'tefilaPreferences',
      preferences.userId,
    ),
    {
      userId:
        preferences.userId,

      autoDays:
        preferences.autoDays,

      autoKabbalatShabbat:
        preferences.autoKabbalatShabbat,

      notifyWhenNine:
        preferences.notifyWhenNine,

      notifyExtraMinyan:
        preferences.notifyExtraMinyan,

      vacationEnabled:
        preferences.vacationEnabled,

      vacationFrom:
        preferences.vacationFrom,

      vacationTo:
        preferences.vacationTo,

      updatedAt:
        serverTimestamp(),
    },
    {
      merge: true,
    },
  )
}


/*
 * Synkar automatiska anmälningar 90 dagar framåt.
 *
 * - Valda veckodagar = Shacharit
 * - Kabbalat Shabbat = egen preferens
 * - Semester tar bort ENDAST automatiska anmälningar
 * - Manuella anmälningar rörs aldrig
 */
export async function syncAutomaticTefilaRegistrations({
  userId,
  userName,
  preferences,
}: {
  userId: string
  userName: string
  preferences: TefilaPreferences
}): Promise<void> {
  if (!userId || !userName.trim()) {
    return
  }

  const standardTfilot =
    generateStandardTfilot(
      new Date(),
      90,
    )

  /*
   * Vanliga Shacharit.
   */
  for (const tefila of standardTfilot) {
    if (
      tefila.title !== 'Shacharit' ||
      !tefila.dateValue
    ) {
      continue
    }

    const dayKey =
      getPreferenceDayKey(
        tefila.dateValue,
      )

    if (!dayKey) {
      continue
    }

    const shouldAttend =
      preferences.autoDays[dayKey] &&
      !isVacationDate(
        tefila.dateValue,
        preferences,
      )

    const tefilaId =
      tefila.firestoreId ??
      String(tefila.id)

    await syncOneAutomaticRegistration({
      tefilaId,
      userId,
      userName,
      shouldAttend,
    })
  }

  /*
   * Kabbalat Shabbat.
   *
   * Samma ID-format används redan
   * på startsidan och i admin.
   */
  const fridayDates = Array.from(
    new Set(
      standardTfilot
        .filter(
          (tefila) =>
            tefila.day === 'Fredag' &&
            Boolean(tefila.dateValue),
        )
        .map(
          (tefila) =>
            tefila.dateValue as string,
        ),
    ),
  )

  for (const dateValue of fridayDates) {
    const shouldAttend =
      preferences.autoKabbalatShabbat &&
      !isVacationDate(
        dateValue,
        preferences,
      )

    await syncOneAutomaticRegistration({
      tefilaId:
        `${dateValue}-kabbalat-shabbat`,
      userId,
      userName,
      shouldAttend,
    })
  }
}

async function syncOneAutomaticRegistration({
  tefilaId,
  userId,
  userName,
  shouldAttend,
}: {
  tefilaId: string
  userId: string
  userName: string
  shouldAttend: boolean
}): Promise<void> {
  const reference = doc(
    db,
    'tfilot',
    tefilaId,
    'registrations',
    userId,
  )

  const snapshot =
    await getDoc(reference)

  if (shouldAttend) {
    /*
     * Finns redan en registrering lämnar vi den.
     * Vi skriver alltså aldrig över ett manuellt val.
     */
    if (snapshot.exists()) {
      return
    }

    await setDoc(
      reference,
      {
        id: userId,
        tefilaId,
        userId,
        userName:
          userName.trim(),

        attending: true,
        guestCount: 0,

        source: 'automatic',

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp(),
      },
    )

    return
  }

  /*
   * Dagen är inte vald eller ligger under semester.
   *
   * Radera ENDAST om appen själv
   * skapade registreringen.
   */
  if (!snapshot.exists()) {
    return
  }

  const data =
    snapshot.data() as {
      source?: string
    }

  if (data.source !== 'automatic') {
    return
  }

  await deleteDoc(reference)
}

function isVacationDate(
  dateValue: string,
  preferences: TefilaPreferences,
): boolean {
  if (
    !preferences.vacationEnabled ||
    !preferences.vacationFrom ||
    !preferences.vacationTo
  ) {
    return false
  }

  return (
    dateValue >= preferences.vacationFrom &&
    dateValue <= preferences.vacationTo
  )
}

function getPreferenceDayKey(
  dateValue: string,
): TefilaDayKey | null {
  const date = new Date(
    `${dateValue}T12:00:00`,
  )

  switch (date.getDay()) {
    case 0:
      return 'sunday'
    case 1:
      return 'monday'
    case 2:
      return 'tuesday'
    case 3:
      return 'wednesday'
    case 4:
      return 'thursday'
    case 5:
      return 'friday'
    default:
      return null
  }
}
