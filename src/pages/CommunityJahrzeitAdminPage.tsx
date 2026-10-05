import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  Flame,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import JahrzeitForm from '../components/jahrzeit/JahrzeitForm'
import DeleteJahrzeitDialog from '../components/jahrzeit/DeleteJahrzeitDialog'
import {
  subscribeToAllJahrzeits,
  getNextJahrzeitDate,
  type JahrzeitRecord,
} from '../services/jahrzeitService'

type Props = {
  onBack: () => void
}

function CommunityJahrzeitAdminPage({
  onBack,
}: Props) {
  const [jahrzeits, setJahrzeits] =
    useState<JahrzeitRecord[]>([])

  const [formOpen, setFormOpen] =
    useState(false)

  const [editing, setEditing] =
    useState<JahrzeitRecord | null>(null)

  const [deleting, setDeleting] =
    useState<JahrzeitRecord | null>(null)

  const [error, setError] =
    useState('')

  useEffect(() => {
    return subscribeToAllJahrzeits(
      (items) => {
        setJahrzeits(
          items.filter(
            (item) =>
              item.ownerId === 'community',
          ),
        )
      },
      () => {
        setError(
          'Kunde inte läsa församlingens Jahrezeits.',
        )
      },
    )
  }, [])

  const sorted = useMemo(
    () =>
      [...jahrzeits].sort((a, b) => {
        const first =
          getNextJahrzeitDate(a)?.getTime() ??
          Number.MAX_SAFE_INTEGER

        const second =
          getNextJahrzeitDate(b)?.getTime() ??
          Number.MAX_SAFE_INTEGER

        return first - second
      }),
    [jahrzeits],
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-200"
          aria-label="Tillbaka"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-800">
            Admin
          </p>

          <h1 className="text-xl font-bold text-[#183b70]">
            Församlingens Jahrezeits
          </h1>
        </div>
      </div>

      <p className="text-sm leading-6 text-slate-600">
        Jahrezeits som tillhör Adat Jisrael och
        inte någon enskild användare.
      </p>

      {!formOpen && (
        <button
          type="button"
          onClick={() => {
            setEditing(null)
            setFormOpen(true)
          }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#68123f] px-4 py-3 font-bold text-white"
        >
          <Plus className="h-5 w-5" />
          Lägg till Jahrzeit
        </button>
      )}

      {formOpen && (
        <JahrzeitForm
          userId="community"
          userName="Adat Jisrael"
          mode="community"
          existingJahrzeit={editing}
          onClose={() => {
            setFormOpen(false)
            setEditing(null)
          }}
        />
      )}

      {error && (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
          {error}
        </p>
      )}

      {!formOpen && (
        <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
          {sorted.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <Flame className="mx-auto h-8 w-8 text-amber-700" />

              <p className="mt-3 font-bold text-slate-800">
                Inga Jahrezeits registrerade
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Lägg till personer som ska ihågkommas
                av församlingen.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {sorted.map((jahrzeit) => (
                <div
                  key={jahrzeit.id}
                  className="flex items-center gap-3 px-5 py-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-800">
                    <Flame className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-800">
                      {jahrzeit.deceasedName}
                    </p>

                    {jahrzeit.hebrewName && (
                      <p className="mt-0.5 text-sm text-slate-500">
                        {jahrzeit.hebrewName}
                      </p>
                    )}

                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {jahrzeit.hebrewDay}{' '}
                      {jahrzeit.hebrewMonth}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditing(jahrzeit)
                      setFormOpen(true)
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600"
                    aria-label="Redigera"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setDeleting(jahrzeit)
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-700"
                    aria-label="Ta bort"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {deleting && (
        <DeleteJahrzeitDialog
          jahrzeit={deleting}
          onClose={() =>
            setDeleting(null)
          }
        />
      )}
    </div>
  )
}

export default CommunityJahrzeitAdminPage
