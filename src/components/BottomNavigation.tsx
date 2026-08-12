import {
  CalendarDays,
  Home,
  Menu,
  Newspaper,
  UserPlus,
  Wine,
} from 'lucide-react'
import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AppUser, Page } from '../types'
import { useAuth } from '../hooks/useAuth'
import {
  subscribeToPublishedNews,
  type NewsPost,
} from '../services/newsService'
import {
  subscribeToUserNewsReads,
  type NewsRead,
} from '../services/newsReadsService'

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
  const { firebaseUser } =
    useAuth()

  const [publishedNews, setPublishedNews] =
    useState<NewsPost[]>([])

  const [newsReads, setNewsReads] =
    useState<NewsRead[]>([])

  const isMember =
    user.permissions.viewMemberInformation &&
    user.permissions.bookKiddush

  useEffect(() => {
    if (!isMember) {
      setPublishedNews([])
      return
    }

    return subscribeToPublishedNews(
      setPublishedNews,
      (error) => {
        console.error(
          'Kunde inte läsa nyheter till menybadgen:',
          error,
        )
      },
    )
  }, [isMember])

  useEffect(() => {
    if (
      !isMember ||
      !firebaseUser
    ) {
      setNewsReads([])
      return
    }

    return subscribeToUserNewsReads(
      firebaseUser.uid,
      setNewsReads,
      (error) => {
        console.error(
          'Kunde inte läsa nyhetsstatus till menybadgen:',
          error,
        )
      },
    )
  }, [
    firebaseUser,
    isMember,
  ])

  const unreadNewsCount =
    useMemo(() => {
      const readIds =
        new Set(
          newsReads.map(
            (read) =>
              read.newsId,
          ),
        )

      return publishedNews.filter(
        (post) =>
          !readIds.has(post.id),
      ).length
    }, [
      newsReads,
      publishedNews,
    ])

  if (!isMember) {
    return (
      <nav className="fixed bottom-0 left-1/2 z-20 grid w-full max-w-md -translate-x-1/2 grid-cols-4 border-t border-slate-200 bg-white/95 px-3 pt-2 backdrop-blur [padding-bottom:calc(0.75rem+env(safe-area-inset-bottom))]">
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
    <nav className="fixed bottom-0 left-1/2 z-20 grid w-full max-w-md -translate-x-1/2 grid-cols-5 border-t border-slate-200 bg-white/95 px-2 pt-2 backdrop-blur [padding-bottom:calc(0.75rem+env(safe-area-inset-bottom))]">
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
        label="Nyheter"
        icon={<Newspaper className="h-5 w-5" />}
        badge={
          unreadNewsCount > 0
            ? unreadNewsCount
            : undefined
        }
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
  badge?: number
  onClick: () => void
}

function NavButton({
  active,
  label,
  icon,
  badge,
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
      <span className="relative">
        {icon}

        {badge !== undefined &&
          badge > 0 && (
            <span className="absolute -right-3 -top-2 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-black leading-none text-white ring-2 ring-white">
              {badge > 99
                ? '99+'
                : badge}
            </span>
          )}
      </span>

      <span className="max-w-full truncate">
        {label}
      </span>
    </button>
  )
}

export default BottomNavigation