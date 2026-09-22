import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  ArrowRight,
  Check,
  Mail,
  MapPin,
  Phone,
  Send,
  User,
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

  const [feeCalculatorOpen, setFeeCalculatorOpen] =
    useState(false)
  const [feeUnder26, setFeeUnder26] =
    useState<boolean | null>(null)
  const [feeJfstMember, setFeeJfstMember] =
    useState<boolean | null>(null)
  const [feeSeat, setFeeSeat] =
    useState<boolean | null>(null)
  const [feeGender, setFeeGender] =
    useState<'man' | 'woman' | null>(null)

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
      <section className="rounded-3xl bg-[#183b70] p-4 text-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 2.5 20.2 17H3.8L12 2.5Z" />
              <path d="M12 21.5 3.8 7h16.4L12 21.5Z" />
            </svg>
          </div>

          <h1 className="text-xl font-bold">
            Medlemskap i Adat Jisrael
          </h1>
        </div>
      </section>

      <MembershipFeeCalculator
        open={feeCalculatorOpen}
        setOpen={setFeeCalculatorOpen}
        under26={feeUnder26}
        setUnder26={(value) => {
          setFeeUnder26(value)
          setFeeJfstMember(null)
          setFeeSeat(null)
          setFeeGender(null)
        }}
        jfstMember={feeJfstMember}
        setJfstMember={(value) => {
          setFeeJfstMember(value)
          setFeeSeat(null)
          setFeeGender(null)
        }}
        seat={feeSeat}
        setSeat={(value) => {
          setFeeSeat(value)
          setFeeGender(null)
        }}
        gender={feeGender}
        setGender={setFeeGender}
        onApply={() => setFormOpen(true)}
      />

      <button
        type="button"
        onClick={() => setFormOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#68123f] px-5 py-4 font-bold text-white transition hover:bg-[#561034]"
      >
        Ansök om medlemskap
        <ArrowRight className="h-5 w-5" />
      </button>

      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-lg font-bold text-[#183b70]">
          Att vara medlem
        </h2>

        <div className="mt-5 space-y-5">
          <Benefit
            title="Gemenskap & inflytande"
            text="Adat Jisrael är inte en tjänst vi nyttjar, utan en gemenskap vi bygger tillsammans. Som medlem är du med och formar församlingen och bidrar till Adat Jisraels framtid."
          />

          <Benefit
            title="Du gör verksamheten möjlig"
            text="Din medlemsavgift bidrar bland annat till Kiddush, professionell chazan under Yom Kippur, städning av synagogan och andra kostnader som gör att vi kan upprätthålla ett levande judiskt församlingsliv."
          />

          <Benefit
            title="Medlemsförmåner"
            text="Som medlem får du tillgång till hela Adat Jisrael-appen med medlemsnyheter, Kiddushbokning, minjananmälan, personliga Jahrzeit-påminnelser och andra medlemsfunktioner. Du får också medlemspris på utvalda aktiviteter och evenemang."
          />
        </div>
      </section>

      <div className="px-2 text-xs leading-5 text-slate-500">
        <p>
          Enligt Adat Jisraels stadgar kan medlemskap
          beviljas personer som är födda judar eller har
          genomgått en ortodox konvertering.
        </p>

        <p className="mt-2">
          Kan du inte bli medlem men vill stödja Adat Jisrael
          som sponsor?{' '}
          <a
            href="mailto:info@adatjisrael.se"
            className="font-semibold text-[#183b70] underline underline-offset-2"
          >
            Kontakta oss
          </a>
          .
        </p>
      </div>

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

type MembershipFeeCalculatorProps = {
  open: boolean
  setOpen: (value: boolean) => void
  under26: boolean | null
  setUnder26: (value: boolean) => void
  jfstMember: boolean | null
  setJfstMember: (value: boolean) => void
  seat: boolean | null
  setSeat: (value: boolean) => void
  gender: 'man' | 'woman' | null
  setGender: (value: 'man' | 'woman') => void
  onApply: () => void
}

function MembershipFeeCalculator({
  open,
  setOpen,
  under26,
  setUnder26,
  jfstMember,
  setJfstMember,
  seat,
  setSeat,
  gender,
  setGender,
  onApply,
}: MembershipFeeCalculatorProps) {
  let fee: number | null = null
  let summary = ''

  if (under26 === true && seat !== null) {
    fee = seat ? 350 : 100
    summary = `Under 26 år · ${
      seat ? 'med fast plats' : 'utan fast plats'
    }`
  }

  if (
    under26 === false &&
    jfstMember !== null &&
    seat === false
  ) {
    fee = jfstMember ? 1400 : 1700
    summary = `Vuxen · ${
      jfstMember
        ? 'medlem i JFST'
        : 'inte medlem i JFST'
    } · utan fast plats`
  }

  if (
    under26 === false &&
    jfstMember !== null &&
    seat === true &&
    gender !== null
  ) {
    if (jfstMember) {
      fee = gender === 'man' ? 2100 : 1500
    } else {
      fee = gender === 'man' ? 2900 : 2200
    }

    summary = `Vuxen · ${
      jfstMember
        ? 'medlem i JFST'
        : 'inte medlem i JFST'
    } · med fast plats · ${
      gender === 'man' ? 'herr' : 'dam'
    }`
  }

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 text-left"
        aria-expanded={open}
      >
        <div>
          <h2 className="text-lg font-bold text-[#183b70]">
            Räkna ut din medlemsavgift
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Se vad medlemskapet kostar för dig
          </p>
        </div>

        <span
          className={`text-xl text-slate-400 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        >
          ⌄
        </span>
      </button>

      {open && (
        <div className="mt-6 space-y-6">
          <FeeQuestion
            question="Är du under 26 år?"
            value={under26}
            onChange={setUnder26}
          />

          {under26 === false && (
            <FeeQuestion
              question="Är du medlem i Judiska Församlingen i Stockholm (JFST)?"
              value={jfstMember}
              onChange={setJfstMember}
            />
          )}

          {(under26 === true ||
            (under26 === false &&
              jfstMember !== null)) && (
            <FeeQuestion
              question="Vill du ha en fast plats i synagogan?"
              value={seat}
              onChange={setSeat}
            />
          )}

          {under26 === false &&
            jfstMember !== null &&
            seat === true && (
              <div>
                <p className="text-sm font-bold text-slate-700">
                  Vilken avgift gäller?
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Avgiften för fast plats skiljer sig mellan
                  herr- och damsektionen.
                </p>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <ChoiceButton
                    active={gender === 'man'}
                    onClick={() => setGender('man')}
                  >
                    Herr
                  </ChoiceButton>

                  <ChoiceButton
                    active={gender === 'woman'}
                    onClick={() => setGender('woman')}
                  >
                    Dam
                  </ChoiceButton>
                </div>
              </div>
            )}

          {fee !== null && (
            <div className="rounded-2xl bg-sky-50 p-5 text-center">
              <p className="text-sm font-bold text-sky-700">
                Din medlemsavgift
              </p>

              <p className="mt-1 text-3xl font-black text-[#183b70]">
                {fee.toLocaleString('sv-SE')} kr
                <span className="text-base font-bold text-slate-500">
                  /år
                </span>
              </p>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                {summary}
              </p>

              <button
                type="button"
                onClick={onApply}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#68123f] px-5 py-3.5 font-bold text-white transition hover:bg-[#561034]"
              >
                Ansök om medlemskap
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

type FeeQuestionProps = {
  question: string
  value: boolean | null
  onChange: (value: boolean) => void
}

function FeeQuestion({
  question,
  value,
  onChange,
}: FeeQuestionProps) {
  return (
    <div>
      <p className="text-sm font-bold text-slate-700">
        {question}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <ChoiceButton
          active={value === true}
          onClick={() => onChange(true)}
        >
          Ja
        </ChoiceButton>

        <ChoiceButton
          active={value === false}
          onClick={() => onChange(false)}
        >
          Nej
        </ChoiceButton>
      </div>
    </div>
  )
}

type ChoiceButtonProps = {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}

function ChoiceButton({
  active,
  onClick,
  children,
}: ChoiceButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-12 rounded-2xl border px-4 py-3 text-sm font-bold transition ${
        active
          ? 'border-[#183b70] bg-sky-50 text-[#183b70]'
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
      }`}
    >
      {children}
    </button>
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