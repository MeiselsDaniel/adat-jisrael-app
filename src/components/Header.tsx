import type { Page } from '../types'

type HeaderProps = {
  page: Page
}

const pageTitles: Record<Page, string> = {
  home: 'Hem',
  calendar: 'Kalender',
  kiddush: 'Kiddush',
  more: 'Mer',
}

function Header({ page }: HeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white px-5 pb-4 pt-4">
      <div className="flex items-center justify-between gap-4">
        <img
          src="/adat-jisrael-logo.png"
          alt="Adat Jisrael"
          className="h-14 w-auto object-contain"
        />

        {page !== 'home' && (
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
              Adat Jisrael
            </p>

            <h1 className="mt-1 text-xl font-bold text-[#183b70]">
              {pageTitles[page]}
            </h1>
          </div>
        )}
      </div>

      {page === 'home' && (
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-sky-50 px-4 py-3">
          <div>
            <p className="text-sm font-bold text-[#183b70]">
              22 Av 5786
            </p>

            <p className="mt-0.5 text-xs text-slate-500">
              Onsdag 5 augusti
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-500">
              Shabbat börjar
            </p>

            <p className="text-sm font-bold text-[#68123f]">
              Fredag 20.31
            </p>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header