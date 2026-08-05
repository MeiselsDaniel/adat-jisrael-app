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
import InformationPage from './pages/InformationPage'
import KiddushPage from './pages/KiddushPage'
import LoginPage from './pages/LoginPage'
import MembershipPage from './pages/MembershipPage'
import MorePage from './pages/MorePage'
import NewEventPage from './pages/NewEventPage'
import PendingApprovalPage from './pages/PendingApprovalPage'
import type {
  AppEvent,
  AppUser,
  Page,
} from './types'

function getInitialUser(): AppUser | null {
  const storedUser = localStorage.getItem(
    'adat-current-user',
  )

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

type AdminView = 'dashboard' | 'newEvent'

function App() {
  const [currentUser, setCurrentUser] =
    useState<AppUser | null>(getInitialUser)

  const [page, setPage] = useState<Page>('home')
  const [adminOpen, setAdminOpen] = useState(false)
  const [adminView, setAdminView] =
    useState<AdminView>('dashboard')

  const [registrations, setRegistrations] = useState<
    Record<number, boolean>
  >({})

  const [, setCreatedEvents] = useState<AppEvent[]>([])

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
        item.email.toLowerCase() ===
        email.toLowerCase(),
    )

    if (!user) {
      return null
    }

    saveCurrentUser(user)
    return user
  }

  function register(
    name: string,
    email: string,
  ): AppUser {
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
    setAdminView('dashboard')
  }

  function toggleRegistration(tefilaId: number) {
    if (
      !currentUser?.permissions.registerForTfilot
    ) {
      return
    }

    setRegistrations((current) => ({
      ...current,
      [tefilaId]: !current[tefilaId],
    }))
  }

  function openAdmin() {
    setAdminView('dashboard')
    setAdminOpen(true)
  }

  function closeAdmin() {
    setAdminView('dashboard')
    setAdminOpen(false)
  }

  function saveNewEvent(event: AppEvent) {
    setCreatedEvents((current) => [
      event,
      ...current,
    ])
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
            type="button"
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
          {adminView === 'dashboard' && (
            <AdminPage
              onBack={closeAdmin}
              onCreateEvent={() =>
                setAdminView('newEvent')
              }
            />
          )}

          {adminView === 'newEvent' && (
            <NewEventPage
              currentUserId={currentUser.id}
              onBack={() =>
                setAdminView('dashboard')
              }
              onSave={saveNewEvent}
            />
          )}
        </div>
      </div>
    )
  }

  const canAccessMemberInformation =
    currentUser.permissions.viewMemberInformation

  const canAccessKiddush =
    currentUser.permissions.bookKiddush

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-[#f8fafc] shadow-xl">
        <Header page={page} />

        <main className="flex-1 px-4 pb-28 pt-5">
          {page === 'home' && (
            <HomePage
              registrations={registrations}
              toggleRegistration={
                toggleRegistration
              }
              showMemberInformation={
                canAccessMemberInformation
              }
              openInformation={() =>
                setPage('information')
              }
            />
          )}

          {page === 'calendar' && (
            <CalendarPage />
          )}

          {page === 'information' &&
            (canAccessMemberInformation ? (
              <InformationPage user={currentUser} />
            ) : (
              <MembershipPage
                userName={currentUser.name}
                userEmail={currentUser.email}
              />
            ))}

          {page === 'kiddush' &&
            (canAccessKiddush ? (
              <KiddushPage />
            ) : (
              <MembershipPage
                userName={currentUser.name}
                userEmail={currentUser.email}
              />
            ))}

          {page === 'membership' && (
            <MembershipPage
              userName={currentUser.name}
              userEmail={currentUser.email}
            />
          )}

          {page === 'more' && (
            <MorePage
              user={currentUser}
              onLogout={logout}
              openAdmin={openAdmin}
            />
          )}
        </main>

        <BottomNavigation
          page={page}
          setPage={setPage}
          user={currentUser}
        />
      </div>
    </div>
  )
}

export default App