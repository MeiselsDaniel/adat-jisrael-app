import { useEffect, useState } from 'react'
import {
  Check,
  ChevronDown,
  ChevronUp,
  Settings,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { getHebcalDayInfo } from '../services/hebcalService'
import { getDefaultSermon } from '../utils/getDefaultSermon'
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

  const defaultSermon =
    getDefaultSermon(dateValue)

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
    moreInformation,
    setMoreInformation,
  ] = useState('')

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

  const [
    showMincha,
    setShowMincha,
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

        setMoreInformation(
          settings?.moreInformation ??
            '',
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

        setShowMincha(
          settings?.showMincha ??
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
        moreInformation,
        customCandleLightingTime,
        customHavdalaTime,
        showCandleLighting,
        showHavdala,
        showMincha,
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

  const previewIsHoliday =
    dayType === 'holiday' ||
    dayType === 'shabbatHoliday' ||
    dayType === 'erevShabbatHoliday' ||
    dayType === 'erevShabbatErevHoliday'

  const previewIsShabbat =
    dayType === 'shabbat' ||
    dayType === 'shabbatHoliday' ||
    dayType === 'erevShabbatHoliday' ||
    dayType === 'erevShabbatErevHoliday' ||
    hebcalInfo.isShabbat ||
    hebcalInfo.isErevShabbat

  const previewHolidayName =
    holidayName.trim() ||
    hebcalInfo.holidayNames[0] ||
    ''

  const previewTopLabel = (() => {
    switch (dayType) {
      case 'shabbatHoliday':
        return previewHolidayName
          ? `${previewHolidayName} · Shabbat`
          : 'Shabbat'

      case 'erevShabbatHoliday':
        return previewHolidayName
          ? `${previewHolidayName} · Erev Shabbat`
          : 'Erev Shabbat'

      case 'erevShabbatErevHoliday':
        return previewHolidayName
          ? `Erev ${previewHolidayName} · Erev Shabbat`
          : 'Erev Shabbat'

      case 'holiday':
        return previewHolidayName || 'Högtid'

      case 'shabbat':
        return 'Shabbat'

      default:
        if (hebcalInfo.isErevShabbat) {
          return 'Erev Shabbat'
        }

        if (hebcalInfo.isShabbat) {
          return 'Shabbat'
        }

        return 'Vanlig dag'
    }
  })()

  const previewTitle =
    holidayName.trim() ||
    hebcalInfo.holidayNames[0] ||
    previewTopLabel

  const previewAccent =
    previewIsHoliday
      ? 'bg-amber-700'
      : previewIsShabbat
        ? 'bg-[#68123f]'
        : 'bg-[#183b70]'

  const previewRing =
    previewIsHoliday
      ? 'ring-amber-700/25'
      : previewIsShabbat
        ? 'ring-[#68123f]/25'
        : 'ring-slate-200'

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
          {(
              dayType === 'shabbat' ||
              dayType === 'holiday' ||
              dayType === 'shabbatHoliday' ||
              dayType === 'erevShabbatHoliday' ||
              dayType === 'erevShabbatErevHoliday'
            ) && (

            <label className="block">
              <span className="text-sm font-bold text-slate-700">
                Mer information (visas i appen)
              </span>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Exempelvis Molad, shiur, gästchazan eller annan praktisk information.
              </p>

              <textarea
                value={moreInformation}
                onChange={(event) =>
                  setMoreInformation(
                    event.target.value,
                  )
                }
                rows={5}
                placeholder="Exempel: Molad: söndag 14.32 och 7 chalakim."
                className="mt-2 w-full resize-y rounded-2xl border border-slate-200 px-4 py-3 text-sm leading-6"
              />
            </label>
          )}
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

              <TypeButton
                label="Erev Shabbat + högtid"
                active={
                  dayType ===
                  'erevShabbatHoliday'
                }
                onClick={() =>
                  setDayType(
                    'erevShabbatHoliday',
                  )
                }
              />

              <TypeButton
                label="Erev Shabbat + Erev högtid"
                active={
                  dayType ===
                  'erevShabbatErevHoliday'
                }
                onClick={() =>
                  setDayType(
                    'erevShabbatErevHoliday',
                  )
                }
              />
            </div>
          </div>

          {(
              dayType === 'holiday' ||
              dayType === 'shabbatHoliday' ||
              dayType === 'erevShabbatHoliday' ||
              dayType === 'erevShabbatErevHoliday'
            ) && (

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
            {(previewIsShabbat ||
              previewIsHoliday) && (
              <div className="space-y-2">
                <p className="text-sm font-bold text-slate-700">
                  Förhandsvisning i appen
                </p>

                <article
                  className={`overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ${previewRing}`}
                >
                  <div
                    className={`${previewAccent} px-5 py-3 text-white`}
                  >
                    <p className="text-sm font-bold uppercase tracking-wide">
                      {previewTopLabel}
                    </p>
                  </div>

                  <div className="p-5">
                    <p className="text-sm font-semibold text-slate-500">
                      {dateValue}
                    </p>

                    <h3 className="mt-1 text-xl font-bold text-[#183b70]">
                      {previewTitle}
                    </h3>

                    {hebcalInfo.hebrewDate && (
                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        {hebcalInfo.hebrewDate}
                      </p>
                    )}

                    {showCandleLighting &&
                      (
                        customCandleLightingTime ||
                        hebcalInfo.candleLightingTime
                      ) && (
                        <div className="mt-5 flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
                          <span className="text-sm font-semibold text-slate-500">
                            Ljuständning
                          </span>

                          <span className="font-bold text-slate-800">
                            {customCandleLightingTime ||
                              hebcalInfo.candleLightingTime}
                          </span>
                        </div>
                      )}

                    {sermon.trim() && (
                      <div className="mt-4 border-t border-slate-100 pt-4">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                          Predikan
                        </p>

                        <p className="mt-1 font-semibold text-slate-800">
                          {sermon.trim()}
                        </p>
                      </div>
                    )}

                    {showHavdala &&
                      (
                        customHavdalaTime ||
                        hebcalInfo.havdalaTime
                      ) && (
                        <div className="mt-4 flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
                          <span className="text-sm font-semibold text-slate-500">
                            Havdala
                          </span>

                          <span className="font-bold text-slate-800">
                            {customHavdalaTime ||
                              hebcalInfo.havdalaTime}
                          </span>
                        </div>
                      )}

                    {comment.trim() && (
                      <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                        {comment.trim()}
                      </div>
                    )}

                    {moreInformation.trim() && (
                      <div className="mt-4 rounded-2xl bg-sky-50 p-4 ring-1 ring-sky-100">
                        <p className="text-xs font-bold uppercase tracking-wide text-[#183b70]">
                          Mer information
                        </p>

                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
                          {moreInformation.trim()}
                        </p>
                      </div>
                    )}
                  </div>
                </article>
              </div>
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
            label="Visa Mincha"
            checked={showMincha}
            onChange={setShowMincha}
          />

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

                    {defaultSermon && (
            <div className="rounded-2xl bg-sky-50 px-4 py-3 ring-1 ring-sky-100">
              <p className="text-xs font-bold uppercase tracking-wide text-sky-700">
                Ordinarie predikoschema
              </p>

              <p className="mt-1 font-bold text-[#183b70]">
                {defaultSermon}
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Lämna predikantfältet tomt för att använda ordinarie schema.
                Skriv ett namn nedan endast om denna Shabbat avviker.
              </p>
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

    case 'erevShabbatHoliday':
      return 'Erev Shabbat + högtid'

    case 'erevShabbatErevHoliday':
      return 'Erev Shabbat + Erev högtid'

    default:
      return 'Vanlig dag'
  }
}

export default DaySettingsEditor
