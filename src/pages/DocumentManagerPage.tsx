import {
  ArrowLeft,
  FileText,
  LoaderCircle,
  Trash2,
  Upload,
} from 'lucide-react'
import {
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  deleteDocument,
  subscribeToDocuments,
  uploadDocument,
  type MemberDocument,
} from '../services/documentService'

type DocumentManagerPageProps = {
  onBack: () => void
}

function DocumentManagerPage({
  onBack,
}: DocumentManagerPageProps) {
  const [
    documents,
    setDocuments,
  ] = useState<MemberDocument[]>([])

  const [title, setTitle] =
    useState('')

  const [file, setFile] =
    useState<File | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [uploading, setUploading] =
    useState(false)

  const [
    deletingId,
    setDeletingId,
  ] = useState<string | null>(null)

  const [error, setError] =
    useState('')

  const [success, setSuccess] =
    useState('')

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null,
    )

  useEffect(() => {
    return subscribeToDocuments(
      (nextDocuments) => {
        setDocuments(
          nextDocuments,
        )
        setLoading(false)
      },
      (caughtError) => {
        console.error(caughtError)

        setError(
          'Dokumenten kunde inte hämtas.',
        )
        setLoading(false)
      },
    )
  }, [])

  async function handleUpload() {
    if (!title.trim()) {
      setError(
        'Ange en titel för dokumentet.',
      )
      return
    }

    if (!file) {
      setError(
        'Välj en PDF-fil.',
      )
      return
    }

    setUploading(true)
    setError('')
    setSuccess('')

    try {
      await uploadDocument(
        file,
        title,
      )

      setTitle('')
      setFile(null)

      if (fileInputRef.current) {
        fileInputRef.current.value =
          ''
      }

      setSuccess(
        'Dokumentet har laddats upp.',
      )
    } catch (caughtError) {
      console.error(caughtError)

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Dokumentet kunde inte laddas upp.',
      )
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(
    document: MemberDocument,
  ) {
    const confirmed =
      window.confirm(
        `Vill du radera "${document.title}"?`,
      )

    if (!confirmed) {
      return
    }

    setDeletingId(document.id)
    setError('')
    setSuccess('')

    try {
      await deleteDocument(
        document,
      )

      setSuccess(
        'Dokumentet har raderats.',
      )
    } catch (caughtError) {
      console.error(caughtError)

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Dokumentet kunde inte raderas.',
      )
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#183b70] shadow-sm ring-1 ring-slate-200"
          aria-label="Tillbaka"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div>
          <p className="text-sm font-semibold text-sky-700">
            Administration
          </p>

          <h1 className="text-2xl font-bold text-[#183b70]">
            Dokument
          </h1>
        </div>
      </header>

      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-[#183b70]">
            <Upload className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              Ladda upp dokument
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Endast PDF, högst 10 MB.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="text-sm font-bold text-slate-700">
              Titel
            </label>

            <input
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value,
                )
              }
              placeholder="Exempel: Stadgar"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-sky-400"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700">
              PDF-fil
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              onChange={(event) => {
                setFile(
                  event.target.files?.[0] ??
                    null,
                )
                setError('')
                setSuccess('')
              }}
              className="mt-2 block w-full text-sm text-slate-600 file:mr-3 file:rounded-xl file:border-0 file:bg-sky-50 file:px-4 file:py-2.5 file:text-sm file:font-bold file:text-[#183b70]"
            />

            {file && (
              <p className="mt-2 text-xs font-semibold text-slate-500">
                Vald fil: {file.name}
              </p>
            )}
          </div>

          <button
            type="button"
            disabled={
              uploading ||
              !title.trim() ||
              !file
            }
            onClick={() => {
              void handleUpload()
            }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#183b70] px-4 py-3 font-bold text-white disabled:opacity-50"
          >
            {uploading ? (
              <>
                <LoaderCircle className="h-5 w-5 animate-spin" />
                Laddar upp…
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                Ladda upp dokument
              </>
            )}
          </button>

          {error && (
            <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800 ring-1 ring-rose-100">
              {error}
            </p>
          )}

          {success && (
            <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-100">
              {success}
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
          Uppladdade dokument
        </h2>

        <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
          {loading ? (
            <div className="flex items-center justify-center gap-3 px-5 py-10 text-slate-500">
              <LoaderCircle className="h-5 w-5 animate-spin" />
              Hämtar dokument…
            </div>
          ) : documents.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <FileText className="h-6 w-6" />
              </div>

              <p className="mt-4 text-sm text-slate-500">
                Inga dokument har laddats
                upp ännu.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {documents.map(
                (document) => (
                  <div
                    key={document.id}
                    className="flex items-center gap-3 px-5 py-4"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-[#183b70]">
                      <FileText className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-800">
                        {document.title}
                      </p>

                      <p className="mt-1 truncate text-xs text-slate-500">
                        {document.fileName}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={
                        deletingId ===
                        document.id
                      }
                      onClick={() => {
                        void handleDelete(
                          document,
                        )
                      }}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-700 disabled:opacity-50"
                      aria-label={`Radera ${document.title}`}
                    >
                      {deletingId ===
                      document.id ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default DocumentManagerPage