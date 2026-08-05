import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  ArrowRight,
  LockKeyhole,
  Mail,
  User,
} from 'lucide-react'
import type { AppUser } from '../types'

type LoginPageProps = {
  onLogin: (email: string) => AppUser | null
  onRegister: (name: string, email: string) => AppUser
}

function LoginPage({
  onLogin,
  onRegister,
}: LoginPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail) {
      setError('Skriv in din e-postadress.')
      return
    }

    if (mode === 'login') {
      const user = onLogin(normalizedEmail)

      if (!user) {
        setError(
          'Vi hittar inget godkänt konto med den e-postadressen.',
        )
      }

      return
    }

    if (!name.trim()) {
      setError('Skriv in ditt namn.')
      return
    }

    onRegister(name.trim(), normalizedEmail)
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
            Logga in för att se kommande tfilot, anmäla dig och
            hantera kiddush.
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setMode('login')
                setError('')
              }}
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
              onClick={() => {
                setMode('register')
                setError('')
              }}
              className={`rounded-xl px-3 py-2.5 text-sm font-bold transition ${
                mode === 'register'
                  ? 'bg-white text-[#183b70] shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              Registrera dig
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-4"
          >
            {mode === 'register' && (
              <label className="block">
                <span className="text-sm font-bold text-slate-700">
                  Namn
                </span>

                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-sky-600">
                  <User className="h-5 w-5 text-slate-400" />

                  <input
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    type="text"
                    autoComplete="name"
                    placeholder="För- och efternamn"
                    className="w-full bg-transparent outline-none"
                  />
                </div>
              </label>
            )}

            <label className="block">
              <span className="text-sm font-bold text-slate-700">
                E-postadress
              </span>

              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-sky-600">
                <Mail className="h-5 w-5 text-slate-400" />

                <input
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  type="email"
                  autoComplete="email"
                  placeholder="namn@exempel.se"
                  className="w-full bg-transparent outline-none"
                />
              </div>
            </label>

            {error && (
              <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#183b70] px-4 py-3.5 font-bold text-white transition hover:bg-[#102d57]"
            >
              {mode === 'login'
                ? 'Fortsätt'
                : 'Skicka registrering'}

              <ArrowRight className="h-5 w-5" />
            </button>
          </form>

          <div className="mt-6 flex gap-3 rounded-2xl bg-sky-50 p-4 text-sm text-slate-600">
            <LockKeyhole className="h-5 w-5 shrink-0 text-[#183b70]" />

            <p>
              Den riktiga versionen kommer att verifiera
              e-postadressen med en personlig engångslänk.
            </p>
          </div>

          <div className="mt-5 border-t border-slate-200 pt-5">
            <p className="text-xs leading-5 text-slate-400">
              Testkonto: medlem@adatjisrael.se
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage