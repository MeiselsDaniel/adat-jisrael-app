import type { Page } from '../types'
import { getHebcalDayInfo } from '../services/hebcalService'

type HeaderProps = {
  page: Page
  userName: string
}

const pageTitles: Record<Page, string> = {
  home: 'Hem',
  calendar: 'Kalender',
  information: 'Nyheter',
  kiddush: 'Kiddush',
  membership: 'Medlemskap',
  boardContact: 'Styrelse & kontakt',
  profile: 'Min profil',
  more: 'Mer',
}

const greetings = [
  'Kom i tid! 😉',
  'Vi ses i shul!',
  'Ja wow, du är här! 😎',
  'Kol hakavod! 💙',
  'Ha en fin dag!',
  'Nu vill jag se leverans! 😁',
  'Välkommen till Adat Jisrael.',
  'En kaffe efter Shacharit? ☕',
  'Am Yisrael Chai! ✡️',
]

function Header({
  page,
  userName,
}: HeaderProps) {
  const today = new Date()

  const hebcalInfo =
    getHebcalDayInfo(
      formatDateValue(today),
    )

  const swedishDate =
    new Intl.DateTimeFormat(
      'sv-SE',
      {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      },
    ).format(today)

  /*
   * Samma hälsning hela dagen.
   * Byts automatiskt nästa kalenderdag.
   */
  const startOfYear = new Date(
    today.getFullYear(),
    0,
    1,
  )

  const dayOfYear = Math.floor(
    (
      today.getTime() -
      startOfYear.getTime()
    ) / 86400000,
  )

  const greeting =
    greetings[
      dayOfYear % greetings.length
    ]

  const hebrewDate =
    formatHebrewDate(
      hebcalInfo.hebrewDate,
    )

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
        <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl bg-sky-50 px-4 py-3">
          <div className="min-w-0">
            <p className="font-bold text-[#183b70]">
              Shalom {userName}
            </p>

            <p className="mt-1 text-xs font-medium text-slate-500">
              {greeting}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-sm font-bold text-[#68123f]">
              {hebrewDate}
            </p>

            <p className="mt-0.5 text-xs capitalize text-slate-500">
              {swedishDate}
            </p>
          </div>
        </div>
      )}
    </header>
  )
}

function formatDateValue(
  date: Date,
): string {
  const year = date.getFullYear()

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0')

  const day = String(
    date.getDate(),
  ).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatHebrewDate(
  value: string,
): string {
  return value
    .replace(
      /^(\d+)(st|nd|rd|th) of /,
      '$1 ',
    )
    .replace(/,/, '')
}

export default Header
