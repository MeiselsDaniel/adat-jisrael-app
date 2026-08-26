import type { StoredAppEvent } from './eventService'

function storageKey(userId: string): string {
  return `adat-jisrael-events-seen-${userId}`
}

export function getSeenEventIds(
  userId: string,
): string[] {
  try {
    const stored =
      localStorage.getItem(storageKey(userId))

    if (!stored) {
      return []
    }

    const parsed = JSON.parse(stored)

    return Array.isArray(parsed)
      ? parsed.filter(
          (value): value is string =>
            typeof value === 'string',
        )
      : []
  } catch {
    return []
  }
}

export function markEventsAsSeen(
  userId: string,
  events: StoredAppEvent[],
): void {
  const current =
    new Set(getSeenEventIds(userId))

  for (const event of events) {
    current.add(event.id)
  }

  localStorage.setItem(
    storageKey(userId),
    JSON.stringify(Array.from(current)),
  )

  window.dispatchEvent(
    new CustomEvent('event-reads-changed'),
  )
}

export function getUnreadEvents(
  userId: string,
  events: StoredAppEvent[],
): StoredAppEvent[] {
  const seen =
    new Set(getSeenEventIds(userId))

  return events.filter(
    (event) =>
      event.status === 'published' &&
      event.showInCalendar !== false &&
      event.type !== 'tefila' &&
      event.type !== 'jahrzeit' &&
      event.type !== 'kiddush' &&
      !seen.has(event.id),
  )
}
