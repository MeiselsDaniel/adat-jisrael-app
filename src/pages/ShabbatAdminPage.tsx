import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  ArrowLeft,
  BookOpen,
  Check,
  Clock,
  Mic2,
  MoonStar,
  Save,
  Utensils,
} from 'lucide-react'

export type ShabbatInfo = {
  date: string
  parasha: string
  shacharitTime: string
  minchaTime?: string
  preacher?: string
  kiddushHost?: string
  havdalaTime: string
}

type ShabbatAdminPageProps = {
  initialData: ShabbatInfo
  onBack: () => void
  onSave: (data: ShabbatInfo) => void
}

function ShabbatAdminPage({
  initialData,
  onBack,
  onSave,
}: ShabbatAdminPageProps) {
  const [date, setDate] = useState(initialData.date)
  const [parasha, setParasha] = useState(
    initialData.parasha,
  )
  const [shacharitTime, setShacharitTime] = useState(
    initialData.shacharitTime,
  )
  const [minchaTime, setMinchaTime] = useState(
    initialData.minchaTime ?? '',
  )
  const [preacher, setPreacher] = useState(
    initialData.preacher ?? '',
  )
  const [kiddushHost, setKiddushHost] = useState(
    initialData.kiddushHost ?? '',
  )
  const [havdalaTime, setHavdalaTime] = useState(
    initialData.havdalaTime,
  )

  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()
    setError('')
    setSaved(false)

    if (!date) {
      setError('Välj vilket datum informationen gäller.')
      return
    }

    if (!parasha.trim()) {
      setError('Skriv veckans parasha.')
      return
    }

    if (!shacharitTime) {
      setError('Ange tiden för Shacharit.')
      return
    }

    if (!havdalaTime) {
      setError('Ange tiden för Havdala.')
      return
    }

    onSave({
      date,
      parasha: parasha.trim(),
      shacharitTime,
      minchaTime: minchaTime || undefined,
      preacher: preacher.trim() || undefined,
      kiddushHost: kiddushHost.trim() || undefined,
      havdalaTime,
    })

    setSaved(true)
  }

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#183b70] shadow-sm ring-1 ring-slate-200"
          aria-label="Tillbaka"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div>
          <p className="text-sm font-semibold text-sky-700">
            Administration
          </p>

          <h1 className="text-2xl font-bold text-[#183b70]">
            Veckans Shabbat
          </h1>
        </div>
      </header>

      <section className="rounded-3xl bg-[#68123f] p-5 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            <MoonStar className="h-6 w-6" />
          </div>

          <div>
            <p className="font-bold">
              Shabbat-kortet på startsidan
            </p>

            <p className="mt-1 text-sm leading-6 text-rose-100">
              Uppgifterna du sparar här visas mellan
              Kabbalat Shabbat och söndagens Shacharit.
            </p>
          </div>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <FormSection title="Grunduppgifter">
          <Field label="Datum">
            <input
              value={date}
              onChange={(event) =>
                setDate(event.target.value)
              }
              type="date"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-600"
            />
          </Field>

          <Field
            label="Parasha"
            icon={<BookOpen className="h-4 w-4" />}
          >
            <input
              value={parasha}
              onChange={(event) =>
                setParasha(event.target.value)
              }
              type="text"
              placeholder="Exempel: Devarim"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-600"
            />
          </Field>
        </FormSection>

        <FormSection title="Tider">
          <Field
            label="Shacharit"
            icon={<Clock className="h-4 w-4" />}
          >
            <input
              value={shacharitTime}
              onChange={(event) =>
                setShacharitTime(event.target.value)
              }
              type="time"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-600"
            />
          </Field>

          <Field
            label="Mincha, valfritt"
            icon={<Clock className="h-4 w-4" />}
          >
            <input
              value={minchaTime}
              onChange={(event) =>
                setMinchaTime(event.target.value)
              }
              type="time"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-600"
            />
          </Field>

          <Field
            label="Havdala"
            icon={<MoonStar className="h-4 w-4" />}
          >
            <input
              value={havdalaTime}
              onChange={(event) =>
                setHavdalaTime(event.target.value)
              }
              type="time"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-600"
            />
          </Field>
        </FormSection>

        <FormSection title="Information">
          <Field
            label="Predikant, valfritt"
            icon={<Mic2 className="h-4 w-4" />}
          >
            <input
              value={preacher}
              onChange={(event) =>
                setPreacher(event.target.value)
              }
              type="text"
              placeholder="Exempel: Rabbin Amster"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-600"
            />
          </Field>

          <Field
            label="Kiddushvärd, valfritt"
            icon={<Utensils className="h-4 w-4" />}
          >
            <input
              value={kiddushHost}
              onChange={(event) =>
                setKiddushHost(event.target.value)
              }
              type="text"
              placeholder="Exempel: Familjen Fried"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-600"
            />
          </Field>
        </FormSection>

        {error && (
          <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
            {error}
          </div>
        )}

        {saved && (
          <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            <Check className="h-5 w-5" />
            Shabbat-informationen har uppdaterats.
          </div>
        )}

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#183b70] px-5 py-4 font-bold text-white"
        >
          <Save className="h-5 w-5" />
          Spara Shabbat
        </button>

        <p className="px-4 text-center text-xs leading-5 text-slate-400">
          Informationen sparas tillfälligt i prototypen tills
          sidan laddas om. Firebase kopplas in senare.
        </p>
      </form>
    </div>
  )
}

type FormSectionProps = {
  title: string
  children: React.ReactNode
}

function FormSection({
  title,
  children,
}: FormSectionProps) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="mb-5 text-lg font-bold text-[#183b70]">
        {title}
      </h2>

      <div className="space-y-4">{children}</div>
    </section>
  )
}

type FieldProps = {
  label: string
  icon?: React.ReactNode
  children: React.ReactNode
}

function Field({
  label,
  icon,
  children,
}: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
        {icon}
        {label}
      </span>

      {children}
    </label>
  )
}

export default ShabbatAdminPage