import {
  ArrowRight,
  LockKeyhole,
  Newspaper,
  Wine,
} from 'lucide-react'
import type { ReactNode } from 'react'

type MemberOnlyPageProps = {
  type: 'news' | 'kiddush'
  onBecomeMember: () => void
}

type Content = {
  title: string
  text: string
  icon: ReactNode
}

function MemberOnlyPage({
  type,
  onBecomeMember,
}: MemberOnlyPageProps) {
  const content: Content =
    type === 'news'
      ? {
          title: 'Nyheter',
          text: 'Ta del av nyheter, information och evenemang från Adat Jisrael.',
          icon: <Newspaper className="h-8 w-8" />,
        }
      : {
          title: 'Kiddush',
          text: 'Se kommande Kiddushim och boka ett ledigt datum direkt i appen.',
          icon: <Wine className="h-8 w-8" />,
        }

  return (
    <div className="space-y-5">
      <section className="rounded-3xl bg-white p-7 text-center shadow-sm ring-1 ring-slate-200">
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-sky-50 text-[#183b70]">
          {content.icon}

          <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#183b70] text-white ring-4 ring-white">
            <LockKeyhole className="h-4 w-4" />
          </div>
        </div>

        <p className="mt-7 text-sm font-bold uppercase tracking-wide text-sky-700">
          För medlemmar
        </p>

        <h1 className="mt-2 text-2xl font-bold text-[#183b70]">
          {content.title}
        </h1>

        <p className="mx-auto mt-3 max-w-sm leading-7 text-slate-500">
          {content.text}
        </p>

        <button
          type="button"
          onClick={onBecomeMember}
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#68123f] px-5 py-4 font-bold text-white transition hover:bg-[#561034]"
        >
          Bli medlem
          <ArrowRight className="h-5 w-5" />
        </button>
      </section>

      <p className="px-4 text-center text-sm leading-6 text-slate-400">
        Redan medlem? Kontakta oss om ditt konto saknar medlemsåtkomst.
      </p>
    </div>
  )
}

export default MemberOnlyPage
