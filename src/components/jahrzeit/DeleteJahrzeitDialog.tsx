import {
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import {
  deleteJahrzeit,
  type JahrzeitRecord,
} from '../../services/jahrzeitService'

type DeleteJahrzeitDialogProps = {
  jahrzeit: JahrzeitRecord
  onClose: () => void
}

function DeleteJahrzeitDialog({
  jahrzeit,
  onClose,
}: DeleteJahrzeitDialogProps) {
  const [deleting, setDeleting] =
    useState(false)

  const [error, setError] =
    useState('')

  async function handleDelete() {
    try {
      setDeleting(true)
      setError('')

      await deleteJahrzeit(
        jahrzeit.id,
      )

      onClose()
    } catch (caughtError) {
      console.error(caughtError)

      setError(
        'Kunde inte ta bort Jahrzeit.',
      )
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-5">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
          <Trash2 className="h-5 w-5" />
        </div>

        <h2 className="mt-4 text-center text-lg font-bold text-slate-900">
          Ta bort Jahrzeit?
        </h2>

        <p className="mt-2 text-center text-sm leading-6 text-slate-500">
          Är du säker på att du vill ta bort
          Jahrzeit för{' '}
          <strong className="text-slate-700">
            {jahrzeit.deceasedName}
          </strong>
          ?
        </p>

        {error && (
          <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
            {error}
          </p>
        )}

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700"
          >
            Avbryt
          </button>

          <button
            type="button"
            onClick={() => {
              void handleDelete()
            }}
            disabled={deleting}
            className="rounded-2xl bg-rose-700 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {deleting
              ? 'Tar bort…'
              : 'Ta bort'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteJahrzeitDialog
