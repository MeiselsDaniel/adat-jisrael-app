import { useEffect, useState } from 'react'
import {
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  UserRound,
  Users,
  X,
  XCircle,
} from 'lucide-react'
import type { Tefila } from '../types'
import type {
  MinyanResult,
  TefilaRegistration,
} from '../services/tefilaService'

type MinyanCardProps = {
  tefila: Tefila
  registered: boolean
  attendance: number
  registrations: TefilaRegistration[]
  currentGuestCount: number
  currentGuestComment?: string
  loading?: boolean
  cancelled?: boolean
  canRegister?: boolean
  completed?: boolean
  minyanResult?: MinyanResult
  actualAttendance?: number
  canManage?: boolean
  extraInfo?: {
    label: string
    value: string
  }
  onRegister: (
    guestCount: number,
    guestComment?: string,
  ) => Promise<void>
  onUnregister: () => Promise<void>
  onCancel?: () => Promise<void>
  onReactivate?: () => Promise<void>
  onConfirm?: (
    result: MinyanResult,
    actualAttendance: number,
  ) => Promise<void>
}

function MinyanCard({
  tefila,
  registered,
  attendance,
  registrations,
  currentGuestCount,
  currentGuestComment,
  loading = false,
  cancelled = false,
  canRegister = true,
  completed = false,
  minyanResult,
  actualAttendance,
  canManage = false,
  extraInfo,
  onRegister,
  onUnregister,
  onCancel,
  onReactivate,
  onConfirm,
}: MinyanCardProps) {
  const [detailsOpen, setDetailsOpen] =
    useState(false)

  const [guestFormOpen, setGuestFormOpen] =
    useState(false)

  const [adminOpen, setAdminOpen] =
    useState(false)

  const [draftGuestCount, setDraftGuestCount] =
    useState(
      currentGuestCount > 0
        ? currentGuestCount
        : 1,
    )

  const [
    draftGuestComment,
    setDraftGuestComment,
  ] = useState(currentGuestComment ?? '')

  const [
    draftActualAttendance,
    setDraftActualAttendance,
  ] = useState(attendance)

  const [saving, setSaving] =
    useState(false)

  const [error, setError] =
    useState('')

  useEffect(() => {
    setDraftActualAttendance(attendance)
  }, [attendance])

  const attendanceColor =
    attendance >= 10
      ? 'bg-emerald-100 text-emerald-900'
      : attendance >= 8
        ? 'bg-amber-100 text-amber-900'
        : 'bg-rose-100 text-rose-900'

  const isKabbalatShabbat =
    tefila.title === 'Kabbalat Shabbat'

  function openGuestForm() {
    setDraftGuestCount(
      currentGuestCount > 0
        ? currentGuestCount
        : 1,
    )

    setDraftGuestComment(
      currentGuestComment ?? '',
    )

    setError('')
    setGuestFormOpen(true)
    setDetailsOpen(true)
  }

  async function runAction(
    action: () => Promise<void>,
    errorMessage: string,
  ) {
    setSaving(true)
    setError('')

    try {
      await action()
    } catch (caughtError) {
      console.error(caughtError)
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  async function handleOwnRegistration() {
    await runAction(
      async () => {
        if (registered) {
          await onUnregister()
        } else {
          await onRegister(0)
        }
      },
      'Anmälan kunde inte sparas. Försök igen.',
    )
  }

  async function saveGuests() {
    await runAction(
      async () => {
        await onRegister(
          draftGuestCount,
          draftGuestComment,
        )
        setGuestFormOpen(false)
        setDetailsOpen(true)
      },
      'Gästerna kunde inte sparas. Försök igen.',
    )
  }

  async function removeGuests() {
    await runAction(
      async () => {
        await onRegister(0)
        setGuestFormOpen(false)
      },
      'Gästerna kunde inte tas bort.',
    )
  }

  async function handleCancel() {
    if (!onCancel) return

    const confirmed = window.confirm(
      `Vill du ställa in ${tefila.title}?`,
    )

    if (!confirmed) return

    await runAction(
      onCancel,
      'Tfilan kunde inte ställas in.',
    )
  }

  async function handleReactivate() {
    if (!onReactivate) return

    await runAction(
      onReactivate,
      'Tfilan kunde inte återaktiveras.',
    )
  }

  async function handleConfirm(
    result: MinyanResult,
  ) {
    if (!onConfirm) return

    await runAction(
      async () => {
        await onConfirm(
          result,
          draftActualAttendance,
        )
        setAdminOpen(false)
      },
      'Resultatet kunde inte sparas.',
    )
  }

  if (cancelled) {
    return (
      <article className="overflow-hidden rounded-3xl bg-rose-50 shadow-sm ring-2 ring-rose-500">
        <div className="bg-rose-700 px-4 py-3 text-center text-sm font-black uppercase tracking-widest text-white">
          Inställd
        </div>

        <div className="p-5">
          <h2 className="text-lg font-bold text-rose-950">
            {tefila.day}
          </h2>

          <p className="mt-0.5 text-sm text-rose-700">
            {tefila.date}
          </p>

          <p className="mt-4 text-lg font-bold text-rose-900">
            {tefila.title}
          </p>

          <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-rose-800">
            <Clock className="h-4 w-4" />
            {tefila.time}
          </p>

          <p className="mt-5 rounded-2xl bg-white/70 px-4 py-3 text-sm font-semibold text-rose-900">
            Denna tfilah har ställts in.
          </p>

          {canManage && onReactivate && (
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                void handleReactivate()
              }}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-rose-800 ring-1 ring-rose-200 disabled:opacity-60"
            >
              <RotateCcw className="h-4 w-4" />
              Återaktivera
            </button>
          )}

          {error && (
            <p className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-rose-800">
              {error}
            </p>
          )}
        </div>
      </article>
    )
  }

  return (
    <article
      className={`overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ${
        isKabbalatShabbat
          ? 'ring-[#68123f]/25'
          : 'ring-slate-200'
      }`}
    >
      {isKabbalatShabbat && (
        <div className="bg-[#68123f] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white">
          Erev Shabbat
        </div>
      )}

      <button
        type="button"
        onClick={() =>
          setDetailsOpen(
            (current) => !current,
          )
        }
        className="w-full p-4 text-left"
        aria-expanded={detailsOpen}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {tefila.day}
            </h2>

            <p className="mt-0.5 text-sm text-slate-500">
              {tefila.date}
            </p>

            {extraInfo && (
              <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-600">
                <span aria-hidden="true">🕯️</span>
                <span>
                  {extraInfo.label}
                </span>
                <span className="font-bold text-slate-900">
                  {extraInfo.value}
                </span>
              </p>
            )}

            <p
              className={`mt-3 font-bold ${
                isKabbalatShabbat
                  ? 'text-[#68123f]'
                  : 'text-[#183b70]'
              }`}
            >
              {tefila.title}
            </p>

            <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-600">
              <Clock className="h-4 w-4" />
              {tefila.time}
            </p>

          </div>

          <div>
            <div
              className={`min-w-24 rounded-2xl px-3 py-3 text-center ${attendanceColor}`}
            >
              <p className="text-xl font-black">
                {loading ? '–' : attendance}
              </p>

              <p className="text-[10px] font-bold uppercase tracking-wide">
                anmälda
              </p>
            </div>

            <p className="mt-2 flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400">
              {detailsOpen ? (
                <>
                  Dölj
                  <ChevronUp className="h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  Visa deltagare
                  <ChevronDown className="h-3.5 w-3.5" />
                </>
              )}
            </p>
          </div>
        </div>
      </button>

      {completed && (
        <div className="mx-4 mb-4 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
          <p className="font-bold">
            Minjan bekräftad i efterhand
          </p>

          <p className="mt-1">
            {minyanResult === 'confirmed'
              ? 'Det blev minjan.'
              : 'Det blev inte minjan.'}
            {actualAttendance !== undefined
              ? ` Faktiskt antal: ${actualAttendance}.`
              : ''}
          </p>
        </div>
      )}

      {canRegister && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={
              saving || loading || completed
            }
            onClick={() => {
              void handleOwnRegistration()
            }}
            className={`flex items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-bold transition disabled:opacity-60 ${
              registered
                ? 'bg-emerald-600 text-white'
                : isKabbalatShabbat
                  ? 'bg-[#68123f] text-white'
                  : 'bg-[#183b70] text-white'
            }`}
          >
            <Check className="h-4 w-4" />
            {registered
              ? 'Jag kommer'
              : 'Anmäl mig'}
          </button>

          <button
            type="button"
            disabled={
              saving || loading || completed
            }
            onClick={openGuestForm}
            className="flex items-center justify-center gap-2 rounded-2xl bg-sky-50 px-3 py-3 text-sm font-bold text-[#183b70] ring-1 ring-sky-100 disabled:opacity-60"
          >
            <Users className="h-4 w-4" />
            {currentGuestCount > 0
              ? `${currentGuestCount} gäster`
              : 'Lägg till gäster'}
          </button>
        </div>

        {registered && !completed && (
          <button
            type="button"
            disabled={saving}
            onClick={() => {
              void handleOwnRegistration()
            }}
            className="mt-3 w-full text-center text-xs font-semibold text-slate-500 underline underline-offset-4 disabled:opacity-60"
          >
            Ta bort min anmälan
          </button>
        )}

        {error && (
          <p className="mt-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
            {error}
          </p>
        )}
        </div>
      )}


      {detailsOpen && (
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-[#183b70]" />

            <h3 className="font-bold text-slate-900">
              Anmälda
            </h3>
          </div>

          <div className="mt-3 space-y-2">
            {registrations.map(
              (registration) => (
                <ParticipantRow
                  key={registration.id}
                  title={
                    registration.userName
                  }
                  guestCount={
                    registration.guestCount
                  }
                  guestComment={
                    registration.guestComment
                  }
                />
              ),
            )}

            {!loading &&
              registrations.length === 0 && (
                <p className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-500 ring-1 ring-slate-200">
                  Ingen är anmäld ännu.
                </p>
              )}
          </div>

          {canManage && (
            <div className="mt-4 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() =>
                  setAdminOpen(
                    (current) => !current,
                  )
                }
                className="flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-bold text-[#183b70] ring-1 ring-slate-200"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Hantera minjan
                </span>

                {adminOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {adminOpen && (
                <div className="mt-3 space-y-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                  <label className="block">
                    <span className="text-sm font-bold text-slate-700">
                      Faktiskt antal närvarande
                    </span>

                    <input
                      type="number"
                      min={0}
                      value={
                        draftActualAttendance
                      }
                      onChange={(event) =>
                        setDraftActualAttendance(
                          Math.max(
                            0,
                            Number(
                              event.target.value,
                            ),
                          ),
                        )
                      }
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-600"
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => {
                        void handleConfirm(
                          'confirmed',
                        )
                      }}
                      className="rounded-2xl bg-emerald-600 px-3 py-3 text-sm font-bold text-white disabled:opacity-60"
                    >
                      Det blev minjan
                    </button>

                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => {
                        void handleConfirm(
                          'notConfirmed',
                        )
                      }}
                      className="rounded-2xl bg-amber-100 px-3 py-3 text-sm font-bold text-amber-900 disabled:opacity-60"
                    >
                      Ingen minjan
                    </button>
                  </div>

                  {onCancel && (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => {
                        void handleCancel()
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800 disabled:opacity-60"
                    >
                      <XCircle className="h-4 w-4" />
                      Ställ in tfilan
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {canRegister &&
        guestFormOpen && (
        <div className="border-t border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900">
                Lägg till gäster
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Du registreras också som deltagare.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setGuestFormOpen(false)
              }
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600"
              aria-label="Stäng"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 p-3">
            <button
              type="button"
              onClick={() =>
                setDraftGuestCount(
                  (current) =>
                    Math.max(
                      0,
                      current - 1,
                    ),
                )
              }
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#183b70] shadow-sm ring-1 ring-slate-200"
            >
              <Minus className="h-5 w-5" />
            </button>

            <div className="text-center">
              <p className="text-3xl font-black text-[#183b70]">
                {draftGuestCount}
              </p>

              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                {draftGuestCount === 1
                  ? 'gäst'
                  : 'gäster'}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setDraftGuestCount(
                  (current) =>
                    Math.min(
                      50,
                      current + 1,
                    ),
                )
              }
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#183b70] shadow-sm ring-1 ring-slate-200"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          <label className="mt-4 block">
            <span className="text-sm font-bold text-slate-700">
              Kommentar, valfritt
            </span>

            <textarea
              value={draftGuestComment}
              onChange={(event) =>
                setDraftGuestComment(
                  event.target.value,
                )
              }
              rows={3}
              placeholder="Exempel: Turistgrupp från Israel eller Pappa"
              className="mt-2 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-sky-600"
            />
          </label>

          <button
            type="button"
            disabled={saving}
            onClick={() => {
              void saveGuests()
            }}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#183b70] px-4 py-3 font-bold text-white disabled:opacity-60"
          >
            <UserRound className="h-5 w-5" />
            {saving
              ? 'Sparar…'
              : 'Spara gäster'}
          </button>

          {currentGuestCount > 0 && (
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                void removeGuests()
              }}
              className="mt-3 w-full rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800 disabled:opacity-60"
            >
              Ta bort alla gäster
            </button>
          )}
        </div>
      )}
    </article>
  )
}

type ParticipantRowProps = {
  title: string
  guestCount: number
  guestComment?: string
}

function ParticipantRow({
  title,
  guestCount,
  guestComment,
}: ParticipantRowProps) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-[#183b70]">
          <UserRound className="h-5 w-5" />
        </div>

        <div>
          <p className="font-semibold text-slate-800">
            {title}
          </p>

          {guestCount > 0 && (
            <p className="mt-0.5 text-xs text-slate-500">
              Kommer med {guestCount}{' '}
              {guestCount === 1
                ? 'gäst'
                : 'gäster'}
            </p>
          )}
        </div>
      </div>

      {guestCount > 0 &&
        guestComment && (
          <p className="mt-3 rounded-xl bg-sky-50 px-3 py-2 text-xs text-slate-600">
            {guestComment}
          </p>
        )}
    </div>
  )
}

export default MinyanCard
