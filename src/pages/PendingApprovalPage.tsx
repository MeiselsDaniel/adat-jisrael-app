import { Clock3, LogOut, MailCheck } from 'lucide-react'
import type { AppUser } from '../types'

type PendingApprovalPageProps = {
  user: AppUser
  onLogout: () => void
}

function PendingApprovalPage({
  user,
  onLogout,
}: PendingApprovalPageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-7 text-center shadow-xl">
        <img
          src="/adat-jisrael-logo.png"
          alt="Adat Jisrael"
          className="mx-auto h-16 w-auto"
        />

        <div className="mx-auto mt-8 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-800">
          <Clock3 className="h-9 w-9" />
        </div>

        <h1 className="mt-6 text-2xl font-bold text-[#183b70]">
          Registreringen väntar på godkännande
        </h1>

        <p className="mt-3 leading-7 text-slate-500">
          Tack, {user.name}. En administratör behöver godkänna
          ditt konto och välja vilken information du får
          tillgång till.
        </p>

        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-sky-50 p-4 text-left">
          <MailCheck className="h-6 w-6 shrink-0 text-[#183b70]" />

          <div>
            <p className="text-sm font-bold text-slate-700">
              Registrerad e-post
            </p>

            <p className="mt-1 break-all text-sm text-slate-500">
              {user.email}
            </p>
          </div>
        </div>

        <p className="mt-6 text-sm leading-6 text-slate-500">
          När kontot har godkänts kan du logga in och anmäla
          dig till kommande tfilot.
        </p>

        <button
          onClick={onLogout}
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 font-bold text-slate-700"
        >
          <LogOut className="h-5 w-5" />
          Tillbaka till inloggningen
        </button>
      </div>
    </div>
  )
}

export default PendingApprovalPage