import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import type {
  FormEvent,
} from 'react'
import {
  ArrowLeft,
  CalendarDays,
  Edit3,
  MoveRight,
  Plus,
  Trash2,
  Wine,
  X,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import {
  createKiddushRequest,
  deleteKiddush,
  moveKiddush,
  subscribeToAllKiddush,
  updateApprovedKiddush,
  type KiddushBooking,
} from '../services/kiddushService'
import { generateKiddushDates } from '../utils/generateKiddushDates'

type KiddushAdminPageProps = {
  onBack: () => void
}

type AdminMode =
  | 'edit'
  | 'move'
  | 'create'
  | null

function KiddushAdminPage({
  onBack,
}: KiddushAdminPageProps) {
  const { firebaseUser, profile } = useAuth()

  const [bookings, setBookings] =
    useState<KiddushBooking[]>([])

  const [selectedBooking, setSelectedBooking] =
    useState<KiddushBooking | null>(null)

  const [selectedDate, setSelectedDate] =
    useState('')

  const [mode, setMode] =
    useState<AdminMode>(null)

  const [sponsor, setSponsor] =
    useState('')

  const [dedication, setDedication] =
    useState('')

  const [comment, setComment] =
    useState('')

  const [moveToDate, setMoveToDate] =
    useState('')

  const [error, setError] =
    useState('')

  const [saving, setSaving] =
    useState(false)

  useEffect(() => {
    return subscribeToAllKiddush(
      setBookings,
      (caughtError) => {
        console.error(
          'Kunde inte läsa Kiddushbokningar:',
          caughtError,
        )

        setError(
          'Kiddushbokningarna kunde inte hämtas.',
        )
      },
    )
  }, [])

  const generatedDates =
    useMemo(
      () => generateKiddushDates(),
      [],
    )

  const bookedDates =
    useMemo(
      () =>
        new Set(
          bookings.map(
            (booking) => booking.date,
          ),
        ),
      [bookings],
    )

  const availableDates =
    useMemo(
      () =>
        generatedDates.filter(
          (item) =>
            !bookedDates.has(
              item.dateValue,
            ),
        ),
      [
        generatedDates,
        bookedDates,
      ],
    )

  const occasionByDate =
    useMemo(
      () =>
        new Map(
          generatedDates.map(
            (item) => [
              item.dateValue,
              item,
            ],
          ),
        ),
      [generatedDates],
    )

  function closeModal() {
    setMode(null)
    setSelectedBooking(null)
    setSelectedDate('')
    setSponsor('')
    setDedication('')
    setComment('')
    setMoveToDate('')
    setError('')
  }

  function openEdit(
    booking: KiddushBooking,
  ) {
    setSelectedBooking(booking)
    setSponsor(
      booking.sponsor ?? '',
    )
    setDedication(
      booking.dedication ?? '',
    )
    setComment(
      booking.comment ?? '',
    )
    setError('')
    setMode('edit')
  }

  function openMove(
    booking: KiddushBooking,
  ) {
    setSelectedBooking(booking)
    setMoveToDate('')
    setError('')
    setMode('move')
  }

  function openCreate(
    date: string,
  ) {
    setSelectedDate(date)
    setSponsor('')
    setDedication('')
    setComment('')
    setError('')
    setMode('create')
  }

  async function handleEdit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (!selectedBooking) {
      return
    }

    if (!sponsor.trim()) {
      setError(
        'Skriv namn eller familj.',
      )
      return
    }

    setSaving(true)
    setError('')

    try {
      await updateApprovedKiddush({
        date:
          selectedBooking.date,
        sponsor: sponsor.trim(),
        dedication:
          dedication.trim() ||
          undefined,
        comment:
          comment.trim() ||
          undefined,
      })

      closeModal()
    } catch (caughtError) {
      console.error(caughtError)

      setError(
        'Kunde inte spara ändringen.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleMove() {
    if (
      !selectedBooking ||
      !moveToDate
    ) {
      setError(
        'Välj ett nytt datum.',
      )
      return
    }

    setSaving(true)
    setError('')

    try {
      await moveKiddush(
        selectedBooking.date,
        moveToDate,
      )

      closeModal()
    } catch (caughtError) {
      console.error(caughtError)

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Kunde inte flytta Kiddush.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(
    booking: KiddushBooking,
  ) {
    const confirmed =
      window.confirm(
        `Ta bort Kiddushbokningen för ${formatDate(booking.date)}?`,
      )

    if (!confirmed) {
      return
    }

    try {
      await deleteKiddush(
        booking.date,
      )
    } catch (caughtError) {
      console.error(caughtError)

      setError(
        'Kunde inte ta bort Kiddush.',
      )
    }
  }

  async function handleCreate(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (!firebaseUser) {
      setError(
        'Ingen inloggad administratör hittades.',
      )
      return
    }

    if (!selectedDate) {
      return
    }

    if (!sponsor.trim()) {
      setError(
        'Skriv namn eller familj.',
      )
      return
    }

    setSaving(true)
    setError('')

    try {
      await createKiddushRequest({
        date: selectedDate,
        sponsor: sponsor.trim(),
        dedication:
          dedication.trim() ||
          undefined,
        comment:
          comment.trim() ||
          undefined,
        requestedBy:
          firebaseUser.uid,
        requestedByName:
          profile?.name ||
          undefined,
      })

      closeModal()
    } catch (caughtError) {
      console.error(caughtError)

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Kunde inte boka Kiddush.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-200"
          aria-label="Tillbaka"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div>
          <p className="text-sm font-semibold text-[#68123f]">
            Admin
          </p>

          <h1 className="text-2xl font-bold text-[#183b70]">
            Hantera Kiddush
          </h1>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3">
        <SummaryCard
          label="Bokade"
          value={bookings.length}
          icon={<Wine className="h-5 w-5" />}
        />

        <SummaryCard
          label="Lediga"
          value={availableDates.length}
          icon={
            <CalendarDays className="h-5 w-5" />
          }
        />
      </section>

      {error && !mode && (
        <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800 ring-1 ring-rose-200">
          {error}
        </div>
      )}

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
          Bokade Kiddush
        </h2>

        {bookings.length === 0 ? (
          <div className="rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200">
            <Wine className="mx-auto h-7 w-7 text-slate-400" />

            <p className="mt-3 text-sm text-slate-500">
              Det finns inga bokade Kiddush.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map(
              (booking) => {
                const occasion =
                  occasionByDate.get(
                    booking.date,
                  )

                return (
                  <article
                    key={booking.id}
                    className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
                  >
                    <p className="text-sm font-bold text-[#68123f]">
                      {formatDate(
                        booking.date,
                      )}
                    </p>

                    {occasion && (
                      <p className="mt-1 text-sm text-slate-500">
                        {
                          occasion.occasion
                        }
                      </p>
                    )}

                    <p className="mt-4 text-lg font-bold text-[#183b70]">
                      {booking.sponsor}
                    </p>

                    {booking.dedication && (
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {
                          booking.dedication
                        }
                      </p>
                    )}

                    {booking.comment && (
                      <div className="mt-3 rounded-2xl bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500">
                        Intern kommentar: {
                          booking.comment
                        }
                      </div>
                    )}

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <ActionButton
                        icon={
                          <Edit3 className="h-4 w-4" />
                        }
                        label="Redigera"
                        onClick={() =>
                          openEdit(
                            booking,
                          )
                        }
                      />

                      <ActionButton
                        icon={
                          <MoveRight className="h-4 w-4" />
                        }
                        label="Flytta"
                        onClick={() =>
                          openMove(
                            booking,
                          )
                        }
                      />

                      <ActionButton
                        icon={
                          <Trash2 className="h-4 w-4" />
                        }
                        label="Ta bort"
                        danger
                        onClick={() =>
                          handleDelete(
                            booking,
                          )
                        }
                      />
                    </div>
                  </article>
                )
              },
            )}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
          Lediga datum
        </h2>

        <div className="space-y-2">
          {availableDates
            .slice(0, 12)
            .map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  openCreate(
                    item.dateValue,
                  )
                }
                className="flex w-full items-center justify-between rounded-2xl bg-white px-4 py-4 text-left shadow-sm ring-1 ring-slate-200"
              >
                <div>
                  <p className="font-bold text-slate-800">
                    {item.date}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {item.occasion}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-sm font-bold text-emerald-700">
                  <Plus className="h-4 w-4" />
                  Boka
                </div>
              </button>
            ))}
        </div>
      </section>

      {mode && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 px-3 pt-10 backdrop-blur-sm sm:items-center">
          <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-[#f8fafc] p-5 shadow-2xl sm:rounded-3xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#68123f]">
                  Kiddush
                </p>

                <h2 className="mt-1 text-xl font-bold text-[#183b70]">
                  {mode === 'edit'
                    ? 'Redigera bokning'
                    : mode === 'move'
                      ? 'Flytta Kiddush'
                      : 'Boka åt medlem'}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {mode === 'move' &&
              selectedBooking && (
                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Från
                    </p>

                    <p className="mt-1 font-bold text-slate-800">
                      {formatDate(
                        selectedBooking.date,
                      )}
                    </p>
                  </div>

                  <label className="block">
                    <span className="text-sm font-bold text-slate-700">
                      Nytt datum
                    </span>

                    <select
                      value={moveToDate}
                      onChange={(event) =>
                        setMoveToDate(
                          event.target.value,
                        )
                      }
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
                    >
                      <option value="">
                        Välj datum
                      </option>

                      {availableDates.map(
                        (item) => (
                          <option
                            key={item.id}
                            value={
                              item.dateValue
                            }
                          >
                            {item.date} –{' '}
                            {item.occasion}
                          </option>
                        ),
                      )}
                    </select>
                  </label>

                  {error && (
                    <ErrorMessage
                      message={error}
                    />
                  )}

                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleMove}
                    className="w-full rounded-2xl bg-[#68123f] px-5 py-4 font-bold text-white disabled:opacity-60"
                  >
                    Flytta Kiddush
                  </button>
                </div>
              )}

            {(mode === 'edit' ||
              mode === 'create') && (
              <form
                onSubmit={
                  mode === 'edit'
                    ? handleEdit
                    : handleCreate
                }
                className="mt-6 space-y-4"
              >
                {mode === 'create' && (
                  <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                    <p className="font-bold text-slate-800">
                      {formatDate(
                        selectedDate,
                      )}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {
                        occasionByDate.get(
                          selectedDate,
                        )?.occasion
                      }
                    </p>
                  </div>
                )}

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">
                    Namn eller familj
                  </span>

                  <input
                    value={sponsor}
                    onChange={(event) =>
                      setSponsor(
                        event.target.value,
                      )
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
                    placeholder="Familjen Meisels"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">
                    Anledning eller dedikation
                  </span>

                  <textarea
                    value={dedication}
                    onChange={(event) =>
                      setDedication(
                        event.target.value,
                      )
                    }
                    rows={3}
                    className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">
                    Intern kommentar
                  </span>

                  <textarea
                    value={comment}
                    onChange={(event) =>
                      setComment(
                        event.target.value,
                      )
                    }
                    rows={3}
                    className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3"
                  />
                </label>

                {error && (
                  <ErrorMessage
                    message={error}
                  />
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-2xl bg-[#68123f] px-5 py-4 font-bold text-white disabled:opacity-60"
                >
                  {saving
                    ? 'Sparar…'
                    : mode === 'edit'
                      ? 'Spara ändringar'
                      : 'Boka Kiddush'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string
  value: number
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="text-[#68123f]">
        {icon}
      </div>

      <p className="mt-3 text-2xl font-black text-[#183b70]">
        {value}
      </p>

      <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
    </div>
  )
}

function ActionButton({
  icon,
  label,
  onClick,
  danger = false,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-1 rounded-xl px-2 py-2.5 text-xs font-bold ${
        danger
          ? 'bg-rose-50 text-rose-700'
          : 'bg-slate-100 text-slate-700'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

function ErrorMessage({
  message,
}: {
  message: string
}) {
  return (
    <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
      {message}
    </div>
  )
}

function formatDate(
  dateValue: string,
): string {
  return new Intl.DateTimeFormat(
    'sv-SE',
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    },
  ).format(
    new Date(
      `${dateValue}T12:00:00`,
    ),
  )
}

export default KiddushAdminPage
