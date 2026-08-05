import {
  CalendarDays,
  Home,
  User,
  Wine,
} from 'lucide-react'
import type { ReactNode } from 'react'
import type { Page } from '../types'

type BottomNavigationProps = {
  page: Page
  setPage: (page: Page) => void
}

function BottomNavigation({
  page,
  setPage,
}: BottomNavigationProps) {
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
        active={page === 'kiddush'}
        label="Kiddush"
        icon={<Wine className="h-5 w-5" />}
        onClick={() => setPage('kiddush')}
      />

      <NavButton
        active={page === 'profile'}
        label="Profil"
        icon={<User className="h-5 w-5" />}
        onClick={() => setPage('profile')}
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
      onClick={onClick}
      className={`flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-xs font-semibold transition ${
        active
          ? 'bg-sky-50 text-[#183b70]'
          : 'text-slate-400 hover:text-slate-700'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

export default BottomNavigation