import {
  createContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import {
  deleteUser,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
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
  deleteUserProfile,
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
  deleteAccount: (password: string) => Promise<void>
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

  async function deleteAccount(
    password: string,
  ) {
    setAuthError(null)

    if (!firebaseUser || !firebaseUser.email) {
      throw new Error('Ingen inloggad användare.')
    }

    const user = firebaseUser
    const uid = user.uid
    const email = user.email

    if (!email) {
      throw new Error(
        'Kontot saknar e-postadress.',
      )
    }

    const credential =
      EmailAuthProvider.credential(
        email,
        password,
      )

    /*
     * Firebase kräver färsk autentisering för
     * känsliga åtgärder som permanent kontoradering.
     */
    await reauthenticateWithCredential(
      user,
      credential,
    )

    /*
     * När autentiseringen är verifierad raderas
     * användarprofilen och därefter själva kontot.
     */
    await deleteUserProfile(uid)
    await deleteUser(user)

    setProfile(null)
    setFirebaseUser(null)
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
      deleteAccount,
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