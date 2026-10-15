import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Users,
} from 'lucide-react'

type Props = {
  onBack: () => void
  onOpenTfilot: () => void
  onOpenMinyanStatistics: () => void
}

export default function GabbaiAdminPage({
  onBack,
  onOpenTfilot,
  onOpenMinyanStatistics,
}: Props) {
  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-semibold text-[#183b70]"
      >
        <ArrowLeft className="h-5 w-5" />
        Tillbaka
      </button>

      <div>
        <h1 className="text-2xl font-black text-slate-900">
          Administration
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Tfilot och minjanstatistik
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
        <button
          onClick={onOpenTfilot}
          className="flex w-full items-center gap-4 border-b border-slate-100 p-5 text-left"
        >
          <CalendarDays className="h-6 w-6 text-[#183b70]" />
          <div className="flex-1">
            <p className="font-bold">Tfilot</p>
            <p className="text-sm text-slate-500">
              Hantera deltagare och bekräfta minjan
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-400" />
        </button>

        <button
          onClick={onOpenMinyanStatistics}
          className="flex w-full items-center gap-4 p-5 text-left"
        >
          <Users className="h-6 w-6 text-[#183b70]" />
          <div className="flex-1">
            <p className="font-bold">Minjanstatistik</p>
            <p className="text-sm text-slate-500">
              Närvaro och genomförda minjanim
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-400" />
        </button>
      </div>
    </div>
  )
}
