import { useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  FileText,
  LoaderCircle,
  Plus,
  RefreshCw,
  Settings,
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

type AdminPageProps = {
  onBack: () => void
  onCreateEvent: () => void
  onOpenTfilot: () => void
  onOpenEvents: () => void
  onOpenKiddush: () => void
}

type UserFilter =
  | 'pending'
  | 'approved'
  | 'blocked'

function AdminPage({
  onBack,
  onCreateEvent,
  onOpenTfilot,
  onOpenEvents,
  onOpenKiddush,
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
    void runUserAction(uid, () =>
      approveUserAsMember(uid),
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
            title="Information"
            description="Publicera nyheter och meddelanden"
          />

          <AdminMenuItem
            icon={<Wine className="h-6 w-6" />}
            title="Kiddush"
            description="Hantera bokningar och lediga datum"
            onClick={onOpenKiddush}
          />

          <AdminMenuItem
            icon={
              <Settings className="h-6 w-6" />
            }
            title="Inställningar"
            description="Standardschema och appinställningar"
          />
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