import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  Check,
  ChevronDown,
  ChevronUp,
  LoaderCircle,
  Search,
  Send,
  UserPlus,
} from 'lucide-react'
import {
  collection,
  onSnapshot,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import {
  subscribeToRegistrations,
  type TefilaRegistration,
} from '../services/tefilaService'
import {
  createTefilaInvitation,
} from '../services/tefilaInvitationService'
import {
  useAuth,
} from '../hooks/useAuth'
import type {
  FirebaseUserProfile,
} from '../firebase/users'
import type { Tefila } from '../types'

type TefilaInvitePanelProps = {
  tefila: Tefila
}

function TefilaInvitePanel({
  tefila,
}: TefilaInvitePanelProps) {
  const { firebaseUser } = useAuth()

  const [open, setOpen] =
    useState(false)

  const [users, setUsers] =
    useState<FirebaseUserProfile[]>([])

  const [
    registrations,
    setRegistrations,
  ] = useState<TefilaRegistration[]>([])

  const [search, setSearch] =
    useState('')

  const [sendingId, setSendingId] =
    useState<string | null>(null)

  const [sentIds, setSentIds] =
    useState<string[]>([])

  const [error, setError] =
    useState('')

  const tefilaId =
    tefila.firestoreId ??
    String(tefila.id)

  useEffect(() => {
    if (!open) {
      return
    }

    return onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        setUsers(
          snapshot.docs.map(
            (document) =>
              document.data() as FirebaseUserProfile,
          ),
        )
      },
      (caughtError) => {
        console.error(caughtError)
        setError(
          'Medlemmarna kunde inte hämtas.',
        )
      },
    )
  }, [open])

  useEffect(() => {
    if (!open) {
      return
    }

    return subscribeToRegistrations(
      tefilaId,
      setRegistrations,
      (caughtError) => {
        console.error(caughtError)
        setError(
          'Anmälningarna kunde inte hämtas.',
        )
      },
    )
  }, [open, tefilaId])

  const registeredIds =
    useMemo(
      () =>
        new Set(
          registrations
            .filter(
              (registration) =>
                registration.attending,
            )
            .map(
              (registration) =>
                registration.userId,
            ),
        ),
      [registrations],
    )

  const availableUsers =
    useMemo(() => {
      const needle =
        search.trim().toLowerCase()

      return users
        .filter(
          (user) =>
            user.status ===
              'approved' &&
            user.countsForMinyan ===
              true &&
            !registeredIds.has(
              user.uid,
            ),
        )
        .filter((user) => {
          if (!needle) {
            return true
          }

          return (
            user.name
              .toLowerCase()
              .includes(needle) ||
            user.email
              .toLowerCase()
              .includes(needle)
          )
        })
        .sort((a, b) =>
          a.name.localeCompare(
            b.name,
            'sv',
          ),
        )
    }, [
      users,
      registeredIds,
      search,
    ])

  async function invite(
    user: FirebaseUserProfile,
  ) {
    if (!firebaseUser) {
      return
    }

    setSendingId(user.uid)
    setError('')

    try {
      await createTefilaInvitation({
        tefilaId,
        tefilaTitle:
          tefila.title,
        tefilaDate:
          tefila.dateValue ??
          tefila.date,
        tefilaTime:
          tefila.time,
        userId:
          user.uid,
        userName:
          user.name,
        invitedBy:
          firebaseUser.uid,
      })

      setSentIds(
        (current) => [
          ...current,
          user.uid,
        ],
      )
    } catch (caughtError) {
      console.error(
        'Kunde inte skicka inbjudan:',
        caughtError,
      )

      setError(
        'Inbjudan kunde inte skickas.',
      )
    } finally {
      setSendingId(null)
    }
  }

  return (
    <div className="mt-3 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
      <button
        type="button"
        onClick={() =>
          setOpen(
            (current) =>
              !current,
          )
        }
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-[#183b70]">
          <UserPlus className="h-4 w-4" />
        </div>

        <div className="flex-1">
          <p className="text-sm font-bold text-[#183b70]">
            Bjud in till minjan
          </p>

          <p className="text-xs text-slate-500">
            Skicka en personlig
            inbjudan till denna tfila
          </p>
        </div>

        {open ? (
          <ChevronUp className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        )}
      </button>

      {open && (
        <div className="border-t border-slate-100 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Sök medlem..."
              className="w-full rounded-2xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-sky-600"
            />
          </div>

          {error && (
            <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800">
              {error}
            </p>
          )}

          <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">
            {availableUsers.map(
              (user) => {
                const sending =
                  sendingId ===
                  user.uid

                const sent =
                  sentIds.includes(
                    user.uid,
                  )

                return (
                  <div
                    key={user.uid}
                    className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-bold text-slate-800">
                        {user.name}
                      </p>

                      <p className="truncate text-xs text-slate-500">
                        {user.email}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={
                        sending ||
                        sent
                      }
                      onClick={() =>
                        invite(user)
                      }
                      className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold ${
                        sent
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-[#183b70] text-white'
                      } disabled:opacity-70`}
                    >
                      {sending ? (
                        <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                      ) : sent ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Send className="h-3.5 w-3.5" />
                      )}

                      {sent
                        ? 'Skickad'
                        : 'Bjud in'}
                    </button>
                  </div>
                )
              },
            )}

            {availableUsers.length ===
              0 && (
              <p className="py-5 text-center text-sm text-slate-500">
                Inga fler medlemmar
                att bjuda in.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TefilaInvitePanel
