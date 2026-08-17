import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react'
import {
  getTfilotBetween,
  type TefilaRecord,
} from '../services/tefilaService'

type MinyanStatisticsPageProps = {
  onBack: () => void
}

type Period =
  | '7'
  | '30'
  | '90'
  | '365'
  | 'all'

const periodOptions: {
  value: Period
  label: string
}[] = [
  {
    value: '7',
    label: '7 dagar',
  },
  {
    value: '30',
    label: '30 dagar',
  },
  {
    value: '90',
    label: '3 mån',
  },
  {
    value: '365',
    label: '12 mån',
  },
  {
    value: 'all',
    label: 'Totalt',
  },
]

function toDateValue(
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

function dateDaysAgo(
  days: number,
): string {
  const date = new Date()

  date.setHours(
    12,
    0,
    0,
    0,
  )

  date.setDate(
    date.getDate() - days,
  )

  return toDateValue(date)
}

function formatShortDate(
  dateValue: string,
): string {
  return new Intl.DateTimeFormat(
    'sv-SE',
    {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    },
  )
    .format(
      new Date(
        `${dateValue}T12:00:00`,
      ),
    )
    .replace('.', '')
}

function MinyanStatisticsPage({
  onBack,
}: MinyanStatisticsPageProps) {
  const [
    records,
    setRecords,
  ] = useState<TefilaRecord[]>([])

  const [
    period,
    setPeriod,
  ] = useState<Period>('30')

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    error,
    setError,
  ] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError('')

      try {
        const items =
          await getTfilotBetween(
            '2020-01-01',
            toDateValue(
              new Date(),
            ),
          )

        if (active) {
          setRecords(items)
        }
      } catch (caughtError) {
        console.error(
          'Kunde inte läsa minjanstatistik:',
          caughtError,
        )

        if (active) {
          setError(
            'Statistiken kunde inte hämtas.',
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [])

  const completedRecords =
    useMemo(
      () =>
        records.filter(
          (record) =>
            record.status ===
              'completed' &&
            typeof record
              .actualAttendance ===
              'number',
        ),
      [records],
    )

  const filteredRecords =
    useMemo(() => {
      if (period === 'all') {
        return completedRecords
      }

      const start =
        dateDaysAgo(
          Number(period) - 1,
        )

      return completedRecords.filter(
        (record) =>
          record.date >= start,
      )
    }, [
      completedRecords,
      period,
    ])

  const stats = useMemo(() => {
    if (
      filteredRecords.length === 0
    ) {
      return {
        total: 0,
        minyanCount: 0,
        percentage: 0,
        average: 0,
        highest: 0,
        lowest: 0,
      }
    }

    const values =
      filteredRecords.map(
        (record) =>
          record.actualAttendance ??
          0,
      )

    const minyanCount =
      filteredRecords.filter(
        (record) =>
          record.minyanResult ===
            'confirmed' ||
          (record.actualAttendance ??
            0) >= 10,
      ).length

    const sum =
      values.reduce(
        (total, value) =>
          total + value,
        0,
      )

    return {
      total:
        filteredRecords.length,

      minyanCount,

      percentage:
        (minyanCount /
          filteredRecords.length) *
        100,

      average:
        sum /
        filteredRecords.length,

      highest:
        Math.max(...values),

      lowest:
        Math.min(...values),
    }
  }, [filteredRecords])

  const recentSeven =
    useMemo(
      () =>
        [...completedRecords]
          .sort(
            (
              first,
              second,
            ) =>
              `${second.date}-${second.time}`.localeCompare(
                `${first.date}-${first.time}`,
              ),
          )
          .slice(0, 7),
      [completedRecords],
    )

  const graphRecords =
    useMemo(
      () =>
        [...filteredRecords]
          .sort(
            (
              first,
              second,
            ) =>
              `${first.date}-${first.time}`.localeCompare(
                `${second.date}-${second.time}`,
              ),
          )
          .slice(-20),
      [filteredRecords],
    )

  const graphMax =
    Math.max(
      12,
      ...graphRecords.map(
        (record) =>
          record.actualAttendance ??
          0,
      ),
    )

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-bold text-[#183b70]"
      >
        <ArrowLeft className="h-4 w-4" />
        Tillbaka
      </button>

      <header>
        <p className="text-sm font-semibold text-sky-700">
          Administration
        </p>

        <h1 className="text-2xl font-bold text-[#183b70]">
          Minjanstatistik
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Statistik baserad på faktisk
          närvaro.
        </p>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {periodOptions.map(
          (option) => (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                setPeriod(
                  option.value,
                )
              }
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${
                period ===
                option.value
                  ? 'bg-[#183b70] text-white'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200'
              }`}
            >
              {option.label}
            </button>
          ),
        )}
      </div>

      {loading && (
        <section className="rounded-3xl bg-white p-6 text-center text-sm font-semibold text-slate-500 shadow-sm ring-1 ring-slate-200">
          Hämtar statistik…
        </section>
      )}

      {error && (
        <section className="rounded-3xl bg-rose-50 p-5 text-sm font-semibold text-rose-800 ring-1 ring-rose-200">
          {error}
        </section>
      )}

      {!loading &&
        !error &&
        filteredRecords.length ===
          0 && (
          <section className="rounded-3xl bg-white p-7 text-center shadow-sm ring-1 ring-slate-200">
            <Users className="mx-auto h-8 w-8 text-slate-300" />

            <p className="mt-3 font-bold text-slate-800">
              Ingen statistik ännu
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Här visas tfilot där
              faktisk närvaro har
              registrerats.
            </p>
          </section>
        )}

      {!loading &&
        !error &&
        filteredRecords.length >
          0 && (
          <>
            <section className="grid grid-cols-2 gap-3">
              <StatCard
                icon={
                  <CheckCircle2 className="h-5 w-5" />
                }
                label="Minjan"
                value={`${Math.round(
                  stats.percentage,
                )} %`}
                detail={`${stats.minyanCount} av ${stats.total}`}
                positive
              />

              <StatCard
                icon={
                  <Users className="h-5 w-5" />
                }
                label="Snitt"
                value={stats.average.toLocaleString(
                  'sv-SE',
                  {
                    minimumFractionDigits:
                      1,
                    maximumFractionDigits:
                      1,
                  },
                )}
                detail="personer"
              />

              <StatCard
                icon={
                  <TrendingUp className="h-5 w-5" />
                }
                label="Flest"
                value={String(
                  stats.highest,
                )}
                detail="personer"
              />

              <StatCard
                icon={
                  <XCircle className="h-5 w-5" />
                }
                label="Lägst"
                value={String(
                  stats.lowest,
                )}
                detail="personer"
              />
            </section>

            {recentSeven.length >
              0 && (
              <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <h2 className="font-bold text-[#183b70]">
                  Senaste 7 tillfällena
                </h2>

                <div className="mt-4 space-y-2">
                  {recentSeven.map(
                    (record) => {
                      const attendance =
                        record
                          .actualAttendance ??
                        0

                      const hasMinyan =
                        record
                          .minyanResult ===
                          'confirmed' ||
                        attendance >= 10

                      return (
                        <div
                          key={
                            record.id
                          }
                          className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3"
                        >
                          <div className="min-w-0">
                            <p className="font-bold capitalize text-slate-800">
                              {formatShortDate(
                                record.date,
                              )}
                            </p>

                            <p className="mt-0.5 truncate text-xs text-slate-500">
                              {
                                record.title
                              }
                            </p>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            <span
                              className={`flex h-7 w-7 items-center justify-center rounded-full ${
                                hasMinyan
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-rose-100 text-rose-700'
                              }`}
                            >
                              {hasMinyan ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : (
                                <XCircle className="h-4 w-4" />
                              )}
                            </span>

                            <span className="min-w-7 text-right text-lg font-black text-slate-900">
                              {
                                attendance
                              }
                            </span>
                          </div>
                        </div>
                      )
                    },
                  )}
                </div>
              </section>
            )}

            {graphRecords.length >
              1 && (
              <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-[#183b70]">
                      Närvaro
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Senaste{' '}
                      {
                        graphRecords.length
                      }{' '}
                      tillfällena i vald
                      period
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5 text-xs font-bold text-emerald-700">
                    <span className="h-0.5 w-5 bg-emerald-500" />
                    Minjan 10
                  </div>
                </div>

                <div className="relative mt-6 h-48">
                  <div
                    className="absolute left-0 right-0 border-t-2 border-dashed border-emerald-300"
                    style={{
                      bottom: `${
                        (10 /
                          graphMax) *
                        100
                      }%`,
                    }}
                  />

                  <div className="absolute inset-0 flex items-end gap-1.5">
                    {graphRecords.map(
                      (record) => {
                        const value =
                          record
                            .actualAttendance ??
                          0

                        const hasMinyan =
                          record
                            .minyanResult ===
                            'confirmed' ||
                          value >= 10

                        return (
                          <div
                            key={
                              record.id
                            }
                            className="flex h-full min-w-0 flex-1 items-end"
                            title={`${record.date}: ${value}`}
                          >
                            <div
                              className={`w-full rounded-t-md ${
                                hasMinyan
                                  ? 'bg-emerald-500'
                                  : 'bg-rose-400'
                              }`}
                              style={{
                                height: `${Math.max(
                                  4,
                                  (value /
                                    graphMax) *
                                    100,
                                )}%`,
                              }}
                            />
                          </div>
                        )
                      },
                    )}
                  </div>
                </div>
              </section>
            )}
          </>
        )}
    </div>
  )
}

type StatCardProps = {
  icon: ReactNode
  label: string
  value: string
  detail: string
  positive?: boolean
}

function StatCard({
  icon,
  label,
  value,
  detail,
  positive = false,
}: StatCardProps) {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-2xl ${
          positive
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-sky-100 text-[#183b70]'
        }`}
      >
        {icon}
      </div>

      <p className="mt-3 text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-2xl font-black text-slate-900">
        {value}
      </p>

      <p className="text-xs font-semibold text-slate-500">
        {detail}
      </p>
    </div>
  )
}

export default MinyanStatisticsPage
