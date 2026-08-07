import {
  Flame,
  Pencil,
  Trash2,
} from 'lucide-react'
import {
  getNextJahrzeitDate,
  type JahrzeitRecord,
} from '../../services/jahrzeitService'

type JahrzeitListProps = {
  jahrzeits: JahrzeitRecord[]
  onEdit: (
    jahrzeit: JahrzeitRecord,
  ) => void
  onDelete: (
    jahrzeit: JahrzeitRecord,
  ) => void
}

function JahrzeitList({
  jahrzeits,
  onEdit,
  onDelete,
}: JahrzeitListProps) {
  const sorted =
    [...jahrzeits].sort(
      compareByNextDate,
    )

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-amber-200">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-800">
          <Flame className="h-5 w-5" />
        </div>

        <div>
          <h2 className="font-bold text-[#183b70]">
            Mina Jahrzeits
          </h2>

          <p className="text-xs text-slate-500">
            {jahrzeits.length}{' '}
            {jahrzeits.length === 1
              ? 'registrerad Jahrzeit'
              : 'registrerade Jahrzeits'}
          </p>
        </div>
      </div>

      <div className="mt-4 divide-y divide-slate-100">
        {sorted.map((jahrzeit) => (
          <JahrzeitRow
            key={jahrzeit.id}
            jahrzeit={jahrzeit}
            onEdit={() =>
              onEdit(jahrzeit)
            }
            onDelete={() =>
              onDelete(jahrzeit)
            }
          />
        ))}
      </div>
    </section>
  )
}

function JahrzeitRow({
  jahrzeit,
  onEdit,
  onDelete,
}: {
  jahrzeit: JahrzeitRecord
  onEdit: () => void
  onDelete: () => void
}) {
  const nextDate =
    getNextJahrzeitDate(
      jahrzeit,
    )

  const nextDateText =
    nextDate
      ? new Intl.DateTimeFormat(
          'sv-SE',
          {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          },
        ).format(nextDate)
      : null

  return (
    <article className="py-4 first:pt-0 last:pb-0">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
          <Flame className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-bold text-slate-900">
            {jahrzeit.deceasedName}
          </p>

          {jahrzeit.hebrewName && (
            <p className="mt-0.5 text-sm text-slate-600">
              {jahrzeit.hebrewName}
            </p>
          )}

          <p className="mt-1 text-sm text-slate-500">
            {jahrzeit.hebrewDay}{' '}
            {jahrzeit.hebrewMonth}

            {jahrzeit.relation
              ? ` · ${jahrzeit.relation}`
              : ''}
          </p>

          {nextDateText && (
            <p className="mt-1 text-xs font-semibold capitalize text-amber-800">
              Nästa: {nextDateText}
            </p>
          )}

          {jahrzeit.notes && (
            <p className="mt-2 text-xs leading-5 text-slate-500">
              {jahrzeit.notes}
            </p>
          )}

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-[#183b70]"
            >
              <Pencil className="h-3.5 w-3.5" />
              Redigera
            </button>

            <button
              type="button"
              onClick={onDelete}
              className="flex items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Ta bort
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

function compareByNextDate(
  first: JahrzeitRecord,
  second: JahrzeitRecord,
): number {
  const firstDate =
    getNextJahrzeitDate(first)

  const secondDate =
    getNextJahrzeitDate(second)

  if (!firstDate && !secondDate) {
    return first.deceasedName.localeCompare(
      second.deceasedName,
      'sv',
    )
  }

  if (!firstDate) {
    return 1
  }

  if (!secondDate) {
    return -1
  }

  return (
    firstDate.getTime() -
    secondDate.getTime()
  )
}

export default JahrzeitList
