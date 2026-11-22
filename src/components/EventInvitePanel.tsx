import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../hooks/useAuth'
import type { FirebaseUserProfile } from '../firebase/users'
import type { StoredAppEvent } from '../services/eventService'
import type { StoredEventRegistration } from '../services/eventRegistrationService'
import {
  createEventInvitation,
  type EventInvitation,
} from '../services/eventInvitationService'

type Props = {
  event: StoredAppEvent
  registrations: StoredEventRegistration[]
}

export default function EventInvitePanel({ event, registrations }: Props) {
  const { firebaseUser, profile } = useAuth()
  const [open, setOpen] = useState(false)
  const [users, setUsers] = useState<FirebaseUserProfile[]>([])
  const [invitations, setInvitations] = useState<EventInvitation[]>([])
  const [usersLoaded, setUsersLoaded] = useState(false)
  const [invitationsLoaded, setInvitationsLoaded] = useState(false)
  const [search, setSearch] = useState('')
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [sendingAll, setSendingAll] = useState(false)
  const [sentIds, setSentIds] = useState<string[]>([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!open || profile?.role !== 'admin') return

    setUsersLoaded(false)
    setInvitationsLoaded(false)
    setError('')

    const unsubscribeUsers = onSnapshot(
      collection(db, 'users'),
      snapshot => {
        setUsers(snapshot.docs.map(item => item.data() as FirebaseUserProfile))
        setUsersLoaded(true)
      },
      () => setError('Kunde inte läsa medlemslistan.'),
    )

    const unsubscribeInvitations = onSnapshot(
      query(
        collection(db, 'eventInvitations'),
        where('eventId', '==', event.id),
      ),
      snapshot => {
        setInvitations(
          snapshot.docs.map(item => ({
            ...item.data() as EventInvitation,
            id: item.id,
          })),
        )
        setInvitationsLoaded(true)
      },
      () => setError('Kunde inte läsa tidigare inbjudningar.'),
    )

    return () => {
      unsubscribeUsers()
      unsubscribeInvitations()
    }
  }, [open, profile?.role, event.id])

  const registeredIds = useMemo(
    () => new Set(registrations.map(item => item.userId)),
    [registrations],
  )

  const invitedIds = useMemo(
    () => new Set([
      ...invitations.map(item => item.userId),
      ...sentIds,
    ]),
    [invitations, sentIds],
  )

  const eligible = useMemo(
    () => users
      .filter(user =>
        user.status === 'approved' &&
        !registeredIds.has(user.uid)
      )
      .sort((a, b) =>
        (a.name ?? '').localeCompare(b.name ?? '', 'sv')
      ),
    [users, registeredIds],
  )

  const available = useMemo(
    () => eligible.filter(user =>
      `${user.name ?? ''} ${user.email ?? ''}`
        .toLocaleLowerCase('sv')
        .includes(search.toLocaleLowerCase('sv'))
    ),
    [eligible, search],
  )

  const notInvited = eligible.filter(user => !invitedIds.has(user.uid))
  const ready = usersLoaded && invitationsLoaded

  if (profile?.role !== 'admin') return null

  async function invite(user: FirebaseUserProfile) {
    if (!firebaseUser || !ready || invitedIds.has(user.uid)) return

    setSendingId(user.uid)
    setError('')
    setMessage('')

    try {
      await createEventInvitation({
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.startDate,
        eventTime: event.startTime,
        userId: user.uid,
        userName: user.name ?? '',
        invitedBy: firebaseUser.uid,
      })
      setSentIds(current => [...current, user.uid])
      setMessage(`Inbjudan skickad till ${user.name ?? 'medlemmen'}.`)
    } catch (caughtError) {
      console.error(caughtError)
      setError('Inbjudan kunde inte skickas.')
    } finally {
      setSendingId(null)
    }
  }

  async function inviteAll() {
    if (!firebaseUser || !ready || sendingAll || sendingId) return

    const recipients = [...notInvited]

    if (recipients.length === 0) return

    const confirmed = window.confirm(
      `Vill du bjuda in ${recipients.length} medlemmar till "${event.title}"?\n\n` +
      'Redan anmälda och tidigare inbjudna hoppas över. Ingen pushnotis skickas.'
    )

    if (!confirmed) return

    setSendingAll(true)
    setError('')
    setMessage('')

    let success = 0
    let failed = 0

    for (const user of recipients) {
      try {
        await createEventInvitation({
          eventId: event.id,
          eventTitle: event.title,
          eventDate: event.startDate,
          eventTime: event.startTime,
          userId: user.uid,
          userName: user.name ?? '',
          invitedBy: firebaseUser.uid,
        })
        setSentIds(current => [...current, user.uid])
        success++
      } catch (caughtError) {
        console.error('Kunde inte bjuda in:', user.uid, caughtError)
        failed++
      }
    }

    setSendingAll(false)
    setMessage(`${success} inbjudningar skickades.`)

    if (failed > 0) {
      setError(`${failed} inbjudningar kunde inte skickas.`)
    }
  }

  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3">
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        className="w-full rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-[#183b70]"
      >
        {open ? 'Stäng medlemsinbjudningar' : 'Bjud in medlemmar'}
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          <input
            type="search"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Sök medlem..."
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />

          {error && <p className="text-sm text-red-700">{error}</p>}
          {message && <p className="text-sm text-green-700">{message}</p>}

          {!ready ? (
            <p className="text-sm text-slate-500">
              Hämtar medlemmar och inbjudningar...
            </p>
          ) : (
            <>
              <button
                type="button"
                disabled={sendingAll || sendingId !== null || notInvited.length === 0}
                onClick={() => void inviteAll()}
                className="w-full rounded-xl bg-[#183b70] px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                {sendingAll
                  ? 'Skickar inbjudningar...'
                  : `Bjud in alla (${notInvited.length})`}
              </button>

              <p className="text-xs text-slate-500">
                {eligible.length} möjliga mottagare.
                Redan anmälda och tidigare inbjudna hoppas över.
              </p>

              <div className="max-h-80 space-y-2 overflow-y-auto">
                {available.map(user => {
                  const sent = invitedIds.has(user.uid)

                  return (
                    <div
                      key={user.uid}
                      className="flex items-center justify-between gap-2 border-b border-slate-100 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{user.name}</p>
                        <p className="truncate text-xs text-slate-500">{user.email}</p>
                      </div>

                      <button
                        type="button"
                        disabled={sent || sendingAll || sendingId !== null}
                        onClick={() => void invite(user)}
                        className="shrink-0 rounded-lg bg-[#183b70] px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                      >
                        {sent
                          ? 'Inbjuden'
                          : sendingId === user.uid
                            ? 'Skickar...'
                            : 'Bjud in'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
