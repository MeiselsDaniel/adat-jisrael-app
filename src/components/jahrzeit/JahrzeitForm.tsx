import {
  Flame,
  X,
} from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  createJahrzeit,
  updateJahrzeit,
  type JahrzeitGender,
  type JahrzeitRecord,
} from '../../services/jahrzeitService'

const HEBREW_MONTHS = [
  'Nisan',
  'Iyyar',
  'Sivan',
  'Tamuz',
  'Av',
  'Elul',
  'Tishrei',
  'Cheshvan',
  'Kislev',
  'Tevet',
  "Sh'vat",
  'Adar',
  'Adar I',
  'Adar II',
]

type JahrzeitFormProps = {
  userId: string
  userName: string
  existingJahrzeit?: JahrzeitRecord | null
  onClose: () => void
}

function JahrzeitForm({
  userId,
  userName,
  existingJahrzeit,
  onClose,
}: JahrzeitFormProps) {
  const isEditing =
    Boolean(existingJahrzeit)

  const [deceasedName, setDeceasedName] =
    useState(
      existingJahrzeit
        ?.deceasedName ?? '',
    )

  const [hebrewName, setHebrewName] =
    useState(
      existingJahrzeit
        ?.hebrewName ?? '',
    )

  const [relation, setRelation] =
    useState(
      existingJahrzeit
        ?.relation ?? '',
    )

  const [gender, setGender] =
    useState<JahrzeitGender | ''>(
      existingJahrzeit
        ?.gender ?? '',
    )

  const [notes, setNotes] =
    useState(
      existingJahrzeit
        ?.notes ?? '',
    )

  const [hebrewDay, setHebrewDay] =
    useState(
      existingJahrzeit
        ? String(
            existingJahrzeit.hebrewDay,
          )
        : '',
    )

  const [hebrewMonth, setHebrewMonth] =
    useState(
      existingJahrzeit
        ?.hebrewMonth ?? '',
    )

  const [remind, setRemind] =
    useState(
      existingJahrzeit
        ?.remind ?? true,
    )

  const [saving, setSaving] =
    useState(false)

  const [error, setError] =
    useState('')

  async function handleSubmit(
    event: FormEvent,
  ) {
    event.preventDefault()

    const day =
      Number(hebrewDay)

    if (
      !userId ||
      !deceasedName.trim() ||
      !hebrewMonth ||
      !Number.isInteger(day) ||
      day < 1 ||
      day > 30
    ) {
      setError(
        'Fyll i namn, hebreisk dag och månad.',
      )
      return
    }

    try {
      setSaving(true)
      setError('')

      const commonInput = {
        deceasedName,
        hebrewName,
        relation,
        gender:
          gender || undefined,
        notes,
        hebrewDay: day,
        hebrewMonth,
        remind,
      }

      if (existingJahrzeit) {
        await updateJahrzeit(
          existingJahrzeit.id,
          commonInput,
        )
      } else {
        await createJahrzeit({
          ownerId: userId,
          ownerName: userName,
          ...commonInput,
        })
      }

      onClose()
    } catch (caughtError) {
      console.error(caughtError)

      setError(
        isEditing
          ? 'Kunde inte spara ändringarna.'
          : 'Kunde inte registrera Jahrzeit.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-amber-200">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-amber-800">
            Jahrzeit
          </p>

          <h2 className="mt-1 text-lg font-bold text-[#183b70]">
            {isEditing
              ? 'Redigera Jahrzeit'
              : 'Registrera Jahrzeit'}
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-xl bg-slate-100 p-2 text-slate-500"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-5 space-y-4"
      >
        <label className="block">
          <span className="text-sm font-bold text-slate-700">
            Namn på den avlidne
          </span>

          <input
            value={deceasedName}
            onChange={(event) =>
              setDeceasedName(
                event.target.value,
              )
            }
            placeholder="Exempel: Chava Meisels"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
          />
        </label>

        <label className="block">
          <span className="text-sm font-bold text-slate-700">
            Hebreiskt namn
          </span>

          <input
            value={hebrewName}
            onChange={(event) =>
              setHebrewName(
                event.target.value,
              )
            }
            placeholder="Exempel: Chava bat Moshe"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
          />
        </label>

        <label className="block">
          <span className="text-sm font-bold text-slate-700">
            Relation
          </span>

          <input
            value={relation}
            onChange={(event) =>
              setRelation(
                event.target.value,
              )
            }
            placeholder="Exempel: Mormor"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
          />
        </label>

        <div>
          <p className="text-sm font-bold text-slate-700">
            Kön
          </p>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() =>
                setGender('male')
              }
              className={`rounded-2xl px-4 py-3 text-sm font-bold ring-1 ${
                gender === 'male'
                  ? 'bg-sky-50 text-[#183b70] ring-sky-300'
                  : 'bg-white text-slate-500 ring-slate-200'
              }`}
            >
              Man
            </button>

            <button
              type="button"
              onClick={() =>
                setGender('female')
              }
              className={`rounded-2xl px-4 py-3 text-sm font-bold ring-1 ${
                gender === 'female'
                  ? 'bg-sky-50 text-[#183b70] ring-sky-300'
                  : 'bg-white text-slate-500 ring-slate-200'
              }`}
            >
              Kvinna
            </button>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_2fr] gap-3">
          <label>
            <span className="text-sm font-bold text-slate-700">
              Dag
            </span>

            <input
              type="number"
              min="1"
              max="30"
              value={hebrewDay}
              onChange={(event) =>
                setHebrewDay(
                  event.target.value,
                )
              }
              placeholder="25"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
            />
          </label>

          <label>
            <span className="text-sm font-bold text-slate-700">
              Månad
            </span>

            <select
              value={hebrewMonth}
              onChange={(event) =>
                setHebrewMonth(
                  event.target.value,
                )
              }
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
            >
              <option value="">
                Välj månad
              </option>

              {HEBREW_MONTHS.map(
                (month) => (
                  <option
                    key={month}
                    value={month}
                  >
                    {month}
                  </option>
                ),
              )}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-bold text-slate-700">
            Anteckning
          </span>

          <textarea
            value={notes}
            onChange={(event) =>
              setNotes(
                event.target.value,
              )
            }
            rows={3}
            placeholder="Valfritt"
            className="mt-2 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3"
          />
        </label>

        <label className="flex items-center justify-between rounded-2xl bg-amber-50 p-4">
          <span>
            <span className="block text-sm font-bold text-slate-800">
              Påminn mig
            </span>

            <span className="mt-1 block text-xs text-slate-500">
              Du får en påminnelse inför Jahrzeit.
            </span>
          </span>

          <input
            type="checkbox"
            checked={remind}
            onChange={(event) =>
              setRemind(
                event.target.checked,
              )
            }
            className="h-5 w-5 accent-[#68123f]"
          />
        </label>

        {error && (
          <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#68123f] px-4 py-3 font-bold text-white disabled:opacity-60"
        >
          <Flame className="h-5 w-5" />

          {saving
            ? 'Sparar…'
            : isEditing
              ? 'Spara ändringar'
              : 'Registrera Jahrzeit'}
        </button>
      </form>
    </section>
  )
}

export default JahrzeitForm
