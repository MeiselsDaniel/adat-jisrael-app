import {
  Bell,
  CalendarDays,
  ChevronRight,
  LockKeyhole,
  Newspaper,
  Pin,
} from 'lucide-react'
import { informationPosts } from '../data/events'
import type {
  AppUser,
  InformationPost,
} from '../types'

type InformationPageProps = {
  user: AppUser
}

function InformationPage({
  user,
}: InformationPageProps) {
  const visiblePosts = informationPosts
    .filter((post) => post.status === 'published')
    .filter((post) => {
      if (post.visibility === 'allRegistered') {
        return true
      }

      if (post.visibility === 'adminsOnly') {
        return user.role !== 'user'
      }

      return user.permissions.viewMemberInformation
    })
    .sort((a, b) => {
      if (a.pinned !== b.pinned) {
        return a.pinned ? -1 : 1
      }

      const aDate =
        a.publishedAt ?? a.createdAt
      const bDate =
        b.publishedAt ?? b.createdAt

      return (
        new Date(bDate).getTime() -
        new Date(aDate).getTime()
      )
    })

  return (
    <div className="space-y-5">
      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-sky-700">
              Senaste från församlingen
            </p>

            <h1 className="mt-1 text-2xl font-bold text-[#183b70]">
              Information
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Nyheter, viktiga meddelanden och information från
              Adat Jisrael.
            </p>
          </div>

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-[#183b70]">
            <Newspaper className="h-6 w-6" />
          </div>
        </div>
      </section>

      {visiblePosts.length > 0 ? (
        <section className="space-y-3">
          {visiblePosts.map((post) => (
            <InformationCard
              key={post.id}
              post={post}
            />
          ))}
        </section>
      ) : (
        <section className="rounded-3xl bg-white p-7 text-center shadow-sm ring-1 ring-slate-200">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
            <Newspaper className="h-7 w-7" />
          </div>

          <h2 className="mt-5 text-lg font-bold text-slate-800">
            Ingen information ännu
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Nya meddelanden från Adat Jisrael kommer att visas
            här.
          </p>
        </section>
      )}

      <section className="flex gap-3 rounded-3xl bg-sky-50 p-5">
        <Bell className="h-6 w-6 shrink-0 text-[#183b70]" />

        <div>
          <p className="font-bold text-[#183b70]">
            Notiser kommer senare
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            I den färdiga appen kan viktiga meddelanden även
            skickas som pushnotiser.
          </p>
        </div>
      </section>
    </div>
  )
}

type InformationCardProps = {
  post: InformationPost
}

function InformationCard({
  post,
}: InformationCardProps) {
  const publishedDate = formatPostDate(
    post.publishedAt ?? post.createdAt,
  )

  return (
    <button
      type="button"
      className="w-full overflow-hidden rounded-3xl bg-white text-left shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt=""
          className="h-44 w-full object-cover"
        />
      )}

      <div className="p-5">
        <div className="flex items-center gap-2">
          {post.pinned && (
            <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-800">
              <Pin className="h-3 w-3" />
              Viktigt
            </span>
          )}

          {post.visibility === 'membersOnly' && (
            <span className="flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#183b70]">
              <LockKeyhole className="h-3 w-3" />
              Medlemmar
            </span>
          )}
        </div>

        <h2 className="mt-3 text-lg font-bold text-slate-900">
          {post.title}
        </h2>

        {post.summary && (
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {post.summary}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <CalendarDays className="h-4 w-4" />
            {publishedDate}
          </p>

          <span className="flex items-center gap-1 text-sm font-bold text-[#183b70]">
            Läs mer
            <ChevronRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </button>
  )
}

function formatPostDate(dateValue: string) {
  return new Intl.DateTimeFormat('sv-SE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateValue))
}

export default InformationPage