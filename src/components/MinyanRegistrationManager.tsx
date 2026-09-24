import { useEffect, useMemo, useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  UserPlus,
  X,
} from 'lucide-react'
import {
  subscribeToUsers,
  type FirebaseUserProfile,
} from '../firebase/users'
import {
  removeRegistration,
  saveRegistration,
  setRegistrationAttending,
  setRegistrationGuestNames,
  type TefilaRegistration,
} from '../services/tefilaService'

type Props = {
  tefilaId: string
  registrations: TefilaRegistration[]
}

export default function MinyanRegistrationManager({
  tefilaId,
  registrations,
}: Props) {
  const [open, setOpen] = useState(false)
  const [users, setUsers] = useState<FirebaseUserProfile[]>([])
  const [search, setSearch] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return

    return subscribeToUsers(
      setUsers,
      () => setError('Kunde inte läsa medlemslistan.'),
    )
  }, [open])

  const availableUsers = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('sv')

    return users.filter((user) => {
      if (user.status !== 'approved') return false

      // Endast verkliga minjanberättigade konton.
      if (
        user.countsForMinyan !== true &&
        user.role !== 'gabbai' &&
        user.role !== 'admin'
      ) {
        return false
      }

      if (
        registrations.some(
          (registration) =>
            registration.userId === user.uid &&
            registration.attending,
        )
      ) {
        return false
      }

      return (
        !term ||
        user.name.toLocaleLowerCase('sv').includes(term) ||
        user.email.toLocaleLowerCase('sv').includes(term)
      )
    })
  }, [users, registrations, search])

  async function run(action: () => Promise<void>) {
    setBusy(true)
    setError('')

    try {
      await action()
    } catch (caught) {
      console.error(caught)
      setError(
        'Ändringen kunde inte sparas. Kontrollera behörigheten och försök igen.',
      )
    } finally {
      setBusy(false)
    }
  }

  async function addMember(user: FirebaseUserProfile) {
    const existing = registrations.find(
      (registration) => registration.userId === user.uid,
    )

    await run(() =>
      saveRegistration({
        tefilaId,
        userId: user.uid,
        userName: user.name,
        attending: true,
        guestCount: existing?.guestCount ?? 0,
        guestNames: existing?.guestNames,
        guestComment: existing?.guestComment,
      }),
    )

    setSearch('')
  }

  async function removeMember(
    registration: TefilaRegistration,
  ) {
    if (
      !window.confirm(
        `Ta bort ${registration.userName} från minjan?`,
      )
    ) {
      return
    }

    await run(async () => {
      if (registration.guestCount > 0) {
        // Behåll personens gäster.
        await setRegistrationAttending(
          tefilaId,
          registration.userId,
          false,
        )
      } else {
        await removeRegistration(
          tefilaId,
          registration.userId,
        )
      }
    })
  }

  async function removeGuest(
    registration: TefilaRegistration,
    index: number,
  ) {
    const names = registration.guestNames ?? []
    const guestName = names[index] ?? 'gästen'

    if (
      !window.confirm(
        `Ta bort ${guestName} från ${registration.userName}s gäster?`,
      )
    ) {
      return
    }

    await run(async () => {
      // Äldre registreringar kan sakna gästnamn.
      // Hantera dem utan att påverka övriga gäster.
      if (names.length === 0) {
        const remaining = Math.max(
          0,
          registration.guestCount - 1,
        )

        if (!registration.attending && remaining === 0) {
          await removeRegistration(
            tefilaId,
            registration.userId,
          )
          return
        }

        // Namnlösa äldre gäster representeras av tomma namn.
        // Antalet måste därför uppdateras separat.
        await setRegistrationGuestCount(
          registration,
          remaining,
        )
        return
      }

      const remaining = names.filter(
        (_, guestIndex) => guestIndex !== index,
      )

      if (!registration.attending && remaining.length === 0) {
        await removeRegistration(
          tefilaId,
          registration.userId,
        )
      } else {
        await setRegistrationGuestNames(
          tefilaId,
          registration.userId,
          remaining,
        )
      }
    })
  }

  async function setRegistrationGuestCount(
    registration: TefilaRegistration,
    count: number,
  ) {
    // Gamla namnlösa registreringar hanteras via befintlig service.
    const { updateRegistrationGuests } =
      await import('../services/tefilaService')

    await updateRegistrationGuests(
      tefilaId,
      registration.userId,
      count,
      registration.guestComment,
    )
  }

  return (
    <div className="border-t border-slate-200 pt-4">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between rounded-2xl bg-sky-50 px-4 py-3 text-sm font-bold text-[#183b70]"
      >
        <span className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Hantera deltagare
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {open && (
        <div className="mt-3 space-y-4">
          <div>
            <label className="text-sm font-bold text-slate-700">
              Lägg till medlem
            </label>

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Sök namn eller e-post"
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"
            />

            {search.trim() && (
              <div className="mt-2 max-h-52 space-y-1 overflow-y-auto">
                {availableUsers.slice(0, 20).map((user) => (
                  <button
                    key={user.uid}
                    type="button"
                    disabled={busy}
                    onClick={() => void addMember(user)}
                    className="flex w-full items-center justify-between rounded-xl bg-slate-50 px-3 py-3 text-left text-sm disabled:opacity-50"
                  >
                    <span>
                      <span className="block font-semibold">
                        {user.name}
                      </span>
                      <span className="block text-xs text-slate-500">
                        {user.email}
                      </span>
                    </span>
                    <UserPlus className="h-4 w-4 text-[#183b70]" />
                  </button>
                ))}

                {availableUsers.length === 0 && (
                  <p className="px-2 py-3 text-sm text-slate-500">
                    Ingen tillgänglig medlem hittades.
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <h4 className="mb-2 text-sm font-bold text-slate-700">
              Anmälda medlemmar
            </h4>

            <div className="space-y-2">
              {registrations
                .filter((registration) => registration.attending)
                .map((registration) => (
                  <div
                    key={registration.userId}
                    className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2"
                  >
                    <span className="text-sm font-semibold">
                      {registration.userName}
                    </span>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        void removeMember(registration)
                      }
                      aria-label={`Ta bort ${registration.userName}`}
                      className="rounded-lg p-2 text-rose-700 disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-bold text-slate-700">
              Gäster
            </h4>

            <div className="space-y-2">
              {registrations.flatMap((registration) => {
                const names = registration.guestNames ?? []

                const guests =
                  names.length > 0
                    ? names
                    : Array.from(
                        { length: registration.guestCount },
                        (_, index) =>
                          registration.guestCount === 1
                            ? 'Gäst'
                            : `Gäst ${index + 1}`,
                      )

                return guests.map((name, index) => (
                  <div
                    key={`${registration.userId}-${index}`}
                    className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-semibold">
                        {name}
                      </p>
                      <p className="text-xs text-slate-500">
                        Gäst till {registration.userName}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        void removeGuest(registration, index)
                      }
                      aria-label={`Ta bort ${name}`}
                      className="rounded-lg p-2 text-rose-700 disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))
              })}
            </div>
          </div>

          {error && (
            <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
