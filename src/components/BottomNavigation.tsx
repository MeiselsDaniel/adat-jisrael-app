import {
  CalendarDays,
  Home,
  Menu,
  Newspaper,
  UserPlus,
  Wine,
} from 'lucide-react'
import type { ReactNode } from 'react'
import type { AppUser, Page } from '../types'

type BottomNavigationProps = {
  page: Page
  setPage: (page: Page) => void
  user: AppUser
}

function BottomNavigation({
  page,
  setPage,
  user,
}: BottomNavigationProps) {
  const isMember =
    user.permissions.viewMemberInformation &&
    user.permissions.bookKiddush

  if (!isMember) {
    return (
      <nav className="fixed bottom-0 left-1/2 z-20 grid w-full max-w-md -translate-x-1/2 grid-cols-4 border-t border-slate-200 bg-white/95 px-3 pb-5 pt-2 backdrop-blur">
        <NavButton
          active={page === 'home'}
          label="Hem"
          icon={<Home className="h-5 w-5" />}
          onClick={() => setPage('home')}
        />

        <NavButton
          active={page === 'calendar'}
          label="Kalender"
          icon={<CalendarDays className="h-5 w-5" />}
          onClick={() => setPage('calendar')}
        />

        <NavButton
          active={page === 'membership'}
          label="Medlemskap"
          icon={<UserPlus className="h-5 w-5" />}
          onClick={() => setPage('membership')}
        />

        <NavButton
          active={page === 'more'}
          label="Mer"
          icon={<Menu className="h-5 w-5" />}
          onClick={() => setPage('more')}
        />
      </nav>
    )
  }

  return (
    <nav className="fixed bottom-0 left-1/2 z-20 grid w-full max-w-md -translate-x-1/2 grid-cols-5 border-t border-slate-200 bg-white/95 px-2 pb-5 pt-2 backdrop-blur">
      <NavButton
        active={page === 'home'}
        label="Hem"
        icon={<Home className="h-5 w-5" />}
        onClick={() => setPage('home')}
      />

      <NavButton
        active={page === 'calendar'}
        label="Kalender"
        icon={<CalendarDays className="h-5 w-5" />}
        onClick={() => setPage('calendar')}
      />

      <NavButton
        active={page === 'information'}
        label="Information"
        icon={<Newspaper className="h-5 w-5" />}
        onClick={() => setPage('information')}
      />

      <NavButton
        active={page === 'kiddush'}
        label="Kiddush"
        icon={<Wine className="h-5 w-5" />}
        onClick={() => setPage('kiddush')}
      />

      <NavButton
        active={page === 'more'}
        label="Mer"
        icon={<Menu className="h-5 w-5" />}
        onClick={() => setPage('more')}
      />
    </nav>
  )
}

type NavButtonProps = {
  active: boolean
  label: string
  icon: ReactNode
  onClick: () => void
}

function NavButton({
  active,
  label,
  icon,
  onClick,
}: NavButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-w-0 flex-col items-center gap-1 rounded-xl px-0.5 py-2 text-[10px] font-semibold transition sm:text-xs ${
        active
          ? 'bg-sky-50 text-[#183b70]'
          : 'text-slate-400 hover:text-slate-700'
      }`}
    >
      {icon}

      <span className="max-w-full truncate">
        {label}
      </span>
    </button>
  )
}

export default BottomNavigation