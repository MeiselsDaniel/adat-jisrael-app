import { useMemo, useState } from 'react'
import {
  CalendarDays,
  Clock3,
  MoonStar,
} from 'lucide-react'
import {
  getHebcalDayInfo,
} from '../services/hebcalService'

function HebcalDebugPanel() {
  const [dateValue, setDateValue] =
    useState(getTodayDateValue())

  const info = useMemo(
    () => getHebcalDayInfo(dateValue),
    [dateValue],
  )

  return (
    <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="border-b border-slate-100 bg-violet-50 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-800">
            <CalendarDays className="h-5 w-5" />
          </div>

          <div>
            <p className="font-bold text-[#183b70]">
              HebCal-test
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Tillfällig kontrollpanel
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <label className="block">
          <span className="text-sm font-bold text-slate-700">
            Datum
          </span>

          <input
            type="date"
            value={dateValue}
            onChange={(event) =>
              setDateValue(
                event.target.value,
              )
            }
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <InfoValue
            label="Hebreiskt datum"
            value={
              info.hebrewDate || '–'
            }
          />

          <InfoValue
            label="Parasha"
            value={
              info.parasha ?? '–'
            }
          />

          <InfoValue
            label="Shabbat"
            value={
              info.isShabbat
                ? 'Ja'
                : 'Nej'
            }
          />

          <InfoValue
            label="Erev Shabbat"
            value={
              info.isErevShabbat
                ? 'Ja'
                : 'Nej'
            }
          />

          <InfoValue
            label="Högtid"
            value={
              info.isHoliday
                ? 'Ja'
                : 'Nej'
            }
          />

          <InfoValue
            label="Erev högtid"
            value={
              info.isErevHoliday
                ? 'Ja'
                : 'Nej'
            }
          />

          <InfoValue
            label="Rosh Chodesh"
            value={
              info.roshChodeshName ??
              (info.isRoshChodesh
                ? 'Ja'
                : 'Nej')
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <TimeValue
            label="Ljuständning"
            value={
              info.candleLightingTime
            }
          />

          <TimeValue
            label="Havdala"
            value={info.havdalaTime}
          />
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Högtider
          </p>

          <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
            {info.holidayNames.length > 0
              ? info.holidayNames.join(', ')
              : 'Ingen högtid hittades'}
          </p>
        </div>
      </div>
    </section>
  )
}

type InfoValueProps = {
  label: string
  value: string
}

function InfoValue({
  label,
  value,
}: InfoValueProps) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-slate-800">
        {value}
      </p>
    </div>
  )
}

type TimeValueProps = {
  label: string
  value: string | null
}

function TimeValue({
  label,
  value,
}: TimeValueProps) {
  return (
    <div className="rounded-2xl bg-[#183b70] p-4 text-white">
      <div className="flex items-center gap-2">
        {label === 'Ljuständning' ? (
          <MoonStar className="h-4 w-4" />
        ) : (
          <Clock3 className="h-4 w-4" />
        )}

        <p className="text-xs font-bold text-blue-100">
          {label}
        </p>
      </div>

      <p className="mt-2 text-xl font-black">
        {value ?? '–'}
      </p>
    </div>
  )
}

function getTodayDateValue(): string {
  const date = new Date()

  const year = date.getFullYear()

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0')

  const day = String(
    date.getDate(),
  ).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export default HebcalDebugPanel
