import {
  createContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type {
  ReactNode,
} from 'react'
import {
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { auth } from '../firebase/config'
import {
  loginUser,
  logoutUser,
  registerUser,
} from '../firebase/auth'

type AuthContextValue = {
  firebaseUser: User | null
  loading: boolean
  login: (
    email: string,
    password: string,
  ) => Promise<void>
  register: (
    email: string,
    password: string,
  ) => Promise<User>
  logout: () => Promise<void>
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

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setFirebaseUser(user)
        setLoading(false)
      },
      () => {
        setFirebaseUser(null)
        setLoading(false)
      },
    )

    return unsubscribe
  }, [])

  async function login(
    email: string,
    password: string,
  ) {
    await loginUser(email, password)
  }

  async function register(
    email: string,
    password: string,
  ) {
    const credential = await registerUser(
      email,
      password,
    )

    return credential.user
  }

  async function logout() {
    await logoutUser()
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      firebaseUser,
      loading,
      login,
      register,
      logout,
    }),
    [firebaseUser, loading],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}