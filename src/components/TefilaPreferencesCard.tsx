import {
  Bell,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Plane,
} from 'lucide-react'
import {
  useEffect,
  useState,
} from 'react'
import {
  saveTefilaPreferences,
  subscribeToTefilaPreferences,
  syncAutomaticTefilaRegistrations,
  type TefilaDayKey,
  type TefilaPreferences,
} from '../services/tefilaPreferencesService'

type TefilaPreferencesCardProps = {
  userId: string
  userName: string
}

const DAYS: Array<{
  key: TefilaDayKey
  label: string
}> = [
  {
    key: 'sunday',
    label: 'Söndag',
  },
  {
    key: 'monday',
    label: 'Måndag',
  },
  {
    key: 'tuesday',
    label: 'Tisdag',
  },
  {
    key: 'wednesday',
    label: 'Onsdag',
  },
  {
    key: 'thursday',
    label: 'Torsdag',
  },
  {
    key: 'friday',
    label: 'Fredag',
  },
]

function TefilaPreferencesCard({
  userId,
  userName,
}: TefilaPreferencesCardProps) {
  const [open, setOpen] =
    useState(false)

  const [
    preferences,
    setPreferences,
  ] =
    useState<TefilaPreferences | null>(
      null,
    )

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [saved, setSaved] =
    useState(false)

  const [error, setError] =
    useState('')

  useEffect(() => {
    setLoading(true)

    return subscribeToTefilaPreferences(
      userId,
      (next) => {
        setPreferences(next)
        setLoading(false)
      },
      (caughtError) => {
        console.error(caughtError)

        setError(
          'Preferenserna kunde inte hämtas.',
        )

        setLoading(false)
      },
    )
  }, [userId])

  function toggleDay(
    key: TefilaDayKey,
  ) {
    if (!preferences) {
      return
    }

    setSaved(false)

    setPreferences({
      ...preferences,

      autoDays: {
        ...preferences.autoDays,

        [key]:
          !preferences.autoDays[key],
      },
    })
  }

  async function handleSave() {
    if (!preferences) {
      return
    }

    if (
      preferences.vacationEnabled &&
      (
        !preferences.vacationFrom ||
        !preferences.vacationTo
      )
    ) {
      setError(
        'Välj både start- och slutdatum för semesterläget.',
      )
      return
    }

    if (
      preferences.vacationEnabled &&
      preferences.vacationFrom &&
      preferences.vacationTo &&
      preferences.vacationFrom >
        preferences.vacationTo
    ) {
      setError(
        'Slutdatumet måste vara efter startdatumet.',
      )
      return
    }

    try {
      setSaving(true)
      setSaved(false)
      setError('')

      await saveTefilaPreferences(
        preferences,
      )

      await syncAutomaticTefilaRegistrations({
        userId,
        userName,
        preferences,
      })

      setSaved(true)
    } catch (caughtError) {
      console.error(caughtError)

      setError(
        'Preferenserna kunde inte sparas.',
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm text-slate-500">
          Hämtar tfila-preferenser…
        </p>
      </section>
    )
  }

  if (!preferences) {
    return null
  }

  const selectedDays =
    DAYS.filter(
      ({ key }) =>
        preferences.autoDays[key],
    )

  return (
    <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-sky-100">
      <button
        type="button"
        onClick={() =>
          setOpen(
            (current) => !current,
          )
        }
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-[#183b70]">
            <CalendarDays className="h-5 w-5" />
          </div>

          <div>
            <p className="font-bold text-[#183b70]">
              Mina tfila-preferenser
            </p>

            <p className="mt-0.5 text-xs text-slate-500">
              {selectedDays.length > 0
                ? `${selectedDays.length} automatiska ${
                    selectedDays.length === 1
                      ? 'dag'
                      : 'dagar'
                  }`
                : 'Ingen automatisk dag vald'}
            </p>
          </div>
        </div>

        {open ? (
          <ChevronUp className="h-5 w-5 text-slate-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-slate-400" />
        )}
      </button>

      {open && (
        <div className="border-t border-slate-100 p-4">
          <div>
            <p className="font-bold text-slate-800">
              Anmäl mig automatiskt
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Välj vilka dagar du normalt vill
              vara anmäld till Shacharit.
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {DAYS.map(
                ({ key, label }) => {
                  const active =
                    preferences
                      .autoDays[key]

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        toggleDay(key)
                      }
                      className={`rounded-2xl px-3 py-3 text-sm font-bold ring-1 ${
                        active
                          ? 'bg-sky-50 text-[#183b70] ring-sky-300'
                          : 'bg-white text-slate-500 ring-slate-200'
                      }`}
                    >
                      {active
                        ? '✓ '
                        : ''}
                      {label}
                    </button>
                  )
                },
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setSaved(false)

                setPreferences({
                  ...preferences,
                  autoKabbalatShabbat:
                    !preferences
                      .autoKabbalatShabbat,
                })
              }}
              className={`mt-2 w-full rounded-2xl px-3 py-3 text-sm font-bold ring-1 ${
                preferences
                  .autoKabbalatShabbat
                  ? 'bg-rose-50 text-[#68123f] ring-rose-200'
                  : 'bg-white text-slate-500 ring-slate-200'
              }`}
            >
              {preferences
                .autoKabbalatShabbat
                ? '✓ '
                : ''}
              Kabbalat Shabbat
            </button>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Du kan alltid ta bort dig från ett
              enskilt tillfälle utan att ändra
              dina preferenser.
            </p>
          </div>

          <div className="mt-5 space-y-3">
            <label className="flex items-start justify-between gap-4 rounded-2xl bg-slate-50 p-4">
              <span className="flex gap-3">
                <Bell className="mt-0.5 h-5 w-5 shrink-0 text-[#183b70]" />

                <span>
                  <span className="block text-sm font-bold text-slate-800">
                    Meddela mig när det är 9
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    Push när en person saknas
                    till minjan.
                  </span>
                </span>
              </span>

              <input
                type="checkbox"
                checked={
                  preferences
                    .notifyWhenNine
                }
                onChange={(event) => {
                  setSaved(false)

                  setPreferences({
                    ...preferences,

                    notifyWhenNine:
                      event.target.checked,
                  })
                }}
                className="mt-1 h-5 w-5 accent-[#68123f]"
              />
            </label>

            <label className="flex items-start justify-between gap-4 rounded-2xl bg-slate-50 p-4">
              <span className="flex gap-3">
                <Bell className="mt-0.5 h-5 w-5 shrink-0 text-[#183b70]" />

                <span>
                  <span className="block text-sm font-bold text-slate-800">
                    Extra Mincha/Maariv
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    Push om en extra tfila
                    läggs till.
                  </span>
                </span>
              </span>

              <input
                type="checkbox"
                checked={
                  preferences
                    .notifyExtraMinyan
                }
                onChange={(event) => {
                  setSaved(false)

                  setPreferences({
                    ...preferences,

                    notifyExtraMinyan:
                      event.target.checked,
                  })
                }}
                className="mt-1 h-5 w-5 accent-[#68123f]"
              />
            </label>
          </div>

          <div className="mt-5 rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-100">
            <div className="flex items-start gap-3">
              <Plane className="mt-0.5 h-5 w-5 shrink-0 text-amber-800" />

              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-800">
                  Semesterläge
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Automatiska anmälningar tas bort
                  under perioden. Manuella
                  anmälningar påverkas inte.
                </p>
              </div>

              <input
                type="checkbox"
                checked={
                  preferences
                    .vacationEnabled
                }
                onChange={(event) => {
                  setSaved(false)

                  setPreferences({
                    ...preferences,

                    vacationEnabled:
                      event.target.checked,
                  })
                }}
                className="mt-1 h-5 w-5 accent-[#68123f]"
              />
            </div>

            {preferences.vacationEnabled && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <label>
                  <span className="text-xs font-bold text-slate-600">
                    Från
                  </span>

                  <input
                    type="date"
                    value={
                      preferences
                        .vacationFrom ??
                      ''
                    }
                    onChange={(event) => {
                      setSaved(false)

                      setPreferences({
                        ...preferences,

                        vacationFrom:
                          event.target
                            .value ||
                          null,
                      })
                    }}
                    className="mt-1 w-full rounded-xl border border-amber-200 bg-white px-3 py-2.5 text-sm"
                  />
                </label>

                <label>
                  <span className="text-xs font-bold text-slate-600">
                    Till
                  </span>

                  <input
                    type="date"
                    value={
                      preferences
                        .vacationTo ??
                      ''
                    }
                    onChange={(event) => {
                      setSaved(false)

                      setPreferences({
                        ...preferences,

                        vacationTo:
                          event.target
                            .value ||
                          null,
                      })
                    }}
                    className="mt-1 w-full rounded-xl border border-amber-200 bg-white px-3 py-2.5 text-sm"
                  />
                </label>
              </div>
            )}
          </div>

          {error && (
            <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
              {error}
            </p>
          )}

          {saved && (
            <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
              Preferenserna är sparade.
            </p>
          )}

          <button
            type="button"
            disabled={saving}
            onClick={() => {
              void handleSave()
            }}
            className="mt-4 w-full rounded-2xl bg-[#183b70] px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {saving
              ? 'Sparar…'
              : 'Spara preferenser'}
          </button>
        </div>
      )}
    </section>
  )
}

export default TefilaPreferencesCard
