import { useState } from 'react'
import type { FormEvent } from 'react'
import { FirebaseError } from 'firebase/app'
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  User,
} from 'lucide-react'
import { resetPassword } from '../firebase/auth'
import { useAuth } from '../hooks/useAuth'

type LoginMode = 'login' | 'register'

function LoginPage() {
  const { login, register } = useAuth()

  const [mode, setMode] =
    useState<LoginMode>('login')

  const [firstName, setFirstName] =
    useState('')
  const [lastName, setLastName] =
    useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] =
    useState('')
  const [confirmPassword, setConfirmPassword] =
    useState('')

  const [showPassword, setShowPassword] =
    useState(false)

  const [submitting, setSubmitting] =
    useState(false)

  const [error, setError] = useState('')

  const [resetMessage, setResetMessage] =
    useState('')

  const [
    resettingPassword,
    setResettingPassword,
  ] = useState(false)

  function changeMode(nextMode: LoginMode) {
    setMode(nextMode)
    setError('')
    setPassword('')
    setConfirmPassword('')
  }

  async function handlePasswordReset() {
    setError('')
    setResetMessage('')

    const normalizedEmail =
      email.trim().toLowerCase()

    if (!normalizedEmail) {
      setError(
        'Skriv in din e-postadress först.',
      )
      return
    }

    try {
      setResettingPassword(true)

      await resetPassword(
        normalizedEmail,
      )

      setResetMessage(
        'Vi har skickat ett mejl med en länk för att välja ett nytt lösenord.',
      )
    } catch (caughtError) {
      setError(
        getFirebaseErrorMessage(
          caughtError,
        ),
      )
    } finally {
      setResettingPassword(false)
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()
    setError('')

    const normalizedEmail =
      email.trim().toLowerCase()

    if (!normalizedEmail) {
      setError('Skriv in din e-postadress.')
      return
    }

    if (!password) {
      setError('Skriv in ditt lösenord.')
      return
    }

    if (password.length < 6) {
      setError(
        'Lösenordet måste innehålla minst sex tecken.',
      )
      return
    }

    if (mode === 'register') {
      if (!firstName.trim()) {
        setError('Skriv in ditt förnamn.')
        return
      }

      if (!lastName.trim()) {
        setError('Skriv in ditt efternamn.')
        return
      }

      if (password !== confirmPassword) {
        setError('Lösenorden stämmer inte överens.')
        return
      }
    }

    setSubmitting(true)

    try {
      if (mode === 'login') {
        await login(normalizedEmail, password)
      } else {
        await register({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: normalizedEmail,
          password,
        })
      }
    } catch (caughtError) {
      setError(
        getFirebaseErrorMessage(caughtError),
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <div className="w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-xl">
        <div className="bg-[#183b70] px-6 pb-8 pt-7 text-white">
          <img
            src="/adat-jisrael-logo.png"
            alt="Adat Jisrael"
            className="h-16 w-auto rounded-xl bg-white p-2"
          />

          <h1 className="mt-7 text-3xl font-bold">
            Välkommen till Adat Jisrael
          </h1>

          <p className="mt-3 leading-6 text-blue-100">
            Logga in eller skapa ett konto för att
            ta del av Adat Jisraels app.
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() =>
                changeMode('login')
              }
              className={`rounded-xl px-3 py-2.5 text-sm font-bold transition ${
                mode === 'login'
                  ? 'bg-white text-[#183b70] shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              Logga in
            </button>

            <button
              type="button"
              onClick={() =>
                changeMode('register')
              }
              className={`rounded-xl px-3 py-2.5 text-sm font-bold transition ${
                mode === 'register'
                  ? 'bg-white text-[#183b70] shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              Skapa konto
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-4"
          >
            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="Förnamn"
                  value={firstName}
                  onChange={setFirstName}
                  autoComplete="given-name"
                  placeholder="Förnamn"
                  icon={
                    <User className="h-5 w-5" />
                  }
                />

                <TextField
                  label="Efternamn"
                  value={lastName}
                  onChange={setLastName}
                  autoComplete="family-name"
                  placeholder="Efternamn"
                  icon={
                    <User className="h-5 w-5" />
                  }
                />
              </div>
            )}

            <TextField
              label="E-postadress"
              value={email}
              onChange={setEmail}
              type="email"
              autoComplete="email"
              placeholder="namn@exempel.se"
              icon={
                <Mail className="h-5 w-5" />
              }
            />

            <PasswordField
              label="Lösenord"
              value={password}
              onChange={setPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              autoComplete={
                mode === 'login'
                  ? 'current-password'
                  : 'new-password'
              }
            />

            {mode === 'login' && (
              <div className="-mt-1 text-right">
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  disabled={resettingPassword}
                  className="text-sm font-semibold text-[#183b70] hover:underline disabled:opacity-60"
                >
                  {resettingPassword
                    ? 'Skickar...'
                    : 'Glömt lösenordet?'}
                </button>
              </div>
            )}

            {mode === 'register' && (
              <PasswordField
                label="Bekräfta lösenord"
                value={confirmPassword}
                onChange={setConfirmPassword}
                showPassword={showPassword}
                setShowPassword={
                  setShowPassword
                }
                autoComplete="new-password"
              />
            )}

            {resetMessage && (
              <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold leading-6 text-emerald-800">
                {resetMessage}
              </div>
            )}

            {error && (
              <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold leading-6 text-rose-800">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#183b70] px-4 py-3.5 font-bold text-white transition hover:bg-[#102d57] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? 'Arbetar...'
                : mode === 'login'
                  ? 'Logga in'
                  : 'Skapa konto'}

              {!submitting && (
                <ArrowRight className="h-5 w-5" />
              )}
            </button>
          </form>

          <div className="mt-6 flex gap-3 rounded-2xl bg-sky-50 p-4 text-sm text-slate-600">
            <LockKeyhole className="h-5 w-5 shrink-0 text-[#183b70]" />

            <p>
              Nya konton behöver godkännas av Adat
              Jisrael innan appens innehåll blir
              tillgängligt.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

type TextFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'email'
  autoComplete: string
  placeholder: string
  icon: React.ReactNode
}

function TextField({
  label,
  value,
  onChange,
  type = 'text',
  autoComplete,
  placeholder,
  icon,
}: TextFieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">
        {label}
      </span>

      <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-sky-600">
        <span className="shrink-0 text-slate-400">
          {icon}
        </span>

        <input
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="min-w-0 w-full bg-transparent outline-none"
        />
      </div>
    </label>
  )
}

type PasswordFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  showPassword: boolean
  setShowPassword: (show: boolean) => void
  autoComplete: string
}

function PasswordField({
  label,
  value,
  onChange,
  showPassword,
  setShowPassword,
  autoComplete,
}: PasswordFieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">
        {label}
      </span>

      <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-sky-600">
        <LockKeyhole className="h-5 w-5 shrink-0 text-slate-400" />

        <input
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          type={
            showPassword ? 'text' : 'password'
          }
          autoComplete={autoComplete}
          placeholder="Minst sex tecken"
          className="min-w-0 flex-1 bg-transparent outline-none"
        />

        <button
          type="button"
          onClick={() =>
            setShowPassword(!showPassword)
          }
          className="shrink-0 text-slate-400"
          aria-label={
            showPassword
              ? 'Dölj lösenord'
              : 'Visa lösenord'
          }
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>
    </label>
  )
}

function getFirebaseErrorMessage(
  error: unknown,
): string {
  if (!(error instanceof FirebaseError)) {
    return 'Något gick fel. Försök igen.'
  }

  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'Det finns redan ett konto med den e-postadressen.'

    case 'auth/invalid-email':
      return 'E-postadressen är inte giltig.'

    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Fel e-postadress eller lösenord.'

    case 'auth/weak-password':
      return 'Lösenordet är för svagt. Använd minst sex tecken.'

    case 'auth/too-many-requests':
      return 'För många försök. Vänta en stund och försök igen.'

    case 'auth/network-request-failed':
      return 'Kunde inte ansluta. Kontrollera internetanslutningen.'

    case 'permission-denied':
    case 'firestore/permission-denied':
      return 'Kontot kunde inte sparas. Kontrollera Firestore-reglerna.'

    default:
      console.error(
        'Firebase-fel:',
        error.code,
        error.message,
      )

      return 'Något gick fel. Försök igen.'
  }
}

export default LoginPage