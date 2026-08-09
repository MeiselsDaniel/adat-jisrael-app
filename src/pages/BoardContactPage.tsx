import {
  ArrowLeft,
  Mail,
  Users,
  BookOpen,
} from 'lucide-react'

type BoardContactPageProps = {
  onBack: () => void
}

const boardMembers = [
  {
    name: 'Daniel Meisels',
    title: 'Ordförande',
  },
  {
    name: 'Ofer Maimon Gralvik',
    title: 'Vice ordförande',
  },
  {
    name: 'Jakob Abramowicz',
    title: 'Kassör',
  },
  {
    name: 'Emil Andersson',
    title: 'Sekreterare',
  },
  {
    name: 'Hagai Cohen',
    title: 'Ledamot',
  },
  {
    name: 'Paul Widén',
    title: 'Ledamot',
  },
]

function BoardContactPage({
  onBack,
}: BoardContactPageProps) {
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
            Styrelse & kontakt
          </h1>
        </div>
      </header>

      <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 text-[#183b70]">
            <Users className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-bold text-[#183b70]">
              Styrelsen
            </h2>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {boardMembers.map((member) => (
            <div
              key={member.name}
              className="px-5 py-4"
            >
              <p className="font-bold text-slate-800">
                {member.name}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {member.title}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 text-[#183b70]">
            <Mail className="h-5 w-5" />
          </div>

          <h2 className="font-bold text-[#183b70]">
            Kontakt
          </h2>
        </div>

        <a
          href="mailto:info@adatjisrael.se"
          className="block px-5 py-4 text-sm font-semibold text-[#183b70]"
        >
          info@adatjisrael.se
        </a>
      </section>

      <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100 text-violet-800">
            <BookOpen className="h-5 w-5" />
          </div>

          <h2 className="font-bold text-[#183b70]">
            Rabbin
          </h2>
        </div>

        <div className="px-5 py-4">
          <p className="font-bold text-slate-800">
            Mattias Amster
          </p>

          <a
            href="mailto:mattias.amster@jfst.se"
            className="mt-2 block text-sm font-semibold text-[#183b70]"
          >
            mattias.amster@jfst.se
          </a>
        </div>
      </section>
    </div>
  )
}

export default BoardContactPage
