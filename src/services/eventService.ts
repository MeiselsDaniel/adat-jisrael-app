import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import type {
  DocumentData,
  QueryDocumentSnapshot,
  Unsubscribe,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import type {
  AppEvent,
  EventStatus,
} from '../types'

export type StoredAppEvent = Omit<
  AppEvent,
  'createdAt'
> & {
  createdAt?: unknown
  updatedAt?: unknown
}

export type SaveEventInput = Omit<
  AppEvent,
  'createdAt'
> & {
  createdAt?: string
}

/**
 * Skapar eller uppdaterar en händelse.
 *
 * Samma funktion används både när admin skapar
 * en ny händelse och redigerar en befintlig.
 */
export async function saveEvent(
  event: SaveEventInput,
): Promise<void> {
  const eventReference = doc(
    db,
    'events',
    event.id,
  )

  const existingSnapshot =
    await getDoc(eventReference)

  const eventData = removeUndefinedValues({
    ...event,

    createdAt: existingSnapshot.exists()
      ? existingSnapshot.data().createdAt
      : serverTimestamp(),

    updatedAt: serverTimestamp(),
  })

  await setDoc(
    eventReference,
    eventData,
    {
      merge: true,
    },
  )
}

/**
 * Hämtar en enskild händelse.
 */
export async function getEvent(
  eventId: string,
): Promise<StoredAppEvent | null> {
  const snapshot = await getDoc(
    doc(db, 'events', eventId),
  )

  if (!snapshot.exists()) {
    return null
  }

  return mapEvent(snapshot)
}

/**
 * Hämtar kommande publicerade och planerade
 * händelser inom ett datumintervall.
 */
export async function getEventsBetween(
  startDate: string,
  endDate: string,
): Promise<StoredAppEvent[]> {
  const eventsQuery = query(
    collection(db, 'events'),
    where('startDate', '>=', startDate),
    where('startDate', '<=', endDate),
  )

  const snapshot = await getDocs(eventsQuery)

  return snapshot.docs
    .map(mapEvent)
    .sort(compareStoredEvents)
}

/**
 * Lyssnar på händelser i realtid.
 *
 * Startsidan och kalendern kan senare använda
 * samma lyssnare.
 */
export function subscribeToEventsBetween(
  startDate: string,
  endDate: string,
  callback: (
    events: StoredAppEvent[],
  ) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const eventsQuery = query(
    collection(db, 'events'),
    where('startDate', '>=', startDate),
    where('startDate', '<=', endDate),
  )

  return onSnapshot(
    eventsQuery,
    (snapshot) => {
      callback(
        snapshot.docs
          .map(mapEvent)
          .sort(compareStoredEvents),
      )
    },
    (error) => {
      console.error(
        'Kunde inte läsa händelser:',
        error,
      )

      onError?.(error)
    },
  )
}

/**
 * Hämtar samtliga händelser till adminpanelen,
 * inklusive utkast och inställda händelser.
 */
export function subscribeToAllEvents(
  callback: (
    events: StoredAppEvent[],
  ) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const eventsQuery = query(
    collection(db, 'events'),
    orderBy('startDate', 'asc'),
  )

  return onSnapshot(
    eventsQuery,
    (snapshot) => {
      const events = snapshot.docs
        .map(mapEvent)
        .sort((firstEvent, secondEvent) => {
          const firstDateTime =
            `${firstEvent.startDate}-${firstEvent.startTime}`

          const secondDateTime =
            `${secondEvent.startDate}-${secondEvent.startTime}`

          return firstDateTime.localeCompare(
            secondDateTime,
          )
        })

      callback(events)
    },
    (error) => {
      console.error(
        'Kunde inte läsa adminhändelser:',
        error,
      )

      onError?.(error)
    },
  )
}

/**
 * Ändrar en händelses status.
 *
 * Används exempelvis för att publicera,
 * ställa in eller återaktivera en händelse.
 */
export async function setEventStatus(
  eventId: string,
  status: EventStatus,
): Promise<void> {
  await updateDoc(
    doc(db, 'events', eventId),
    {
      status,
      updatedAt: serverTimestamp(),
    },
  )
}

export async function cancelEvent(
  eventId: string,
): Promise<void> {
  await setEventStatus(eventId, 'cancelled')
}

export async function publishEvent(
  eventId: string,
): Promise<void> {
  await setEventStatus(eventId, 'published')
}

export async function saveEventAsDraft(
  eventId: string,
): Promise<void> {
  await setEventStatus(eventId, 'draft')
}

/**
 * Tar bort en händelse permanent.
 *
 * Vi använder normalt "cancelled" i stället,
 * men funktionen finns för felaktigt skapade poster.
 */
export async function deleteEvent(
  eventId: string,
): Promise<void> {
  await deleteDoc(doc(db, 'events', eventId))
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

function compareStoredEvents(
  first: StoredAppEvent,
  second: StoredAppEvent,
): number {
  const dateComparison =
    first.startDate.localeCompare(
      second.startDate,
    )

  if (dateComparison !== 0) {
    return dateComparison
  }

  return first.startTime
    .replace('.', ':')
    .localeCompare(
      second.startTime.replace('.', ':'),
    )
}

function mapEvent(
  snapshot: QueryDocumentSnapshot<DocumentData>,
): StoredAppEvent {
  return {
    id: snapshot.id,
    ...(snapshot.data() as Omit<
      StoredAppEvent,
      'id'
    >),
  }
}