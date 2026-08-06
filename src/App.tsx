import { useMemo, useState } from 'react'
import BottomNavigation from './components/BottomNavigation'
import Header from './components/Header'
import { getDefaultPermissions } from './data/users'
import { useAuth } from './hooks/useAuth'
import AdminPage from './pages/AdminPage'
import CalendarPage from './pages/CalendarPage'
import EventManagerPage from './pages/EventManagerPage'
import HomePage from './pages/HomePage'
import InformationPage from './pages/InformationPage'
import KiddushPage from './pages/KiddushPage'
import LoginPage from './pages/LoginPage'
import MembershipPage from './pages/MembershipPage'
import MorePage from './pages/MorePage'
import NewEventPage from './pages/NewEventPage'
import PendingApprovalPage from './pages/PendingApprovalPage'
import TefilaManagerPage from './pages/TefilaManagerPage'
import type {
  AppEvent,
  AppUser,
  Page,
  UserCategory,
} from './types'
import type {
  FirebaseUserProfile,
  FirebaseUserRole,
} from './firebase/users'

type AdminView =
  | 'dashboard'
  | 'tfilot'
  | 'events'
  | 'newEvent'

function App() {
  const {
    firebaseUser,
    profile,
    loading,
    profileLoading,
    authError,
    logout,
  } = useAuth()

  const [page, setPage] = useState<Page>('home')
  const [adminOpen, setAdminOpen] = useState(false)
  const [adminView, setAdminView] =
    useState<AdminView>('dashboard')

  const [, setCreatedEvents] =
    useState<AppEvent[]>([])

  const currentUser = useMemo(
    () =>
      profile
        ? convertFirebaseProfile(profile)
        : null,
    [profile],
  )

  async function handleLogout() {
    await logout()
    setPage('home')
    setAdminOpen(false)
    setAdminView('dashboard')
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

  if (loading || profileLoading) {
    return <AppLoadingScreen />
  }

  if (!firebaseUser) {
    return <LoginPage />
  }

  if (!currentUser) {
    return (
      <MissingProfileScreen
        errorMessage={authError}
        onLogout={handleLogout}
      />
    )
  }

  if (currentUser.status === 'pending') {
    return (
      <PendingApprovalPage
        user={currentUser}
        onLogout={handleLogout}
      />
    )
  }

  if (currentUser.status === 'blocked') {
    return (
      <BlockedAccountScreen
        onLogout={handleLogout}
      />
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
              onOpenTfilot={() =>
                setAdminView('tfilot')
              }
              onOpenEvents={() =>
                setAdminView('events')
              }
            />
          )}

          {adminView === 'tfilot' && (
            <TefilaManagerPage
              onBack={() =>
                setAdminView('dashboard')
              }
            />
          )}

          {adminView === 'events' && (
            <EventManagerPage
              onBack={() =>
                setAdminView('dashboard')
              }
              onCreateEvent={() =>
                setAdminView('newEvent')
              }
              onEditEvent={(event) => {
                console.log(
                  'Redigering kopplas in i nästa steg:',
                  event,
                )
              }}
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
              <InformationPage
                user={currentUser}
              />
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
              onLogout={handleLogout}
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

function convertFirebaseProfile(
  profile: FirebaseUserProfile,
): AppUser {
  const category =
    getCategoryForRole(profile.role)

  return {
    id: profile.uid,
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    role:
      profile.role === 'admin'
        ? 'admin'
        : 'user',
    category,
    status: profile.status,
    permissions:
      getDefaultPermissions(category),
  }
}

function getCategoryForRole(
  role: FirebaseUserRole,
): UserCategory {
  switch (role) {
    case 'admin':
      return 'board'

    case 'member':
      return 'member'

    case 'guest':
    default:
      return 'guest'
  }
}

function AppLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-[#183b70]" />

        <p className="mt-5 font-bold text-[#183b70]">
          Laddar Adat Jisrael…
        </p>
      </div>
    </div>
  )
}

type MissingProfileScreenProps = {
  errorMessage: string | null
  onLogout: () => Promise<void>
}

function MissingProfileScreen({
  errorMessage,
  onLogout,
}: MissingProfileScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6 text-center">
      <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-xl">
        <h1 className="text-2xl font-bold text-[#183b70]">
          Användarprofil saknas
        </h1>

        <p className="mt-3 leading-7 text-slate-500">
          Kontot är inloggat, men appen kunde inte
          läsa användarprofilen i databasen.
        </p>

        {errorMessage && (
          <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
            {errorMessage}
          </p>
        )}

        <button
          type="button"
          onClick={() => {
            void onLogout()
          }}
          className="mt-6 w-full rounded-2xl bg-slate-100 px-5 py-3 font-bold text-slate-700"
        >
          Logga ut
        </button>
      </div>
    </div>
  )
}

type BlockedAccountScreenProps = {
  onLogout: () => Promise<void>
}

function BlockedAccountScreen({
  onLogout,
}: BlockedAccountScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6 text-center">
      <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-xl">
        <h1 className="text-2xl font-bold text-rose-800">
          Kontot är blockerat
        </h1>

        <p className="mt-3 leading-7 text-slate-500">
          Kontakta Adat Jisrael om du tror att
          detta är felaktigt.
        </p>

        <button
          type="button"
          onClick={() => {
            void onLogout()
          }}
          className="mt-6 w-full rounded-2xl bg-slate-100 px-5 py-3 font-bold text-slate-700"
        >
          Logga ut
        </button>
      </div>
    </div>
  )
}

export default App