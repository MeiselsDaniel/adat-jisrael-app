import { useState } from 'react'
import BottomNavigation from './components/BottomNavigation'
import Header from './components/Header'
import {
  demoUsers,
  getDefaultPermissions,
} from './data/users'
import AdminPage from './pages/AdminPage'
import CalendarPage from './pages/CalendarPage'
import HomePage from './pages/HomePage'
import KiddushPage from './pages/KiddushPage'
import LoginPage from './pages/LoginPage'
import MorePage from './pages/MorePage'
import PendingApprovalPage from './pages/PendingApprovalPage'
import type { AppUser, Page } from './types'

function getInitialUser(): AppUser | null {
  const storedUser = localStorage.getItem('adat-current-user')

  if (!storedUser) {
    return null
  }

  try {
    return JSON.parse(storedUser) as AppUser
  } catch {
    localStorage.removeItem('adat-current-user')
    return null
  }
}

function App() {
  const [currentUser, setCurrentUser] =
    useState<AppUser | null>(getInitialUser)

  const [page, setPage] = useState<Page>('home')
  const [adminOpen, setAdminOpen] = useState(false)

  const [registrations, setRegistrations] = useState<
    Record<number, boolean>
  >({})

  function saveCurrentUser(user: AppUser) {
    localStorage.setItem(
      'adat-current-user',
      JSON.stringify(user),
    )

    setCurrentUser(user)
  }

  function login(email: string): AppUser | null {
    const user = demoUsers.find(
      (item) =>
        item.email.toLowerCase() === email.toLowerCase(),
    )

    if (!user) {
      return null
    }

    saveCurrentUser(user)
    return user
  }

  function register(name: string, email: string): AppUser {
    const newUser: AppUser = {
      id: crypto.randomUUID(),
      name,
      email,
      role: 'user',
      category: 'guest',
      status: 'pending',
      permissions: getDefaultPermissions('guest'),
    }

    saveCurrentUser(newUser)
    return newUser
  }

  function logout() {
    localStorage.removeItem('adat-current-user')
    setCurrentUser(null)
    setPage('home')
    setAdminOpen(false)
  }

  function toggleRegistration(tefilaId: number) {
    if (!currentUser?.permissions.registerForTfilot) {
      return
    }

    setRegistrations((current) => ({
      ...current,
      [tefilaId]: !current[tefilaId],
    }))
  }

  if (!currentUser) {
    return (
      <LoginPage
        onLogin={login}
        onRegister={register}
      />
    )
  }

  if (currentUser.status === 'pending') {
    return (
      <PendingApprovalPage
        user={currentUser}
        onLogout={logout}
      />
    )
  }

  if (currentUser.status === 'blocked') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6 text-center">
        <div className="max-w-md rounded-3xl bg-white p-7 shadow-xl">
          <h1 className="text-2xl font-bold text-rose-800">
            Kontot är blockerat
          </h1>

          <p className="mt-3 text-slate-500">
            Kontakta Adat Jisrael om du tror att detta är
            felaktigt.
          </p>

          <button
            onClick={logout}
            className="mt-6 rounded-2xl bg-slate-100 px-5 py-3 font-bold"
          >
            Logga ut
          </button>
        </div>
      </div>
    )
  }

  if (adminOpen) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900">
        <div className="mx-auto min-h-screen w-full max-w-md bg-[#f8fafc] px-4 py-5 shadow-xl">
          <AdminPage
            onBack={() => setAdminOpen(false)}
          />
        </div>
      </div>
    )
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

          {page === 'kiddush' &&
            (currentUser.permissions.bookKiddush ? (
              <KiddushPage />
            ) : (
              <AccessDenied text="Kiddushbokningen är tillgänglig för medlemmar." />
            ))}

          {page === 'more' && (
            <MorePage
              user={currentUser}
              onLogout={logout}
              openAdmin={() => setAdminOpen(true)}
            />
          )}
        </main>

        <BottomNavigation
          page={page}
          setPage={setPage}
        />
      </div>
    </div>
  )
}

type AccessDeniedProps = {
  text: string
}

function AccessDenied({ text }: AccessDeniedProps) {
  return (
    <div className="rounded-3xl bg-white p-7 text-center shadow-sm ring-1 ring-slate-200">
      <h2 className="text-xl font-bold text-[#183b70]">
        Begränsad åtkomst
      </h2>

      <p className="mt-3 leading-7 text-slate-500">
        {text}
      </p>
    </div>
  )
}

export default App