import { useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  FileText,
  LoaderCircle,
  Megaphone,
  Plus,
  RefreshCw,
  Shield,
  ShieldCheck,
  UserCheck,
  UserRound,
  Users,
  UserX,
  Wine,
  X,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'
import {
  approveUserAsGuest,
  approveUserAsMember,
  blockUser,
  makeUserAdmin,
  restoreUser,
  subscribeToUsers,
  updateUserProfile,
  type FirebaseUserProfile,
  type FirebaseUserRole,
} from '../firebase/users'
import {
  disablePinnedMessage,
  savePinnedMessage,
  subscribeToPinnedMessage,
  type PinnedMessageType,
} from '../services/pinnedMessageService'
import {
  subscribeToMembershipApplications,
  updateMembershipApplicationStatus,
  type MembershipApplication,
  type MembershipApplicationStatus,
} from '../services/membershipApplicationService'

type AdminPageProps = {
  onBack: () => void
  onCreateEvent: () => void
  onOpenTfilot: () => void
  onOpenMinyanStatistics: () => void
  onOpenEvents: () => void
  onOpenKiddush: () => void
  onOpenNews: () => void
  onOpenDocuments: () => void
}

type UserFilter =
  | 'pending'
  | 'approved'
  | 'blocked'

function AdminPage({
  onBack,
  onCreateEvent,
  onOpenTfilot,
  onOpenMinyanStatistics,
  onOpenEvents,
  onOpenKiddush,
  onOpenNews,
  onOpenDocuments,
}: AdminPageProps) {
  const { firebaseUser } = useAuth()

  const [users, setUsers] = useState<
    FirebaseUserProfile[]
  >([])

  const [usersOpen, setUsersOpen] =
    useState(true)

  const [filter, setFilter] =
    useState<UserFilter>('pending')

  const [loading, setLoading] =
    useState(true)

  const [error, setError] = useState('')

  const [savingUserId, setSavingUserId] =
    useState<string | null>(null)

  const [
    pinnedMessageOpen,
    setPinnedMessageOpen,
  ] = useState(false)

  const [
    pinnedMessageType,
    setPinnedMessageType,
  ] = useState<PinnedMessageType>(
    'mazelTov',
  )

  const [
    pinnedMessageText,
    setPinnedMessageText,
  ] = useState('')

  const [
    pinnedMessageStartDate,
    setPinnedMessageStartDate,
  ] = useState(
    new Date()
      .toISOString()
      .slice(0, 10),
  )

  const [
    pinnedMessageEndDate,
    setPinnedMessageEndDate,
  ] = useState(
    new Date()
      .toISOString()
      .slice(0, 10),
  )

  const [
    pinnedMessageActive,
    setPinnedMessageActive,
  ] = useState(false)

  const [
    savingPinnedMessage,
    setSavingPinnedMessage,
  ] = useState(false)

  const [
    pinnedMessageFeedback,
    setPinnedMessageFeedback,
  ] = useState('')

  const [
    membershipApplications,
    setMembershipApplications,
  ] = useState<MembershipApplication[]>([])

  const [
    membershipApplicationsOpen,
    setMembershipApplicationsOpen,
  ] = useState(false)

  const [
    savingMembershipApplicationId,
    setSavingMembershipApplicationId,
  ] = useState<string | null>(null)



  useEffect(() => {
    return subscribeToMembershipApplications(
      setMembershipApplications,
      (error) => {
        console.error(
          'Kunde inte läsa medlemsansökningar:',
          error,
        )
      },
    )
  }, [])
useEffect(() => {
    return subscribeToPinnedMessage(
      (message) => {
        if (!message) {
          return
        }

        setPinnedMessageType(
          message.type,
        )
        setPinnedMessageText(
          message.text,
        )
        setPinnedMessageStartDate(
          message.startDate,
        )
        setPinnedMessageEndDate(
          message.endDate,
        )
        setPinnedMessageActive(
          message.active,
        )
      },
      (caughtError) => {
        console.error(
          'Kunde inte läsa fäst meddelande:',
          caughtError,
        )
      },
    )
  }, [])

  useEffect(() => {
    setLoading(true)
    setError('')

    const unsubscribe = subscribeToUsers(
      (items) => {
        setUsers(items)
        setLoading(false)
      },
      () => {
        setError(
          'Användarna kunde inte hämtas från Firebase.',
        )
        setLoading(false)
      },
    )

    return unsubscribe
  }, [])

  const pendingUsers = useMemo(
    () =>
      users.filter(
        (user) => user.status === 'pending',
      ),
    [users],
  )

  const approvedUsers = useMemo(
    () =>
      users.filter(
        (user) => user.status === 'approved',
      ),
    [users],
  )

  const blockedUsers = useMemo(
    () =>
      users.filter(
        (user) => user.status === 'blocked',
      ),
    [users],
  )

  const filteredUsers = useMemo(() => {
    switch (filter) {
      case 'pending':
        return pendingUsers

      case 'blocked':
        return blockedUsers

      case 'approved':
      default:
        return approvedUsers
    }
  }, [
    filter,
    pendingUsers,
    approvedUsers,
    blockedUsers,
  ])

  async function handleMembershipApplicationStatus(
    applicationId: string,
    status: MembershipApplicationStatus,
  ) {
    setSavingMembershipApplicationId(
      applicationId,
    )

    try {
      await updateMembershipApplicationStatus(
        applicationId,
        status,
      )
    } catch (error) {
      console.error(
        'Kunde inte uppdatera medlemsansökan:',
        error,
      )
    } finally {
      setSavingMembershipApplicationId(
        null,
      )
    }
  }

  async function handleSavePinnedMessage() {
    const cleanText =
      pinnedMessageText.trim()

    if (!cleanText) {
      setPinnedMessageFeedback(
        'Skriv ett meddelande först.',
      )
      return
    }

    if (
      pinnedMessageEndDate <
      pinnedMessageStartDate
    ) {
      setPinnedMessageFeedback(
        'Slutdatum kan inte vara före startdatum.',
      )
      return
    }

    setSavingPinnedMessage(true)
    setPinnedMessageFeedback('')

    try {
      await savePinnedMessage({
        type: pinnedMessageType,
        text: cleanText,
        startDate:
          pinnedMessageStartDate,
        endDate:
          pinnedMessageEndDate,
        active: true,
      })

      setPinnedMessageActive(true)

      setPinnedMessageFeedback(
        'Meddelandet är publicerat.',
      )
    } catch (caughtError) {
      console.error(
        'Kunde inte publicera fäst meddelande:',
        caughtError,
      )

      setPinnedMessageFeedback(
        'Meddelandet kunde inte publiceras.',
      )
    } finally {
      setSavingPinnedMessage(false)
    }
  }

  async function handleDisablePinnedMessage() {
    setSavingPinnedMessage(true)
    setPinnedMessageFeedback('')

    try {
      await disablePinnedMessage()

      setPinnedMessageActive(false)

      setPinnedMessageFeedback(
        'Meddelandet är borttaget från startsidan.',
      )
    } catch (caughtError) {
      console.error(
        'Kunde inte ta bort fäst meddelande:',
        caughtError,
      )

      setPinnedMessageFeedback(
        'Meddelandet kunde inte tas bort.',
      )
    } finally {
      setSavingPinnedMessage(false)
    }
  }

  async function runUserAction(
    uid: string,
    action: () => Promise<void>,
  ) {
    setSavingUserId(uid)
    setError('')

    try {
      await action()
    } catch (caughtError) {
      console.error(
        'Kunde inte uppdatera användaren:',
        caughtError,
      )

      setError(
        'Användaren kunde inte uppdateras. Försök igen.',
      )
    } finally {
      setSavingUserId(null)
    }
  }

  function approveAsGuest(uid: string) {
    void runUserAction(uid, () =>
      approveUserAsGuest(uid),
    )
  }

  function approveAsMember(uid: string) {
    void runUserAction(
      uid,
      async () => {
        await approveUserAsMember(uid)

        await updateUserProfile(
          uid,
          {
            countsForMinyan: true,
          },
        )
      },
    )
  }

  function changeRole(
    uid: string,
    role: FirebaseUserRole,
  ) {
    void runUserAction(uid, () =>
      updateUserProfile(uid, { role }),
    )
  }

  function changeMinyanEligibility(
    uid: string,
    countsForMinyan: boolean,
  ) {
    void runUserAction(uid, () =>
      updateUserProfile(uid, {
        countsForMinyan,
      }),
    )
  }

  function promoteToAdmin(uid: string) {
    void runUserAction(uid, () =>
      makeUserAdmin(uid),
    )
  }

  function blockAccount(uid: string) {
    if (uid === firebaseUser?.uid) {
      setError(
        'Du kan inte blockera ditt eget administratörskonto.',
      )
      return
    }

    const confirmed = window.confirm(
      'Vill du blockera det här kontot?',
    )

    if (!confirmed) {
      return
    }

    void runUserAction(uid, () =>
      blockUser(uid),
    )
  }

  function restoreAccount(uid: string) {
    void runUserAction(uid, () =>
      restoreUser(uid),
    )
  }

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-sky-700">
            Adat Jisrael
          </p>

          <h1 className="mt-1 text-2xl font-bold text-[#183b70]">
            Administration
          </h1>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
        >
          Tillbaka
        </button>
      </header>

      {pendingUsers.length > 0 && (
        <section className="rounded-3xl bg-amber-50 p-5 ring-1 ring-amber-200">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
              <Users className="h-5 w-5" />
            </div>

            <div className="flex-1">
              <p className="font-bold text-amber-950">
                {pendingUsers.length}{' '}
                {pendingUsers.length === 1
                  ? 'konto väntar'
                  : 'konton väntar'}
              </p>

              <p className="mt-1 text-sm leading-6 text-amber-800">
                Godkänn personerna som medlem eller
                gäst för att ge dem tillgång till
                appen.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setUsersOpen(true)
              setFilter('pending')
            }}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-800 px-4 py-3 text-sm font-bold text-white"
          >
            Hantera väntande konton
            <ChevronRight className="h-4 w-4" />
          </button>
        </section>
      )}

      <button
        type="button"
        onClick={onCreateEvent}
        className="flex w-full items-center gap-4 rounded-3xl bg-[#183b70] p-5 text-left text-white shadow-sm transition hover:bg-[#102d57]"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
          <Plus className="h-6 w-6" />
        </div>

        <div className="flex-1">
          <p className="text-lg font-bold">
            Ny händelse
          </p>

          <p className="mt-1 text-sm leading-5 text-blue-100">
            Skapa tfilah, Jahrzeit, aktivitet eller
            annan händelse
          </p>
        </div>

        <ChevronRight className="h-5 w-5 shrink-0" />
      </button>

      <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
        <button
          type="button"
          onClick={() =>
            setUsersOpen((current) => !current)
          }
          className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-slate-50"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-[#183b70]">
            <Users className="h-6 w-6" />
          </div>

          <div className="flex-1">
            <p className="font-bold text-slate-800">
              Användare
            </p>

            <p className="mt-1 text-sm leading-5 text-slate-500">
              {pendingUsers.length} väntande ·{' '}
              {approvedUsers.length} aktiva ·{' '}
              {blockedUsers.length} blockerade
            </p>
          </div>

          {usersOpen ? (
            <ChevronUp className="h-5 w-5 text-slate-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-slate-400" />
          )}
        </button>

        {usersOpen && (
          <div className="border-t border-slate-100 p-4">
            <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1.5">
              <FilterButton
                label="Väntar"
                count={pendingUsers.length}
                active={filter === 'pending'}
                onClick={() =>
                  setFilter('pending')
                }
              />

              <FilterButton
                label="Aktiva"
                count={approvedUsers.length}
                active={filter === 'approved'}
                onClick={() =>
                  setFilter('approved')
                }
              />

              <FilterButton
                label="Blockerade"
                count={blockedUsers.length}
                active={filter === 'blocked'}
                onClick={() =>
                  setFilter('blocked')
                }
              />
            </div>

            {error && (
              <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold leading-6 text-rose-800">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center gap-3 py-10 text-slate-500">
                <LoaderCircle className="h-5 w-5 animate-spin" />
                Hämtar användare…
              </div>
            ) : filteredUsers.length === 0 ? (
              <EmptyUsersState filter={filter} />
            ) : (
              <div className="mt-4 space-y-3">
                {filteredUsers.map((user) => (
                  <UserAdminCard
                    key={user.uid}
                    user={user}
                    isCurrentUser={
                      user.uid ===
                      firebaseUser?.uid
                    }
                    saving={
                      savingUserId === user.uid
                    }
                    onApproveAsGuest={() =>
                      approveAsGuest(user.uid)
                    }
                    onApproveAsMember={() =>
                      approveAsMember(user.uid)
                    }
                    onChangeRole={(role) =>
                      changeRole(user.uid, role)
                    }
                    onPromoteToAdmin={() =>
                      promoteToAdmin(user.uid)
                    }
                    onChangeMinyanEligibility={(
                      value,
                    ) =>
                      changeMinyanEligibility(
                        user.uid,
                        value,
                      )
                    }
                    onBlock={() =>
                      blockAccount(user.uid)
                    }
                    onRestore={() =>
                      restoreAccount(user.uid)
                    }
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
          Hantera innehåll
        </h2>

        <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
          <AdminMenuItem
            icon={
              <CalendarDays className="h-6 w-6" />
            }
            title="Tfilot"
            description="Se deltagare, ställ in och bekräfta minjan"
            onClick={onOpenTfilot}
          />

          <AdminMenuItem
            icon={
              <Users className="h-6 w-6" />
            }
            title="Minjanstatistik"
            description="Faktisk närvaro och genomförda minjanim"
            onClick={onOpenMinyanStatistics}
          />

          <AdminMenuItem
            icon={
              <FileText className="h-6 w-6" />
            }
            title="Händelser"
            description="Aktiviteter, högtider, Jahrzeit och övriga händelser"
            onClick={onOpenEvents}
          />

          <AdminMenuItem
            icon={
              <FileText className="h-6 w-6" />
            }
            title="Nyheter"
            description="Publicera nyheter och meddelanden"
            onClick={onOpenNews}
          />

          <AdminMenuItem
            icon={
              <FileText className="h-6 w-6" />
            }
            title="Dokument"
            description="Ladda upp och hantera medlemsdokument"
            onClick={onOpenDocuments}
          />

          <AdminMenuItem
            icon={<Wine className="h-6 w-6" />}
            title="Kiddush"
            description="Hantera bokningar och lediga datum"
            onClick={onOpenKiddush}
          />

          <AdminMenuItem
            icon={
              <Megaphone className="h-6 w-6" />
            }
            title="Fäst meddelande"
            description="Visa ett tillfälligt meddelande på startsidan"
            onClick={() =>
              setPinnedMessageOpen(
                (current) => !current,
              )
            }
          />

          {pinnedMessageOpen && (
            <div className="border-t border-slate-100 bg-slate-50 p-5">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-slate-700">
                    Typ
                  </label>

                  <select
                    value={pinnedMessageType}
                    onChange={(event) =>
                      setPinnedMessageType(
                        event.target.value as
                          PinnedMessageType,
                      )
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                  >
                    <option value="mazelTov">
                      Mazel tov
                    </option>

                    <option value="important">
                      Viktig information
                    </option>

                    <option value="fundraiser">
                      Insamling
                    </option>

                    <option value="general">
                      Meddelande
                    </option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700">
                    Text
                  </label>

                  <textarea
                    rows={3}
                    value={pinnedMessageText}
                    onChange={(event) =>
                      setPinnedMessageText(
                        event.target.value,
                      )
                    }
                    placeholder="Exempel: Mazel tov familjen ..."
                    className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-bold text-slate-700">
                      Från
                    </label>

                    <input
                      type="date"
                      value={
                        pinnedMessageStartDate
                      }
                      onChange={(event) =>
                        setPinnedMessageStartDate(
                          event.target.value,
                        )
                      }
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-700">
                      Till
                    </label>

                    <input
                      type="date"
                      value={
                        pinnedMessageEndDate
                      }
                      onChange={(event) =>
                        setPinnedMessageEndDate(
                          event.target.value,
                        )
                      }
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  disabled={
                    savingPinnedMessage ||
                    !pinnedMessageText.trim()
                  }
                  onClick={() => {
                    void handleSavePinnedMessage()
                  }}
                  className="w-full rounded-2xl bg-[#183b70] px-4 py-3 font-bold text-white disabled:opacity-50"
                >
                  {savingPinnedMessage
                    ? 'Sparar…'
                    : pinnedMessageActive
                      ? 'Uppdatera meddelande'
                      : 'Publicera meddelande'}
                </button>

                {pinnedMessageActive && (
                  <button
                    type="button"
                    disabled={
                      savingPinnedMessage
                    }
                    onClick={() => {
                      void handleDisablePinnedMessage()
                    }}
                    className="w-full rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800 ring-1 ring-rose-100 disabled:opacity-50"
                  >
                    Ta bort från startsidan
                  </button>
                )}

                {pinnedMessageFeedback && (
                  <p className="text-sm font-semibold text-slate-600">
                    {pinnedMessageFeedback}
                  </p>
                )}
              </div>
            </div>
          )}

          <AdminMenuItem
            icon={
              <Users className="h-6 w-6" />
            }
            title="Medlemsansökningar"
            description="Se och hantera inkomna medlemsansökningar"
            onClick={() =>
              setMembershipApplicationsOpen(
                (current) => !current,
              )
            }
          />

          {membershipApplicationsOpen && (
            <div className="border-t border-slate-100 bg-slate-50 p-5">
              <div className="space-y-4">
                {membershipApplications.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    Inga medlemsansökningar ännu.
                  </p>
                ) : (
                  membershipApplications.map(
                    (application) => (
                      <article
                        key={application.id}
                        className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-slate-900">
                              {application.name}
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                              {application.email}
                            </p>
                          </div>

                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                            {application.status === 'pending'
                              ? 'Ny'
                              : application.status === 'processing'
                                ? 'Under behandling'
                                : application.status === 'approved'
                                  ? 'Godkänd'
                                  : 'Avslagen'}
                          </span>
                        </div>

                        {application.phone && (
                          <p className="mt-3 text-sm text-slate-600">
                            Telefon: {application.phone}
                          </p>
                        )}

                        {application.address && (
                          <p className="mt-1 text-sm text-slate-600">
                            Adress: {application.address}
                          </p>
                        )}

                        {application.message && (
                          <div className="mt-3 rounded-xl bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-600">
                            {application.message}
                          </div>
                        )}

                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            disabled={
                              savingMembershipApplicationId === application.id
                            }
                            onClick={() => {
                              void handleMembershipApplicationStatus(
                                application.id,
                                'processing',
                              )
                            }}
                            className="rounded-xl bg-amber-50 px-3 py-2.5 text-xs font-bold text-amber-800 ring-1 ring-amber-200 disabled:opacity-50"
                          >
                            Under behandling
                          </button>

                          <button
                            type="button"
                            disabled={
                              savingMembershipApplicationId === application.id
                            }
                            onClick={() => {
                              void handleMembershipApplicationStatus(
                                application.id,
                                'approved',
                              )
                            }}
                            className="rounded-xl bg-emerald-50 px-3 py-2.5 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200 disabled:opacity-50"
                          >
                            Godkänd
                          </button>

                          <button
                            type="button"
                            disabled={
                              savingMembershipApplicationId === application.id
                            }
                            onClick={() => {
                              void handleMembershipApplicationStatus(
                                application.id,
                                'rejected',
                              )
                            }}
                            className="col-span-2 rounded-xl bg-rose-50 px-3 py-2.5 text-xs font-bold text-rose-800 ring-1 ring-rose-200 disabled:opacity-50"
                          >
                            Avslagen
                          </button>
                        </div>

                        {application.status === 'approved' && (
                          <p className="mt-3 rounded-xl bg-sky-50 px-3 py-2 text-xs font-semibold leading-5 text-[#183b70]">
                            Styrelsen har godkänt ansökan. Ändra användarens roll till Medlem separat när det är dags att ge medlemsbehörighet i appen.
                          </p>
                        )}
                      </article>
                    ),
                  )
                )}
              </div>
            </div>
          )}

        </div>
      </section>

      <section className="rounded-3xl bg-emerald-50 p-5 ring-1 ring-emerald-100">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-emerald-700" />

          <div>
            <p className="font-bold text-emerald-900">
              Firebase är anslutet
            </p>

            <p className="mt-2 text-sm leading-6 text-emerald-800">
              Användare och behörigheter sparas nu
              permanent och uppdateras i realtid.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

type FilterButtonProps = {
  label: string
  count: number
  active: boolean
  onClick: () => void
}

function FilterButton({
  label,
  count,
  active,
  onClick,
}: FilterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-2 py-2.5 text-xs font-bold transition ${
        active
          ? 'bg-white text-[#183b70] shadow-sm'
          : 'text-slate-500'
      }`}
    >
      {label} ({count})
    </button>
  )
}

type UserAdminCardProps = {
  user: FirebaseUserProfile
  isCurrentUser: boolean
  saving: boolean
  onApproveAsGuest: () => void
  onApproveAsMember: () => void
  onChangeRole: (
    role: FirebaseUserRole,
  ) => void
  onPromoteToAdmin: () => void
  onChangeMinyanEligibility: (
    value: boolean,
  ) => void
  onBlock: () => void
  onRestore: () => void
}

function UserAdminCard({
  user,
  isCurrentUser,
  saving,
  onApproveAsGuest,
  onApproveAsMember,
  onChangeRole,
  onPromoteToAdmin,
  onChangeMinyanEligibility,
  onBlock,
  onRestore,
}: UserAdminCardProps) {
  const [actionsOpen, setActionsOpen] =
    useState(false)

  const isPending = user.status === 'pending'
  const isBlocked = user.status === 'blocked'

  return (
    <article className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
            isBlocked
              ? 'bg-rose-100 text-rose-800'
              : user.role === 'admin'
                ? 'bg-violet-100 text-violet-800'
                : user.role === 'member'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-sky-100 text-[#183b70]'
          }`}
        >
          {user.role === 'admin' ? (
            <Shield className="h-5 w-5" />
          ) : (
            <UserRound className="h-5 w-5" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-slate-900">
              {user.name}
            </h3>

            {isCurrentUser && (
              <span className="rounded-full bg-violet-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-violet-800">
                Du
              </span>
            )}
          </div>

          <p className="mt-1 truncate text-sm text-slate-500">
            {user.email}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <RoleBadge role={user.role} />
            <StatusBadge status={user.status} />

            {user.status === 'approved' &&
              user.role !== 'guest' && (
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                    user.countsForMinyan
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {user.countsForMinyan
                    ? 'Räknas till minjan'
                    : 'Ej minjan'}
                </span>
              )}
          </div>
        </div>
      </div>

      {isPending && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={onApproveAsGuest}
            className="flex items-center justify-center gap-2 rounded-2xl bg-sky-50 px-3 py-3 text-xs font-bold text-[#183b70] ring-1 ring-sky-200 disabled:opacity-60"
          >
            <UserCheck className="h-4 w-4" />
            Godkänn gäst
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={onApproveAsMember}
            className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-3 py-3 text-xs font-bold text-white disabled:opacity-60"
          >
            <Check className="h-4 w-4" />
            Godkänn medlem
          </button>

          {!isCurrentUser && (
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                const confirmed = window.confirm(
                  `Vill du avvisa ${user.name}? Personen får inte tillgång till appen.`,
                )

                if (confirmed) {
                  onBlock()
                }
              }}
              className="col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-rose-50 px-3 py-3 text-xs font-bold text-rose-800 ring-1 ring-rose-200 disabled:opacity-60"
            >
              <UserX className="h-4 w-4" />
              Avvisa
            </button>
          )}
        </div>
      )}

      {isBlocked && (
        <button
          type="button"
          disabled={saving}
          onClick={onRestore}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-3 py-3 text-sm font-bold text-white disabled:opacity-60"
        >
          <RefreshCw className="h-4 w-4" />
          Återaktivera konto
        </button>
      )}

      {!isPending && !isBlocked && (
        <>
          <button
            type="button"
            onClick={() =>
              setActionsOpen(
                (current) => !current,
              )
            }
            className="mt-4 flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200"
          >
            Hantera användare

            {actionsOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {actionsOpen && (
            <div className="mt-3 space-y-2">
              <div className="rounded-2xl bg-sky-50 p-3 ring-1 ring-sky-100">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#183b70]">
                    Minjan
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Styr om personen kan anmäla sig
                    och räknas till minjan.
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() =>
                        onChangeMinyanEligibility(
                          true,
                        )
                      }
                      className={`rounded-xl px-3 py-2.5 text-xs font-bold ${
                        user.countsForMinyan
                          ? 'bg-[#183b70] text-white'
                          : 'bg-white text-slate-600 ring-1 ring-slate-200'
                      }`}
                    >
                      Räknas till minjan
                    </button>

                    <button
                      type="button"
                      disabled={saving}
                      onClick={() =>
                        onChangeMinyanEligibility(
                          false,
                        )
                      }
                      className={`rounded-xl px-3 py-2.5 text-xs font-bold ${
                        !user.countsForMinyan
                          ? 'bg-slate-700 text-white'
                          : 'bg-white text-slate-600 ring-1 ring-slate-200'
                      }`}
                    >
                      Räknas inte
                    </button>
                  </div>
                </div>

              <div className="grid grid-cols-2 gap-2">
                <RoleButton
                  label="Gäst"
                  active={user.role === 'guest'}
                  disabled={saving}
                  onClick={() =>
                    onChangeRole('guest')
                  }
                />

                <RoleButton
                  label="Medlem"
                  active={user.role === 'member'}
                  disabled={saving}
                  onClick={() =>
                    onChangeRole('member')
                  }
                />
              </div>

              {user.role !== 'admin' && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={onPromoteToAdmin}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-50 px-4 py-3 text-sm font-bold text-violet-800 ring-1 ring-violet-200 disabled:opacity-60"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Gör till administratör
                </button>
              )}

              {!isCurrentUser && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={onBlock}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800 disabled:opacity-60"
                >
                  <UserX className="h-4 w-4" />
                  Blockera konto
                </button>
              )}
            </div>
          )}
        </>
      )}

      {saving && (
        <p className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Sparar ändringen…
        </p>
      )}
    </article>
  )
}

type RoleButtonProps = {
  label: string
  active: boolean
  disabled: boolean
  onClick: () => void
}

function RoleButton({
  label,
  active,
  disabled,
  onClick,
}: RoleButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || active}
      onClick={onClick}
      className={`rounded-2xl px-3 py-3 text-xs font-bold ring-1 transition disabled:opacity-60 ${
        active
          ? 'bg-[#183b70] text-white ring-[#183b70]'
          : 'bg-white text-slate-700 ring-slate-200'
      }`}
    >
      {active ? (
        <span className="flex items-center justify-center gap-1.5">
          <Check className="h-3.5 w-3.5" />
          {label}
        </span>
      ) : (
        label
      )}
    </button>
  )
}

