import { useState } from 'react'
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock3,
  Pencil,
  X,
} from 'lucide-react'
import DaySettingsEditor from '../components/DaySettingsEditor'
import LiveMinyanCard from '../components/LiveMinyanCard'
import { synagogueSettings } from '../data/settings'
import {
  saveTefila,
  type TefilaRecord,
} from '../services/tefilaService'
import type { Tefila } from '../types'
import { generateStandardTfilot } from '../utils/generateStandardTfilot'

type TefilaManagerPageProps = {
  onBack: () => void
}

type TefilaDayGroup = {
  dateValue: string
  day: string
  date: string
  tfilot: Tefila[]
}

const standardTfilot =
  generateStandardTfilot(new Date(), 90)

const upcomingTfilot =
  addKabbalatShabbat(standardTfilot)

const groupedTfilot =
  addShabbatGroups(
    groupTfilotByDate(upcomingTfilot),
  )

function TefilaManagerPage({
  onBack,
}: TefilaManagerPageProps) {
  const [editingId, setEditingId] =
    useState<string | null>(null)

  const [draftTime, setDraftTime] =
    useState('')

  const [savingId, setSavingId] =
    useState<string | null>(null)

  const [error, setError] =
    useState('')

  function startEditing(
    tefila: Tefila,
  ) {
    setEditingId(
      getTefilaId(tefila),
    )

    setDraftTime(
      normalizeTime(tefila.time),
    )

    setError('')
  }

  function stopEditing() {
    setEditingId(null)
    setDraftTime('')
    setError('')
  }

  async function saveTime(
    tefila: Tefila,
  ) {
    const normalizedTime =
      draftTime.trim()

    if (
      !/^\d{2}:\d{2}$/.test(
        normalizedTime,
      )
    ) {
      setError(
        'Skriv tiden i formatet HH:MM.',
      )
      return
    }

    const tefilaId =
      getTefilaId(tefila)

    setSavingId(tefilaId)
    setError('')

    try {
      const record: TefilaRecord = {
        id: tefilaId,
        title: tefila.title,
        date:
          tefila.dateValue ??
          tefila.date,
        time: normalizedTime,
        status: 'scheduled',
        allowRegistration: true,
      }

      await saveTefila(record)

      setEditingId(null)
      setDraftTime('')
    } catch (caughtError) {
      console.error(
        'Kunde inte ändra tiden:',
        caughtError,
      )

      setError(
        'Tiden kunde inte sparas.',
      )
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#183b70] shadow-sm ring-1 ring-slate-200"
          aria-label="Tillbaka"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-sky-700">
            Administration
          </p>

          <h1 className="text-2xl font-bold text-[#183b70]">
            Tfilot
          </h1>
        </div>
      </header>

      <section className="rounded-3xl bg-sky-50 p-5 ring-1 ring-sky-100">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-[#183b70]">
            <CalendarDays className="h-5 w-5" />
          </div>

          <div>
            <p className="font-bold text-[#183b70]">
              Kommande tre månader
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              Ändringar gäller bara det valda datumet
              eller den valda tfilan.
            </p>
          </div>
        </div>
      </section>

      {error && (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
          {error}
        </p>
      )}

      <section className="space-y-7">
        {groupedTfilot.map((group) => (
          <div
            key={group.dateValue}
            className="space-y-3"
          >
            <div className="px-1">
              <p className="text-sm font-semibold text-sky-700">
                {group.day}
              </p>

              <h2 className="text-xl font-bold text-[#183b70]">
                {group.date}
              </h2>
            </div>

            <DaySettingsEditor
              dateValue={group.dateValue}
            />

            {group.tfilot.length === 0 && (
              <div className="rounded-3xl bg-[#68123f] p-5 text-white shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-rose-100">
                  Shabbat
                </p>

                <h3 className="mt-2 text-xl font-bold">
                  Redigera Shabbat-programmet i
                  dagsinställningarna
                </h3>

                <p className="mt-2 text-sm leading-6 text-rose-100">
                  Här visas ingen minjananmälan.
                  Predikan, högtid, tider och
                  kommentar hanteras för hela dagen.
                </p>
              </div>
            )}

            {group.tfilot.map(
              (tefila) => {
                const tefilaId =
                  getTefilaId(tefila)

                const isEditing =
                  editingId ===
                  tefilaId

                const isSaving =
                  savingId ===
                  tefilaId

                return (
                  <div
                    key={tefila.id}
                    className="space-y-2"
                  >
                    <LiveMinyanCard
                      tefila={tefila}
                      showAdminControls
                    />

                    {isEditing ? (
                      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                        <label className="block">
                          <span className="flex items-center gap-2 text-sm font-bold text-slate-700">
                            <Clock3 className="h-4 w-4" />
                            Ny tid
                          </span>

                          <input
                            type="time"
                            value={
                              draftTime
                            }
                            onChange={(
                              event,
                            ) =>
                              setDraftTime(
                                event
                                  .target
                                  .value,
                              )
                            }
                            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-600"
                          />
                        </label>

                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            disabled={
                              isSaving
                            }
                            onClick={() => {
                              void saveTime(
                                tefila,
                              )
                            }}
                            className="flex items-center justify-center gap-2 rounded-2xl bg-[#183b70] px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
                          >
                            <Check className="h-4 w-4" />

                            {isSaving
                              ? 'Sparar…'
                              : 'Spara tid'}
                          </button>

                          <button
                            type="button"
                            disabled={
                              isSaving
                            }
                            onClick={
                              stopEditing
                            }
                            className="flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 disabled:opacity-60"
                          >
                            <X className="h-4 w-4" />
                            Avbryt
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          startEditing(
                            tefila,
                          )
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-[#183b70] shadow-sm ring-1 ring-slate-200"
                      >
                        <Pencil className="h-4 w-4" />
                        Ändra tid för denna tfilah
                      </button>
                    )}
                  </div>
                )
              },
            )}
          </div>
        ))}
      </section>
    </div>
  )
}

function groupTfilotByDate(
  tfilot: Tefila[],
): TefilaDayGroup[] {
  const groups = new Map<
    string,
    TefilaDayGroup
  >()

  for (const tefila of tfilot) {
    const dateValue =
      tefila.dateValue

    if (!dateValue) {
      continue
    }

    const existing =
      groups.get(dateValue)

    if (existing) {
      existing.tfilot.push(tefila)
      continue
    }

    groups.set(dateValue, {
      dateValue,
      day: tefila.day,
      date: tefila.date,
      tfilot: [tefila],
    })
  }

  return Array.from(
    groups.values(),
  ).sort((first, second) =>
    first.dateValue.localeCompare(
      second.dateValue,
    ),
  )
}

function addShabbatGroups(
  groups: TefilaDayGroup[],
): TefilaDayGroup[] {
  if (groups.length === 0) {
    return groups
  }

  const firstDate = new Date(
    `${groups[0].dateValue}T12:00:00`,
  )

  const lastDate = new Date(
    `${groups[
      groups.length - 1
    ].dateValue}T12:00:00`,
  )

  const existingDates = new Set(
    groups.map(
      (group) => group.dateValue,
    ),
  )

  const result = [...groups]

  const current = new Date(firstDate)

  while (current <= lastDate) {
    if (current.getDay() === 6) {
      const dateValue =
        formatDateValue(current)

      if (!existingDates.has(dateValue)) {
        result.push({
          dateValue,
          day: 'Lördag',
          date:
            formatSwedishDate(current),
          tfilot: [],
        })
      }
    }

    current.setDate(
      current.getDate() + 1,
    )
  }

  return result.sort(
    (first, second) =>
      first.dateValue.localeCompare(
        second.dateValue,
      ),
  )
}

function formatDateValue(
  date: Date,
): string {
  const year = date.getFullYear()

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0')

  const day = String(
    date.getDate(),
  ).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getTefilaId(
  tefila: Tefila,
): string {
  return (
    tefila.firestoreId ??
    `tefila-${tefila.id}`
  )
}

function addKabbalatShabbat(
  tfilot: Tefila[],
): Tefila[] {
  const kabbalatTime =
    getKabbalatShabbatTime()

  const fridayDates = Array.from(
    new Set(
      tfilot
        .filter(
          (tefila) =>
            tefila.day ===
              'Fredag' &&
            tefila.dateValue,
        )
        .map(
          (tefila) =>
            tefila.dateValue as string,
        ),
    ),
  )

  const kabbalatTfilot =
    fridayDates.map(
      (dateValue) => {
        const date = new Date(
          `${dateValue}T12:00:00`,
        )

        return {
          id: `${dateValue}-kabbalat-shabbat`,
          firestoreId:
            `${dateValue}-kabbalat-shabbat`,
          dateValue,
          day: 'Fredag',
          date:
            formatSwedishDate(
              date,
            ),
          title:
            'Kabbalat Shabbat',
          time: kabbalatTime,
          attending: 0,
        } satisfies Tefila
      },
    )

  return [
    ...tfilot,
    ...kabbalatTfilot,
  ].sort((first, second) => {
    const firstDate =
      first.dateValue ?? ''

    const secondDate =
      second.dateValue ?? ''

    const dateComparison =
      firstDate.localeCompare(
        secondDate,
      )

    if (dateComparison !== 0) {
      return dateComparison
    }

    return normalizeTime(
      first.time,
    ).localeCompare(
      normalizeTime(second.time),
    )
  })
}

function getKabbalatShabbatTime(): string {
  const schedule =
    synagogueSettings.schedule as
      typeof synagogueSettings.schedule & {
        kabbalatShabbat?: string
      }

  return (
    schedule.kabbalatShabbat ??
    '19.30'
  )
}

function normalizeTime(
  value: string,
): string {
  return value.replace('.', ':')
}

function formatSwedishDate(
  date: Date,
): string {
  return new Intl.DateTimeFormat(
    'sv-SE',
    {
      day: 'numeric',
      month: 'long',
    },
  ).format(date)
}

export default TefilaManagerPage
