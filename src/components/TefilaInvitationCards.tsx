import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  Check,
  LoaderCircle,
  Mail,
  X,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import {
  respondToTefilaInvitation,
  subscribeToUserInvitations,
  type TefilaInvitation,
} from '../services/tefilaInvitationService'
import {
  saveRegistration,
} from '../services/tefilaService'

function TefilaInvitationCards() {
  const {
    firebaseUser,
    profile,
  } = useAuth()

  const [
    invitations,
    setInvitations,
  ] = useState<TefilaInvitation[]>([])

  const [loading, setLoading] =
    useState(true)

  const [
    respondingId,
    setRespondingId,
  ] = useState<string | null>(null)

  const [error, setError] =
    useState('')

  useEffect(() => {
    if (!firebaseUser) {
      setInvitations([])
      setLoading(false)
      return
    }

    setLoading(true)

    return subscribeToUserInvitations(
      firebaseUser.uid,
      (nextInvitations) => {
        setInvitations(
          nextInvitations,
        )
        setLoading(false)
      },
      (caughtError) => {
        console.error(
          'Kunde inte läsa tfila-inbjudningar:',
          caughtError,
        )

        setError(
          'Inbjudningarna kunde inte hämtas.',
        )

        setLoading(false)
      },
    )
  }, [firebaseUser])

  const canReceiveMinyanInvitations =
    profile?.role === 'admin' ||
    profile?.countsForMinyan === true

  const pendingInvitations =
    useMemo(() => {
      const today =
        formatDateValue(
          new Date(),
        )

      return invitations
        .filter(
          (invitation) =>
            invitation.status ===
              'pending' &&
            invitation.tefilaDate >=
              today,
        )
        .sort((first, second) => {
          const dateComparison =
            first.tefilaDate.localeCompare(
              second.tefilaDate,
            )

          if (
            dateComparison !== 0
          ) {
            return dateComparison
          }

          return first.tefilaTime
            .replace('.', ':')
            .localeCompare(
              second.tefilaTime.replace(
                '.',
                ':',
              ),
            )
        })
    }, [invitations])

  async function acceptInvitation(
    invitation: TefilaInvitation,
  ) {
    if (
      !firebaseUser ||
      !profile
    ) {
      return
    }

    setRespondingId(
      invitation.id,
    )
    setError('')

    try {
      /*
       * En accepterad inbjudan blir en helt vanlig
       * tfila-anmälan. Därmed räknas personen i
       * minjan precis som alla andra.
       */
      await saveRegistration({
        tefilaId:
          invitation.tefilaId,
        userId:
          firebaseUser.uid,
        userName:
          profile.name,
        guestCount: 0,
      })

      await respondToTefilaInvitation(
        invitation.id,
        'accepted',
      )
    } catch (caughtError) {
      console.error(
        'Kunde inte acceptera inbjudan:',
        caughtError,
      )

      setError(
        'Svaret kunde inte sparas. Försök igen.',
      )
    } finally {
      setRespondingId(null)
    }
  }

  async function declineInvitation(
    invitation: TefilaInvitation,
  ) {
    setRespondingId(
      invitation.id,
    )
    setError('')

    try {
      await respondToTefilaInvitation(
        invitation.id,
        'declined',
      )
    } catch (caughtError) {
      console.error(
        'Kunde inte avböja inbjudan:',
        caughtError,
      )

      setError(
        'Svaret kunde inte sparas. Försök igen.',
      )
    } finally {
      setRespondingId(null)
    }
  }

  if (
    !canReceiveMinyanInvitations ||
    loading ||
    pendingInvitations.length ===
      0
  ) {
    return null
  }

  return (
    <section className="space-y-3">
      {error && (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800 ring-1 ring-rose-200">
          {error}
        </p>
      )}

      {pendingInvitations.map(
        (invitation) => {
          const responding =
            respondingId ===
            invitation.id

          return (
            <article
              key={invitation.id}
              className="overflow-hidden rounded-3xl bg-sky-50 shadow-sm ring-1 ring-sky-200"
            >
              <div className="flex items-center gap-2 bg-[#183b70] px-5 py-3 text-white">
                <Mail className="h-4 w-4" />

                <p className="text-xs font-black uppercase tracking-wide">
                  Du är inbjuden
                </p>
              </div>

              <div className="p-5">
                <h2 className="text-lg font-bold text-[#183b70]">
                  {invitation.tefilaTitle}
                </h2>

                <p className="mt-1 text-sm font-semibold text-slate-600">
                  {formatInvitationDate(
                    invitation.tefilaDate,
                  )}
                  {' · '}
                  {invitation.tefilaTime}
                </p>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  En gabbai har bjudit in dig till denna tfila.
                  Kan du komma?
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={responding}
                    onClick={() =>
                      acceptInvitation(
                        invitation,
                      )
                    }
                    className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
                  >
                    {responding ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}

                    Kommer
                  </button>

                  <button
                    type="button"
                    disabled={responding}
                    onClick={() =>
                      declineInvitation(
                        invitation,
                      )
                    }
                    className="flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200 disabled:opacity-60"
                  >
                    <X className="h-4 w-4" />
                    Kan inte
                  </button>
                </div>
              </div>
            </article>
          )
        },
      )}
    </section>
  )
}

function formatInvitationDate(
  value: string,
): string {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      value,
    )
  ) {
    return value
  }

  const date =
    new Date(
      `${value}T12:00:00`,
    )

  const weekday =
    new Intl.DateTimeFormat(
      'sv-SE',
      {
        weekday: 'long',
      },
    ).format(date)

  const dateText =
    new Intl.DateTimeFormat(
      'sv-SE',
      {
        day: 'numeric',
        month: 'long',
      },
    ).format(date)

  return (
    weekday.charAt(0).toUpperCase() +
    weekday.slice(1) +
    ' ' +
    dateText
  )
}

function formatDateValue(
  date: Date,
): string {
  const year =
    date.getFullYear()

  const month =
    String(
      date.getMonth() + 1,
    ).padStart(2, '0')

  const day =
    String(
      date.getDate(),
    ).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export default TefilaInvitationCards
