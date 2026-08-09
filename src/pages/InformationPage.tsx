import {
  Bell,
  CalendarDays,
  ChevronRight,
  ChevronUp,
  Newspaper,
  Pin,
} from 'lucide-react'
import {
  useEffect,
  useState,
} from 'react'
import type { AppUser } from '../types'
import { useAuth } from '../hooks/useAuth'
import {
  subscribeToPublishedNews,
  type NewsPost,
} from '../services/newsService'
import {
  markNewsAsRead,
  subscribeToUserNewsReads,
} from '../services/newsReadsService'

type InformationPageProps = {
  user: AppUser
}

function InformationPage({
  user,
}: InformationPageProps) {
  const { firebaseUser } =
    useAuth()

  const [posts, setPosts] =
    useState<NewsPost[]>([])

  const [readNewsIds, setReadNewsIds] =
    useState<Set<string>>(
      () => new Set(),
    )

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    /*
     * App.tsx styr redan att bara medlemmar/admin
     * kommer in på denna sida.
     */
    if (
      !user.permissions.viewMemberInformation
    ) {
      setPosts([])
      setLoading(false)
      return
    }

    return subscribeToPublishedNews(
      (nextPosts) => {
        setPosts(nextPosts)
        setLoading(false)
      },
      (caughtError) => {
        console.error(
          'Kunde inte läsa publicerade nyheter:',
          caughtError,
        )

        setError(
          'Nyheterna kunde inte hämtas.',
        )
        setLoading(false)
      },
    )
  }, [
    user.permissions.viewMemberInformation,
  ])

  useEffect(() => {
    if (!firebaseUser) {
      setReadNewsIds(
        new Set(),
      )
      return
    }

    return subscribeToUserNewsReads(
      firebaseUser.uid,
      (reads) => {
        setReadNewsIds(
          new Set(
            reads.map(
              (read) =>
                read.newsId,
            ),
          ),
        )
      },
      (caughtError) => {
        console.error(
          'Kunde inte läsa vilka nyheter som är lästa:',
          caughtError,
        )
      },
    )
  }, [firebaseUser])

  return (
    <div className="space-y-5">
      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-sky-700">
              Senaste nytt från Adat Jisrael
            </p>

            <h1 className="mt-1 text-2xl font-bold text-[#183b70]">
              Nyheter
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Här hittar du nyheter, viktiga meddelanden och uppdateringar från Adat Jisrael.
            </p>
          </div>

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-[#183b70]">
            <Newspaper className="h-6 w-6" />
          </div>
        </div>
      </section>

      {error && (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
          {error}
        </p>
      )}

      {loading ? (
        <section className="rounded-3xl bg-white p-7 text-center shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">
            Hämtar nyheter…
          </p>
        </section>
      ) : posts.length > 0 ? (
        <section className="space-y-3">
          {posts.map((post) => (
            <NewsCard
              key={post.id}
              post={post}
              isRead={
                readNewsIds.has(
                  post.id,
                )
              }
              onRead={() => {
                if (!firebaseUser) {
                  return
                }

                /*
                 * Uppdatera UI direkt så att NY-badgen
                 * försvinner utan att vänta på Firestore.
                 */
                setReadNewsIds(
                  (current) => {
                    const next =
                      new Set(current)

                    next.add(
                      post.id,
                    )

                    return next
                  },
                )

                void markNewsAsRead(
                  post.id,
                  firebaseUser.uid,
                ).catch(
                  (caughtError) => {
                    console.error(
                      'Kunde inte markera nyheten som läst:',
                      caughtError,
                    )

                    /*
                     * Om Firestore-sparningen misslyckas
                     * återställ statusen så användaren
                     * inte får falsk lässtatus.
                     */
                    setReadNewsIds(
                      (current) => {
                        const next =
                          new Set(
                            current,
                          )

                        next.delete(
                          post.id,
                        )

                        return next
                      },
                    )
                  },
                )
              }}
            />
          ))}
        </section>
      ) : (
        <section className="rounded-3xl bg-white p-7 text-center shadow-sm ring-1 ring-slate-200">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
            <Newspaper className="h-7 w-7" />
          </div>

          <h2 className="mt-5 text-lg font-bold text-slate-800">
            Inga nyheter ännu
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Nya meddelanden från Adat Jisrael kommer att visas här.
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
            Viktiga meddelanden kommer även kunna skickas som pushnotiser.
          </p>
        </div>
      </section>
    </div>
  )
}

type NewsCardProps = {
  post: NewsPost
  isRead: boolean
  onRead: () => void
}

function NewsCard({
  post,
  isRead,
  onRead,
}: NewsCardProps) {
  const [open, setOpen] =
    useState(false)

  const publishedDate =
    formatPostDate(
      post.publishedAt ??
        post.createdAt,
    )

  return (
    <article className="w-full overflow-hidden rounded-3xl bg-white text-left shadow-sm ring-1 ring-slate-200">
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt=""
          className="h-44 w-full object-cover"
        />
      )}

      <div className="p-5">
        <div className="flex items-center gap-2">
          {post.isPinned && (
            <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-800">
              <Pin className="h-3 w-3" />
              Viktigt
            </span>
          )}

          {!isRead && (
            <span className="rounded-full bg-rose-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
              Ny
            </span>
          )}
        </div>

        <h2 className="mt-3 text-lg font-bold text-slate-900">
          {post.title}
        </h2>

        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-500">
          {post.excerpt}
        </p>

        {open && (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="whitespace-pre-line text-sm leading-7 text-slate-700">
              {post.content}
            </p>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <CalendarDays className="h-4 w-4" />
            {publishedDate}
          </p>

          <button
            type="button"
            onClick={() => {
              if (!open && !isRead) {
                onRead()
              }

              setOpen(
                (current) =>
                  !current,
              )
            }}
            className="flex items-center gap-1 text-sm font-bold text-[#183b70]"
          >
            {open
              ? 'Visa mindre'
              : 'Läs mer'}

            {open ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </article>
  )
}

function formatPostDate(
  value: unknown,
): string {
  if (!value) {
    return ''
  }

  let date: Date

  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (
      value as {
        toDate?: unknown
      }
    ).toDate === 'function'
  ) {
    date = (
      value as {
        toDate: () => Date
      }
    ).toDate()
  } else {
    date =
      new Date(
        value as
          | string
          | number
          | Date,
      )
  }

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return ''
  }

  return new Intl.DateTimeFormat(
    'sv-SE',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    },
  ).format(date)
}

export default InformationPage