function RoleBadge({
  role,
}: {
  role: FirebaseUserRole
}) {
  const labels: Record<
    FirebaseUserRole,
    string
  > = {
    guest: 'Gäst',
    member: 'Medlem',
    admin: 'Administratör',
  }

  return (
    <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600 ring-1 ring-slate-200">
      {labels[role]}
    </span>
  )
}

function StatusBadge({
  status,
}: {
  status: FirebaseUserProfile['status']
}) {
  const styles = {
    pending:
      'bg-amber-100 text-amber-800',
    approved:
      'bg-emerald-100 text-emerald-800',
    blocked:
      'bg-rose-100 text-rose-800',
  }

  const labels = {
    pending: 'Väntar',
    approved: 'Aktiv',
    blocked: 'Blockerad',
  }

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${styles[status]}`}
    >
      {labels[status]}
    </span>
  )
}

function EmptyUsersState({
  filter,
}: {
  filter: UserFilter
}) {
  const messages: Record<
    UserFilter,
    string
  > = {
    pending:
      'Det finns inga konton som väntar på godkännande.',
    approved:
      'Det finns inga aktiva användare.',
    blocked:
      'Det finns inga blockerade användare.',
  }

  return (
    <div className="py-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        {filter === 'blocked' ? (
          <X className="h-6 w-6" />
        ) : (
          <Users className="h-6 w-6" />
        )}
      </div>

      <p className="mx-auto mt-4 max-w-xs text-sm leading-6 text-slate-500">
        {messages[filter]}
      </p>
    </div>
  )
}

type AdminMenuItemProps = {
  icon: ReactNode
  title: string
  description: string
  onClick?: () => void
}

function AdminMenuItem({
  icon,
  title,
  description,
  onClick,
}: AdminMenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-4 border-b border-slate-100 px-5 py-4 text-left transition last:border-0 hover:bg-slate-50"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-[#183b70]">
        {icon}
      </div>

      <div className="flex-1">
        <p className="font-bold text-slate-800">
          {title}
        </p>

        <p className="mt-1 text-sm leading-5 text-slate-500">
          {description}
        </p>
      </div>

      <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
    </button>
  )
}

export default AdminPage