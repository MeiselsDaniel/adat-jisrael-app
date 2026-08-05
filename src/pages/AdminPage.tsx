import {
  CalendarDays,
  ChevronRight,
  FileText,
  Plus,
  Settings,
  Users,
  Wine,
} from 'lucide-react'

type AdminPageProps = {
  onBack: () => void
}

function AdminPage({ onBack }: AdminPageProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-sky-700">
            Adat Jisrael
          </p>

          <h1 className="mt-1 text-2xl font-bold text-[#183b70]">
            Administration
          </h1>
        </div>

        <button
          onClick={onBack}
          className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700"
        >
          Tillbaka
        </button>
      </div>

      <button className="flex w-full items-center gap-4 rounded-3xl bg-[#183b70] p-5 text-left text-white shadow-sm transition hover:bg-[#102d57]">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
          <Plus className="h-6 w-6" />
        </div>

        <div className="flex-1">
          <p className="text-lg font-bold">Ny händelse</p>

          <p className="mt-1 text-sm text-blue-100">
            Skapa tefila, Jahrzeit, aktivitet eller annan händelse
          </p>
        </div>

        <ChevronRight className="h-5 w-5" />
      </button>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
          Hantera
        </h2>

        <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
          <AdminMenuItem
            icon={<CalendarDays className="h-6 w-6" />}
            title="Händelser"
            description="Tfilot, aktiviteter, högtider och Jahrzeit"
          />

          <AdminMenuItem
            icon={<FileText className="h-6 w-6" />}
            title="Information"
            description="Publicera nyheter och meddelanden"
          />

          <AdminMenuItem
            icon={<Users className="h-6 w-6" />}
            title="Användare"
            description="Godkänn konton och hantera behörigheter"
          />

          <AdminMenuItem
            icon={<Wine className="h-6 w-6" />}
            title="Kiddush"
            description="Hantera bokade och lediga datum"
          />

          <AdminMenuItem
            icon={<Settings className="h-6 w-6" />}
            title="Inställningar"
            description="Standardschema och appinställningar"
          />
        </div>
      </section>

      <section className="rounded-3xl bg-sky-50 p-5">
        <p className="font-bold text-[#183b70]">
          Kommande förbättring
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Här kommer du senare kunna ändra tider, publicera
          medlemsinformation och godkänna nya användare utan att
          röra koden.
        </p>
      </section>
    </div>
  )
}

type AdminMenuItemProps = {
  icon: React.ReactNode
  title: string
  description: string
}

function AdminMenuItem({
  icon,
  title,
  description,
}: AdminMenuItemProps) {
  return (
    <button className="flex w-full items-center gap-4 border-b border-slate-100 px-5 py-4 text-left last:border-0">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-[#183b70]">
        {icon}
      </div>

      <div className="flex-1">
        <p className="font-bold text-slate-800">{title}</p>

        <p className="mt-1 text-sm leading-5 text-slate-500">
          {description}
        </p>
      </div>

      <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
    </button>
  )
}

export default AdminPage