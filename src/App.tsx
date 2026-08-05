import { useState } from 'react'
import BottomNavigation from './components/BottomNavigation'
import Header from './components/Header'
import CalendarPage from './pages/CalendarPage'
import HomePage from './pages/HomePage'
import KiddushPage from './pages/KiddushPage'
import ProfilePage from './pages/ProfilePage'
import type { Page } from './types'

function App() {
  const [page, setPage] = useState<Page>('home')

  const [registrations, setRegistrations] = useState<
    Record<number, boolean>
  >({})

  function toggleRegistration(tefilaId: number) {
    setRegistrations((current) => ({
      ...current,
      [tefilaId]: !current[tefilaId],
    }))
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-[#f8fafc] shadow-xl">
        <Header page={page} />

        <main className="flex-1 px-4 pb-28 pt-5">
          {page === 'home' && (
            <HomePage
              registrations={registrations}
              toggleRegistration={toggleRegistration}
              openCalendar={() => setPage('calendar')}
              openKiddush={() => setPage('kiddush')}
            />
          )}

          {page === 'calendar' && <CalendarPage />}

          {page === 'kiddush' && <KiddushPage />}

          {page === 'profile' && <ProfilePage />}
        </main>

        <BottomNavigation page={page} setPage={setPage} />
      </div>
    </div>
  )
}

export default App