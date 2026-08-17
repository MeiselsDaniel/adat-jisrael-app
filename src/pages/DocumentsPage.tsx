import {
  ArrowLeft,
  ExternalLink,
  FileText,
  LoaderCircle,
} from 'lucide-react'
import {
  useEffect,
  useState,
} from 'react'
import {
  subscribeToDocuments,
  type MemberDocument,
} from '../services/documentService'

type DocumentsPageProps = {
  onBack: () => void
}

function DocumentsPage({
  onBack,
}: DocumentsPageProps) {
  const [
    documents,
    setDocuments,
  ] = useState<MemberDocument[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    return subscribeToDocuments(
      (nextDocuments) => {
        setDocuments(nextDocuments)
        setLoading(false)
      },
      (caughtError) => {
        console.error(
          'Kunde inte läsa dokument:',
          caughtError,
        )

        setError(
          'Dokumenten kunde inte hämtas.',
        )

        setLoading(false)
      },
    )
  }, [])

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
            Adat Jisrael
          </p>

          <h1 className="text-2xl font-bold text-[#183b70]">
            Dokument
          </h1>
        </div>
      </header>

      <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-[#183b70]">
            <FileText className="h-6 w-6" />
          </div>

          <div>
            <h2 className="font-bold text-[#183b70]">
              Medlemsdokument
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Dokument och handlingar för medlemmar
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 px-5 py-10 text-slate-500">
            <LoaderCircle className="h-5 w-5 animate-spin" />
            Hämtar dokument…
          </div>
        ) : error ? (
          <div className="p-5">
            <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
              {error}
            </p>
          </div>
        ) : documents.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <FileText className="h-6 w-6" />
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Inga dokument har publicerats ännu.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {documents.map((document) => (
              <a
                key={document.id}
                href={document.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 px-5 py-4 transition hover:bg-slate-50"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-[#183b70]">
                  <FileText className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-800">
                    {document.title}
                  </p>

                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    PDF
                  </p>
                </div>

                <ExternalLink className="h-5 w-5 shrink-0 text-slate-400" />
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default DocumentsPage
