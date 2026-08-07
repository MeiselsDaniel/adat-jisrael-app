import { useEffect, useState } from 'react'
import {
  Check,
  ChevronDown,
  ChevronUp,
  Settings,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { getHebcalDayInfo } from '../services/hebcalService'
import {
  saveDaySettings,
  subscribeToDaySettings,
  type DayType,
} from '../services/daySettingsService'

type DaySettingsEditorProps = {
  dateValue: string
}

function DaySettingsEditor({
  dateValue,
}: DaySettingsEditorProps) {
  const { firebaseUser } = useAuth()

  const defaultDayType =
    getDefaultDayType(dateValue)


  const hebcalInfo =
    getHebcalDayInfo(dateValue)

  const [open, setOpen] = useState(false)
  const [dayType, setDayType] =
    useState<DayType>(defaultDayType)

  const [holidayName, setHolidayName] =
    useState('')

  const [sermon, setSermon] =
    useState('')

  const [comment, setComment] =
    useState('')

  const [
    customCandleLightingTime,
    setCustomCandleLightingTime,
  ] = useState('')

  const [
    customHavdalaTime,
    setCustomHavdalaTime,
  ] = useState('')

  const [
    showCandleLighting,
    setShowCandleLighting,
  ] = useState(true)

  const [
    showHavdala,
    setShowHavdala,
  ] = useState(true)

  const [saving, setSaving] =
    useState(false)

  const [saved, setSaved] =
    useState(false)

  const [error, setError] =
    useState('')

  useEffect(() => {
    return subscribeToDaySettings(
      dateValue,
      (settings) => {
        setDayType(
          settings?.dayType ??
            getDefaultDayType(dateValue),
        )

        setHolidayName(
          settings?.holidayName ?? '',
        )

        setSermon(
          settings?.sermon ?? '',
        )

        setComment(
          settings?.comment ?? '',
        )

        setCustomCandleLightingTime(
          settings?.customCandleLightingTime ??
            '',
        )

        setCustomHavdalaTime(
          settings?.customHavdalaTime ??
            '',
        )

        setShowCandleLighting(
          settings?.showCandleLighting ??
            true,
        )

        setShowHavdala(
          settings?.showHavdala ??
            true,
        )
      },
      (caughtError) => {
        console.error(caughtError)

        setError(
          'Dagsinställningarna kunde inte hämtas.',
        )
      },
    )
  }, [dateValue])

  async function handleSave() {
    if (!firebaseUser) {
      return
    }

    setSaving(true)
    setSaved(false)
    setError('')

    try {
      await saveDaySettings({
        date: dateValue,
        dayType,
        holidayName,
        sermon,
        comment,
        customCandleLightingTime,
        customHavdalaTime,
        showCandleLighting,
        showHavdala,
        updatedBy: firebaseUser.uid,
      })

      setSaved(true)
    } catch (caughtError) {
      console.error(caughtError)

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Dagsinställningarna kunde inte sparas.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
      <button
        type="button"
        onClick={() =>
          setOpen((current) => !current)
        }
        className="flex w-full items-center gap-3 px-4 py-4 text-left"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100 text-violet-800">
          <Settings className="h-5 w-5" />
        </div>

        <div className="flex-1">
          <p className="font-bold text-slate-800">
            Dagsinställningar
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {getDayTypeLabel(dayType)}
          </p>

          {hebcalInfo.isShabbatMevarchim && (
            <p className="mt-1 text-xs font-bold text-[#68123f]">
              Shabbat Mevarchim
            </p>
          )}

          {hebcalInfo.roshChodeshName && (
            <p className="mt-1 text-xs font-bold text-[#68123f]">
              {hebcalInfo.roshChodeshName}
            </p>
          )}

          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold text-slate-600">
            {showCandleLighting &&
              (
                customCandleLightingTime ||
                hebcalInfo.candleLightingTime
              ) && (
                <span>
                  Ljuständning{' '}
                  {customCandleLightingTime ||
                    hebcalInfo.candleLightingTime}
                </span>
              )}

            {showHavdala &&
              (
                customHavdalaTime ||
                hebcalInfo.havdalaTime
              ) && (
                <span>
                  Havdala{' '}
                  {customHavdalaTime ||
                    hebcalInfo.havdalaTime}
                </span>
              )}
          </div>
        </div>

        {open ? (
          <ChevronUp className="h-5 w-5 text-slate-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-slate-400" />
        )}
      </button>

      {open && (
        <div className="space-y-5 border-t border-slate-100 p-4">
          <div>
            <p className="text-sm font-bold text-slate-700">
              Typ av dag
            </p>

            <div className="mt-2 grid grid-cols-2 gap-2">
              <TypeButton
                label="Vanlig"
                active={dayType === 'regular'}
                onClick={() =>
                  setDayType('regular')
                }
              />

              <TypeButton
                label="Shabbat"
                active={dayType === 'shabbat'}
                onClick={() =>
                  setDayType('shabbat')
                }
              />

              <TypeButton
                label="Högtid"
                active={dayType === 'holiday'}
                onClick={() =>
                  setDayType('holiday')
                }
              />

              <TypeButton
                label="Shabbat + högtid"
                active={
                  dayType ===
                  'shabbatHoliday'
                }
                onClick={() =>
                  setDayType(
                    'shabbatHoliday',
                  )
                }
              />
            </div>
          </div>

          {(dayType === 'holiday' ||
            dayType ===
              'shabbatHoliday') && (
            <label className="block">
              <span className="text-sm font-bold text-slate-700">
                Högtidens namn
              </span>

              <input
                value={holidayName}
                onChange={(event) =>
                  setHolidayName(
                    event.target.value,
                  )
                }
                placeholder="Exempel: Rosh Hashana dag 1"
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
              />
            </label>
          )}

          <Toggle
            label="Visa ljuständning"
            checked={showCandleLighting}
            onChange={
              setShowCandleLighting
            }
          />

          {showCandleLighting && (
            <div className="space-y-2">
              {(
                customCandleLightingTime ||
                hebcalInfo.candleLightingTime
              ) && (
                <p className="rounded-2xl bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-800">
                  Nuvarande ljuständning:{' '}
                  <strong>
                    {customCandleLightingTime ||
                      hebcalInfo.candleLightingTime}
                  </strong>
                  {customCandleLightingTime &&
                    hebcalInfo.candleLightingTime &&
                    customCandleLightingTime !==
                      hebcalInfo.candleLightingTime && (
                      <span className="mt-1 block text-xs font-medium text-sky-700">
                        HebCal: {hebcalInfo.candleLightingTime}
                      </span>
                    )}
                </p>
              )}

              <TimeInput
              label="Egen ljuständningstid"
              value={
                customCandleLightingTime
              }
              onChange={
                setCustomCandleLightingTime
              }
            />
            </div>
          )}

          <Toggle
            label="Visa Havdala"
            checked={showHavdala}
            onChange={setShowHavdala}
          />

          {showHavdala && (
            <div className="space-y-2">
              {(
                customHavdalaTime ||
                hebcalInfo.havdalaTime
              ) && (
                <p className="rounded-2xl bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-800">
                  Nuvarande Havdala:{' '}
                  <strong>
                    {customHavdalaTime ||
                      hebcalInfo.havdalaTime}
                  </strong>
                  {customHavdalaTime &&
                    hebcalInfo.havdalaTime &&
                    customHavdalaTime !==
                      hebcalInfo.havdalaTime && (
                      <span className="mt-1 block text-xs font-medium text-sky-700">
                        HebCal: {hebcalInfo.havdalaTime}
                      </span>
                    )}
                </p>
              )}

              <TimeInput
              label="Egen Havdala-tid"
              value={customHavdalaTime}
              onChange={
                setCustomHavdalaTime
              }
            />
            </div>
          )}

          <label className="block">
            <span className="text-sm font-bold text-slate-700">
              Predikan eller talare
            </span>

            <input
              value={sermon}
              onChange={(event) =>
                setSermon(
                  event.target.value,
                )
              }
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">
              Kommentar
            </span>

            <textarea
              value={comment}
              onChange={(event) =>
                setComment(
                  event.target.value,
                )
              }
              rows={3}
              className="mt-2 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3"
            />
          </label>

          {error && (
            <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
              {error}
            </p>
          )}

          {saved && (
            <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
              Dagsinställningarna är sparade.
            </p>
          )}

          <button
            type="button"
            disabled={saving}
            onClick={() => {
              void handleSave()
            }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#183b70] px-4 py-3 font-bold text-white disabled:opacity-60"
          >
            <Check className="h-5 w-5" />

            {saving
              ? 'Sparar…'
              : 'Spara dagsinställningar'}
          </button>
        </div>
      )}
    </section>
  )
}

type TypeButtonProps = {
  label: string
  active: boolean
  onClick: () => void
}

function TypeButton({
  label,
  active,
  onClick,
}: TypeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl px-3 py-3 text-xs font-bold ring-1 ${
        active
          ? 'bg-[#183b70] text-white ring-[#183b70]'
          : 'bg-slate-50 text-slate-600 ring-slate-200'
      }`}
    >
      {label}
    </button>
  )
}

type ToggleProps = {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function Toggle({
  label,
  checked,
  onChange,
}: ToggleProps) {
  return (
    <label className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
      <span className="text-sm font-bold text-slate-700">
        {label}
      </span>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(event.target.checked)
        }
        className="h-5 w-5 accent-[#183b70]"
      />
    </label>
  )
}

type TimeInputProps = {
  label: string
  value: string
  onChange: (value: string) => void
}

function TimeInput({
  label,
  value,
  onChange,
}: TimeInputProps) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">
        {label}
      </span>


      <input
        type="time"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
      />
    </label>
  )
}

function getDefaultDayType(
  dateValue: string,
): DayType {
  const date = new Date(
    `${dateValue}T12:00:00`,
  )

  return date.getDay() === 6
    ? 'shabbat'
    : 'regular'
}

function getDayTypeLabel(
  dayType: DayType,
): string {
  switch (dayType) {
    case 'shabbat':
      return 'Shabbat'

    case 'holiday':
      return 'Högtid'

    case 'shabbatHoliday':
      return 'Shabbat + högtid'

    default:
      return 'Vanlig dag'
  }
}

export default DaySettingsEditor
