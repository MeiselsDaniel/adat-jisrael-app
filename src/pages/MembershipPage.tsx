import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  ArrowRight,
  Check,
  Heart,
  Mail,
  MapPin,
  Phone,
  Send,
  User,
  Users,
} from 'lucide-react'

type MembershipPageProps = {
  userName: string
  userEmail: string
}

function MembershipPage({
  userName,
  userEmail,
}: MembershipPageProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [name, setName] = useState(userName)
  const [email, setEmail] = useState(userEmail)
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Skriv in ditt namn.')
      return
    }

    if (!email.trim()) {
      setError('Skriv in din e-postadress.')
      return
    }

    setSubmitted(true)
    setFormOpen(false)
  }

  if (submitted) {
    return (
      <div className="space-y-5">
        <section className="rounded-3xl bg-white p-7 text-center shadow-sm ring-1 ring-slate-200">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <Check className="h-9 w-9" />
          </div>

          <h1 className="mt-6 text-2xl font-bold text-[#183b70]">
            Tack för din medlemsansökan
          </h1>

          <p className="mt-3 leading-7 text-slate-500">
            Din medlemsansökan har registrerats och kommer
        att behandlas av Adat Jisraels styrelse. Vi
        kontaktar dig med mer information om nästa steg.
          </p>

          <div className="mt-6 rounded-2xl bg-sky-50 px-4 py-4 text-left">
            <p className="text-sm font-bold text-[#183b70]">
              Ansökan registrerad för
            </p>

            <p className="mt-1 text-sm text-slate-600">
              {name}
            </p>

            <p className="mt-1 break-all text-sm text-slate-500">
              {email}
            </p>
          </div>

          <p className="mt-6 text-sm leading-6 text-slate-500">
            Fram till dess har du fortsatt tillgång till
        appen som icke-medlem. När styrelsen har godkänt
        medlemskapet kan ditt konto uppgraderas till
        medlem.
          </p>
        </section>
      </div>
    )
  }

  if (formOpen) {
    return (
      <div className="space-y-5">
        <section>
          <p className="text-sm font-semibold text-sky-700">
            Adat Jisrael
          </p>

          <h1 className="mt-1 text-2xl font-bold text-[#183b70]">
            Ansök om medlemskap
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Fyll i dina uppgifter så behandlar vi din
            ansökan.
          </p>
        </section>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <section className="space-y-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <FormField
              label="Namn"
              icon={<User className="h-5 w-5" />}
            >
              <input
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                type="text"
                autoComplete="name"
                className="w-full bg-transparent outline-none"
              />
            </FormField>

            <FormField
              label="E-postadress"
              icon={<Mail className="h-5 w-5" />}
            >
              <input
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                type="email"
                autoComplete="email"
                className="w-full bg-transparent outline-none"
              />
            </FormField>

            <FormField
              label="Telefonnummer"
              icon={<Phone className="h-5 w-5" />}
            >
              <input
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
                type="tel"
                autoComplete="tel"
                placeholder="Valfritt"
                className="w-full bg-transparent outline-none"
              />
            </FormField>

            <FormField
              label="Adress"
              icon={<MapPin className="h-5 w-5" />}
            >
              <input
                value={address}
                onChange={(event) =>
                  setAddress(event.target.value)
                }
                type="text"
                autoComplete="street-address"
                placeholder="Valfritt"
                className="w-full bg-transparent outline-none"
              />
            </FormField>

            <label className="block">
              <span className="text-sm font-bold text-slate-700">
                Meddelande
              </span>

              <textarea
                value={message}
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                rows={4}
                placeholder="Berätta gärna kort om din anknytning till Adat Jisrael."
                className="mt-2 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-600"
              />
            </label>
          </section>

          {error && (
            <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#183b70] px-5 py-4 font-bold text-white transition hover:bg-[#102d57]"
          >
            <Send className="h-5 w-5" />
            Skicka ansökan
          </button>

          <button
            type="button"
            onClick={() => setFormOpen(false)}
            className="w-full rounded-2xl bg-slate-100 px-5 py-3.5 font-bold text-slate-700"
          >
            Tillbaka
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-3xl bg-[#183b70] text-white shadow-sm">
        <div className="p-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
            <Users className="h-7 w-7" />
          </div>

          <h1 className="mt-6 text-2xl font-bold">
            Medlemskap i Adat Jisrael
          </h1>

          <p className="mt-3 leading-7 text-blue-100">
            Som medlem bidrar du till ett levande judiskt
            församlingsliv och till Adat Jisraels framtid.
          </p>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-lg font-bold text-[#183b70]">
          Att vara medlem
        </h2>

        <div className="mt-5 space-y-5">
      <Benefit
        title="Gemenskap & inflytande"
        text="Adat Jisrael är inte en tjänst vi nyttjar, utan en gemenskap vi bygger tillsammans. Som medlem är du med och formar församlingen, stödjer verksamheten och bidrar till Adat Jisraels framtid."
      />

      <Benefit
        title="Tillgång till hela appen"
        text="Som icke-medlem har du bara tillgång till en begränsad del av appen. Som medlem får du hela Adat Jisrael-appen med medlemsnyheter och information, aktiviteter, Kiddushbokning, anmälan till minjan och andra medlemsfunktioner."
      />

      <Benefit
        title="Judiskt liv i vardagen"
        text="Appen hjälper dig också att hålla koll på det judiska året och livet i församlingen, med bland annat kalender, tider för tfilot och personliga Jahrzeit-påminnelser."
      />

      <Benefit
        title="Medlemsförmåner"
        text="Som medlem får du medlemspris på utvalda aktiviteter och evenemang och tillgång till sådant som är särskilt för Adat Jisraels medlemmar."
      />
    </div>
      </section>

      <section className="flex gap-4 rounded-3xl bg-rose-50 p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#68123f]">
          <Heart className="h-6 w-6" />
        </div>

        <div>
          <h2 className="font-bold text-[#68123f]">
            Ditt medlemskap är viktigt
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Medlemskap och engagemang gör det möjligt för
            Adat Jisrael att upprätthålla tfilot, gemenskap
            och judiskt liv i Stockholm.
          </p>
        </div>
      </section>

      <button
        type="button"
        onClick={() => setFormOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#68123f] px-5 py-4 font-bold text-white transition hover:bg-[#561034]"
      >
        Ansök om medlemskap
        <ArrowRight className="h-5 w-5" />
      </button>
    </div>
  )
}

type FormFieldProps = {
  label: string
  icon: React.ReactNode
  children: React.ReactNode
}

function FormField({
  label,
  icon,
  children,
}: FormFieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">
        {label}
      </span>

      <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-sky-600">
        <span className="text-slate-400">{icon}</span>
        {children}
      </div>
    </label>
  )
}

type BenefitProps = {
  title: string
  text: string
}

function Benefit({
  title,
  text,
}: BenefitProps) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
        <Check className="h-4 w-4" />
      </div>

      <div>
        <h3 className="font-bold text-slate-800">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-6 text-slate-600">
          {text}
        </p>
      </div>
    </div>
  )
}

export default MembershipPage