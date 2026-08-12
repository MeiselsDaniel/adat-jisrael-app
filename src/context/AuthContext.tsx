import {
  createContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import {
  deleteUser,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { auth } from '../firebase/config'
import {
  loginUser,
  logoutUser,
  registerUser,
} from '../firebase/auth'
import {
  createUserProfile,
  getUserProfile,
  type FirebaseUserProfile,
} from '../firebase/users'

export type RegisterAccountInput = {
  firstName: string
  lastName: string
  email: string
  password: string
  phone?: string
}

type AuthContextValue = {
  firebaseUser: User | null
  profile: FirebaseUserProfile | null
  loading: boolean
  profileLoading: boolean
  authError: string | null

  login: (
    email: string,
    password: string,
  ) => Promise<void>

  register: (
    input: RegisterAccountInput,
  ) => Promise<void>

  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

export const AuthContext =
  createContext<AuthContextValue | null>(null)

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [firebaseUser, setFirebaseUser] =
    useState<User | null>(null)

  const [profile, setProfile] =
    useState<FirebaseUserProfile | null>(null)

  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] =
    useState(false)

  const [authError, setAuthError] =
    useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        setFirebaseUser(user)
        setAuthError(null)

        if (!user) {
          setProfile(null)
          setProfileLoading(false)
          setLoading(false)
          return
        }

        setProfileLoading(true)

        try {
          const storedProfile =
            await getUserProfile(user.uid)

          setProfile(storedProfile)
        } catch (error) {
          console.error(
            'Kunde inte läsa användarprofilen:',
            error,
          )

          setProfile(null)
          setAuthError(
            'Kunde inte läsa din användarprofil.',
          )
        } finally {
          setProfileLoading(false)
          setLoading(false)
        }
      },
      (error) => {
        console.error(
          'Firebase Authentication-fel:',
          error,
        )

        setFirebaseUser(null)
        setProfile(null)
        setProfileLoading(false)
        setLoading(false)
        setAuthError(
          'Kunde inte kontrollera inloggningen.',
        )
      },
    )

    return unsubscribe
  }, [])

  async function login(
    email: string,
    password: string,
  ) {
    setAuthError(null)

    await loginUser(
      email.trim().toLowerCase(),
      password,
    )
  }

  async function register({
firstName,
lastName,
email,
password,
phone,
}: RegisterAccountInput) {
setAuthError(null)

const normalizedEmail =
  email.trim().toLowerCase()

const credential = await registerUser(
  normalizedEmail,
  password,
)

/*
 * Radera Authentication-kontot endast
 * om själva Firestore-profilen inte kan skapas.
 */
try {
  await createUserProfile({
    uid: credential.user.uid,
    firstName,
    lastName,
    email: normalizedEmail,
    phone,
  })
} catch (error) {
  try {
    await deleteUser(
      credential.user,
    )
  } catch (deleteError) {
    console.error(
      'Kunde inte återställa det skapade kontot:',
      deleteError,
    )
  }

  throw error
}

/*
 * Profilen finns nu i Firestore.
 * Om den inte kan läsas direkt får vi
 * inte radera Authentication-kontot.
 */
try {
  const createdProfile =
    await getUserProfile(
      credential.user.uid,
    )

  setProfile(createdProfile)
} catch (error) {
  console.error(
    'Kontot skapades men profilen kunde inte läsas direkt:',
    error,
  )

  setProfile(null)
}
}

async function logout() {
    setAuthError(null)
    await logoutUser()
    setProfile(null)
  }

  async function refreshProfile() {
    if (!firebaseUser) {
      setProfile(null)
      return
    }

    setProfileLoading(true)

    try {
      const updatedProfile =
        await getUserProfile(
          firebaseUser.uid,
        )

      setProfile(updatedProfile)
    } finally {
      setProfileLoading(false)
    }
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      firebaseUser,
      profile,
      loading,
      profileLoading,
      authError,
      login,
      register,
      logout,
      refreshProfile,
    }),
    [
      firebaseUser,
      profile,
      loading,
      profileLoading,
      authError,
    ],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}