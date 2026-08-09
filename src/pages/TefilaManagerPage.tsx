import {
  useEffect,
  useMemo,
  useState,
} from 'react'
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
import TefilaInvitePanel from '../components/TefilaInvitePanel'
import { synagogueSettings } from '../data/settings'
import { getHebcalDayInfo } from '../services/hebcalService'
import {
  saveTefila,
  subscribeToTfilotBetween,
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

type TefilaManagerTab =
  | 'shabbat'
  | 'weekdays'

const standardTfilot =
  generateStandardTfilot(new Date(), 90)

const upcomingTfilot =
  addKabbalatShabbat(standardTfilot)

function TefilaManagerPage({
  onBack,
}: TefilaManagerPageProps) {
  const [
    firebaseTfilot,
    setFirebaseTfilot,
  ] = useState<TefilaRecord[]>([])

  useEffect(() => {
    const today = new Date()

    const endDate =
      new Date(today)

    endDate.setDate(
      endDate.getDate() + 90,
    )

    return subscribeToTfilotBetween(
      formatDateValue(today),
      formatDateValue(endDate),
      setFirebaseTfilot,
      (caughtError) => {
        console.error(
          'Kunde inte läsa tfilot till admin:',
          caughtError,
        )
      },
    )
  }, [])

  const mergedAdminTfilot =
    useMemo(() => {
      const firebaseById =
        new Map(
          firebaseTfilot.map(
            (record) => [
              record.id,
              record,
            ],
          ),
        )

      const standardIds =
        new Set<string>()

      const mergedStandard =
        upcomingTfilot.map(
          (tefila): Tefila => {
            const tefilaId =
              getTefilaId(tefila)

            standardIds.add(
              tefilaId,
            )

            const record =
              firebaseById.get(
                tefilaId,
              )

            if (!record) {
              return tefila
            }

            const date =
              new Date(
                `${record.date}T12:00:00`,
              )

            return {
              ...tefila,
              id: tefilaId,
              firestoreId:
                record.id,
              title:
                record.title,
              time:
                record.time,
              dateValue:
                record.date,
              day:
                formatSwedishWeekday(
                  date,
                ),
              date:
                formatSwedishDate(
                  date,
                ),
            }
          },
        )

      const customTfilot =
        firebaseTfilot
          .filter(
            (record) =>
              !standardIds.has(
                record.id,
              ),
          )
          .map(
            (record): Tefila => {
              const date =
                new Date(
                  `${record.date}T12:00:00`,
                )

              return {
                id: record.id,
                firestoreId:
                  record.id,
                dateValue:
                  record.date,
                day:
                  formatSwedishWeekday(
                    date,
                  ),
                date:
                  formatSwedishDate(
                    date,
                  ),
                title:
                  record.title,
                time:
                  record.time,
                attending: 0,
              }
            },
          )

      return [
        ...mergedStandard,
        ...customTfilot,
      ].sort(
        (first, second) => {
          const dateCompare =
            (
              first.dateValue ?? ''
            ).localeCompare(
              second.dateValue ?? '',
            )

          if (dateCompare !== 0) {
            return dateCompare
          }

          return normalizeTime(
            first.time,
          ).localeCompare(
            normalizeTime(
              second.time,
            ),
          )
        },
      )
    }, [firebaseTfilot])

  const groupedTfilot =
    useMemo(
      () =>
        addShabbatGroups(
          groupTfilotByDate(
            mergedAdminTfilot,
          ),
        ).filter(
          (group) => {
            const today =
              formatDateValue(
                new Date(),
              )

            return (
              group.dateValue >=
              today
            )
          },
        ),
      [mergedAdminTfilot],
    )

  const [editingId, setEditingId] =
    useState<string | null>(null)

  const [draftTime, setDraftTime] =
    useState('')

  const [savingId, setSavingId] =
    useState<string | null>(null)

  const [error, setError] =
    useState('')

  const [tab, setTab] =
    useState<TefilaManagerTab>('shabbat')

  const shabbatGroups =
    groupedTfilot
      .map((group) => {
        const date =
          new Date(
            `${group.dateValue}T12:00:00`,
          )

        const weekday =
          date.getDay()

        const hebcal =
          getHebcalDayInfo(
            group.dateValue,
          )

        // Lördag: hela gruppen
        if (weekday === 6) {
          return group
        }

        // Fredag: bara Kabbalat Shabbat
        if (weekday === 5) {
          const kabbalat =
            group.tfilot.filter(
              (tefila) =>
                isKabbalatShabbat(
                  tefila,
                ),
            )

          return kabbalat.length > 0
            ? {
                ...group,
                tfilot: kabbalat,
              }
            : null
        }

        // Övriga riktiga helgdagar
        const isActualHoliday =
          hebcal.holidayNames.length > 0 &&
          !hebcal.isErevHoliday

        return isActualHoliday
          ? group
          : null
      })
      .filter(
        (
          group,
        ): group is TefilaDayGroup =>
          group !== null,
      )

  const weekdayGroups =
    groupedTfilot
      .map((group) => {
        const date =
          new Date(
            `${group.dateValue}T12:00:00`,
          )

        const weekday =
          date.getDay()

        const hebcal =
          getHebcalDayInfo(
            group.dateValue,
          )

        // Lördag ska aldrig ligga här
        if (weekday === 6) {
          return null
        }

        // Fredag: allt utom Kabbalat Shabbat
        if (weekday === 5) {
          const weekdayTfilot =
            group.tfilot.filter(
              (tefila) =>
                !isKabbalatShabbat(
                  tefila,
                ),
            )

          return weekdayTfilot.length > 0
            ? {
                ...group,
                tfilot: weekdayTfilot,
              }
            : null
        }

        // Övriga riktiga helgdagar
        const isActualHoliday =
          hebcal.holidayNames.length > 0 &&
          !hebcal.isErevHoliday

        if (isActualHoliday) {
          return null
        }

        return group
      })
      .filter(
        (
          group,
        ): group is TefilaDayGroup =>
          group !== null,
      )

  const visibleGroups =
    tab === 'shabbat'
      ? shabbatGroups
      : weekdayGroups

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

      <div className="grid grid-cols-2 rounded-2xl bg-slate-200/70 p-1">
        <button
          type="button"
          onClick={() =>
            setTab('shabbat')
          }
          className={`rounded-xl px-3 py-3 text-sm font-bold ${
            tab === 'shabbat'
              ? 'bg-white text-[#183b70] shadow-sm'
              : 'text-slate-500'
          }`}
        >
          Shabbat & helger
        </button>

        <button
          type="button"
          onClick={() =>
            setTab('weekdays')
          }
          className={`rounded-xl px-3 py-3 text-sm font-bold ${
            tab === 'weekdays'
              ? 'bg-white text-[#183b70] shadow-sm'
              : 'text-slate-500'
          }`}
        >
          Vardagar
        </button>
      </div>

      <section className="space-y-7">
        {visibleGroups.map((group) => (
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
                      <>
                        <TefilaInvitePanel
                          tefila={tefila}
                        />

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
                      </>
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

function formatSwedishWeekday(
  date: Date,
): string {
  const weekday =
    new Intl.DateTimeFormat(
      'sv-SE',
      {
        weekday: 'long',
      },
    ).format(date)

  return (
    weekday.charAt(0).toUpperCase() +
    weekday.slice(1)
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

function isKabbalatShabbat(
  tefila: Tefila,
): boolean {
  const id =
    String(
      tefila.firestoreId ??
        tefila.id,
    ).toLowerCase()

  return (
    tefila.title
      .toLowerCase()
      .includes(
        'kabbalat shabbat',
      ) ||
    id.includes(
      'kabbalat-shabbat',
    )
  )
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
