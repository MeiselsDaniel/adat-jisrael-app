import {
  ChevronRight,
  CircleHelp,
  FileText,
  LogOut,
  Mail,
  ShieldCheck,
  User,
} from 'lucide-react'
import type { ReactNode } from 'react'
import type { AppUser } from '../types'

type MorePageProps = {
  user: AppUser
  onLogout: () => void
  openAdmin: () => void
  openBoardContact: () => void
  openDocuments: () => void
  openProfile: () => void
}

function MorePage({
  user,
  onLogout,
  openAdmin,
  openBoardContact,
  openDocuments,
  openProfile,
}: MorePageProps) {
  return (
    <div className="space-y-5">
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-xl font-black text-[#183b70]">
          {user.name
            .split(' ')
            .map((part) => part[0])
            .slice(0, 2)
            .join('')}
        </div>

        <h2 className="mt-4 text-xl font-bold">
          {user.name}
        </h2>

        <div className="mt-5 flex items-center gap-3 border-t border-slate-200 pt-5 text-sm text-slate-600">
          <Mail className="h-5 w-5 text-slate-400" />
          {user.email}
        </div>
      </section>

      {user.role !== 'user' && (
        <button
          onClick={openAdmin}
          className="flex w-full items-center gap-4 rounded-3xl bg-[#183b70] p-5 text-left text-white shadow-sm transition hover:bg-[#102d57]"
        >
          <div className="rounded-2xl bg-white/15 p-3">
            <ShieldCheck className="h-6 w-6" />
          </div>

          <div className="flex-1">
            <p className="font-bold">Administration</p>

            <p className="mt-1 text-sm text-blue-100">
              Hantera användare, händelser och information
            </p>
          </div>

          <ChevronRight className="h-5 w-5" />
        </button>
      )}

      <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
        <MenuItem
          icon={<User className="h-5 w-5" />}
          label="Min profil"
          onClick={openProfile}
        />

        <MenuItem
          icon={<CircleHelp className="h-5 w-5" />}
          label="Styrelse & kontakt"
          onClick={openBoardContact}
        />

        {(user.category === 'member' ||
          user.category === 'board') && (
          <MenuItem
            icon={<FileText className="h-5 w-5" />}
            label="Dokument"
            onClick={openDocuments}
          />
        )}
      </section>

      <button
        onClick={onLogout}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-50 px-4 py-3.5 font-bold text-rose-800"
      >
        <LogOut className="h-5 w-5" />
        Logga ut
      </button>
    </div>
  )
}

type MenuItemProps = {
  icon: ReactNode
  label: string
  onClick?: () => void
}

function MenuItem({
  icon,
  label,
  onClick,
}: MenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 border-b border-slate-100 px-5 py-4 text-left last:border-0"
    >
      <span className="text-[#183b70]">{icon}</span>

      <span className="flex-1 font-semibold">
        {label}
      </span>

      <ChevronRight className="h-5 w-5 text-slate-400" />
    </button>
  )
}

export default MorePage