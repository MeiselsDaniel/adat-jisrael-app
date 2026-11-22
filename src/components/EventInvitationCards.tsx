import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import {
  respondToEventInvitation,
  subscribeToUserEventInvitations,
  type EventInvitation,
} from '../services/eventInvitationService'
import { getEvent, type StoredAppEvent } from '../services/eventService'
import RichEventCard from './RichEventCard'

export default function EventInvitationCards() {
  const { firebaseUser } = useAuth()
  const [invitations, setInvitations] = useState<EventInvitation[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [event, setEvent] = useState<StoredAppEvent | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!firebaseUser) {
      setInvitations([])
      return
    }
    return subscribeToUserEventInvitations(
      firebaseUser.uid,
      setInvitations,
      () => setError('Kunde inte läsa eventinbjudningarna.'),
    )
  }, [firebaseUser])

  const today = new Date()
  const todayValue = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-')

  const pending = invitations.filter(item =>
    item.status === 'pending' && item.eventDate >= todayValue
  )

  async function openInvitation(item: EventInvitation) {
    setBusy(true)
    setError('')
    try {
      const found = await getEvent(item.eventId)
      if (!found) {
        setError('Evenemanget finns inte längre.')
        return
      }
      setEvent(found)
      setSelected(item.id)
    } catch (caughtError) {
      console.error(caughtError)
      setError('Kunde inte öppna evenemanget.')
    } finally {
      setBusy(false)
    }
  }

  async function decline(item: EventInvitation) {
    setBusy(true)
    setError('')
    try {
      await respondToEventInvitation(item.id, 'declined')
    } catch (caughtError) {
      console.error(caughtError)
      setError('Kunde inte spara svaret.')
    } finally {
      setBusy(false)
    }
  }

  if (pending.length === 0) return null

  return (
    <section className="space-y-3">
      {error && <p className="text-sm text-red-700">{error}</p>}
      {pending.map(item => (
        <div key={item.id} className="rounded-3xl bg-sky-50 p-5 ring-1 ring-sky-200">
          <p className="text-xs font-black uppercase tracking-wide text-[#183b70]">
            Du är inbjuden
          </p>
          <h2 className="mt-2 text-lg font-bold text-[#183b70]">
            {item.eventTitle}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {item.eventDate} · {item.eventTime}
          </p>
          <p className="mt-3 text-sm text-slate-600">
            Du har fått en personlig inbjudan till detta evenemang.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void openInvitation(item)}
              className="rounded-xl bg-emerald-600 px-3 py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              Anmäl mig
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void decline(item)}
              className="rounded-xl bg-white px-3 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200 disabled:opacity-50"
            >
              Kan inte
            </button>
          </div>
          {selected === item.id && event && (
            <div className="mt-4">
              <RichEventCard event={event} autoOpenRegistration />
            </div>
          )}
        </div>
      ))}
    </section>
  )
}
