import {
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
import {
  subscribeToFundraiser,
  type Fundraiser,
} from '../services/fundraiserService'

import { synagogueSettings } from '../data/settings'
type InformationPageProps = {
  user: AppUser
  targetNewsId?: string | null
}

function InformationPage({
  user,
  targetNewsId = null,
}: InformationPageProps) {
  const { firebaseUser } =
    useAuth()

  const [posts, setPosts] =
    useState<NewsPost[]>([])

  const [showArchive, setShowArchive] =
    useState(false)

  useEffect(() => {
    if (
      !targetNewsId ||
      posts.length === 0
    ) {
      return
    }

    const targetIndex =
      posts.findIndex(
        (post) =>
          post.id === targetNewsId,
      )

    if (targetIndex >= 10) {
      setShowArchive(true)
    }
  }, [targetNewsId, posts])

  useEffect(() => {
    if (
      !targetNewsId ||
      posts.length === 0
    ) {
      return
    }

    const targetExists =
      posts.some(
        (post) =>
          post.id === targetNewsId,
      )

    if (!targetExists) {
      return
    }

    const timeoutId =
      window.setTimeout(() => {
        const element =
          document.getElementById(
            `news-${targetNewsId}`,
          )

        element?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }, 150)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [
    targetNewsId,
    posts,
    showArchive,
  ])

  const visiblePosts =
    showArchive
      ? posts
      : posts.slice(0, 10)

  const hasArchivedPosts =
    posts.length > 10

  const featuredPostId =
    posts[0]?.id

  const [readNewsIds, setReadNewsIds] =
    useState<Set<string>>(
      () => new Set(),
    )

  const [markingAllRead, setMarkingAllRead] =
    useState(false)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [fundraiser, setFundraiser] =
    useState<Fundraiser | null>(null)

  const unreadPosts =
    posts.filter(
      (post) =>
        !readNewsIds.has(post.id),
    )

  const markAllNewsAsRead =
    async () => {
      if (
        !firebaseUser ||
        unreadPosts.length === 0 ||
        markingAllRead
      ) {
        return
      }

      const unreadIds =
        unreadPosts.map(
          (post) => post.id,
        )

      /*
       * Uppdatera gränssnittet direkt så alla
       * NY-markeringar försvinner på en gång.
       */
      setReadNewsIds(
        (current) => {
          const next =
            new Set(current)

          for (const newsId of unreadIds) {
            next.add(newsId)
          }

          return next
        },
      )

      setMarkingAllRead(true)

      try {
        await Promise.all(
          unreadIds.map(
            (newsId) =>
              markNewsAsRead(
                newsId,
                firebaseUser.uid,
              ),
          ),
        )
      } catch (caughtError) {
        console.error(
          'Kunde inte markera alla nyheter som lästa:',
          caughtError,
        )

        /*
         * Lässtatusen från Firestore-subscriptionen
         * kommer att rätta UI:t om någon skrivning
         * misslyckades.
         */
      } finally {
        setMarkingAllRead(false)
      }
    }

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
    return subscribeToFundraiser(
      (nextFundraiser) => {
        setFundraiser(
          nextFundraiser,
        )
      },
      (caughtError) => {
        console.error(
          'Kunde inte läsa aktuell insamling i Nyheter:',
          caughtError,
        )
      },
    )
  }, [])

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
        <p className="rounded-2xl bg-sky-50 px-4 py-3 text-sm font-semibold text-rose-800">
          {error}
        </p>
      )}

      {!loading &&
        posts.length > 0 && (
          <div className="mb-3 flex justify-end">
            <button
              type="button"
              disabled={
                markingAllRead ||
                unreadPosts.length === 0
              }
              onClick={() => {
                void markAllNewsAsRead()
              }}
              className="text-sm font-bold text-[#183b70] transition hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {markingAllRead
                ? 'Markerar…'
                : unreadPosts.length === 0
                  ? 'Alla nyheter är lästa'
                  : 'Markera alla som lästa'}
            </button>
          </div>
        )}

      {loading ? (
        <section className="rounded-3xl bg-white p-7 text-center shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">
            Hämtar nyheter…
          </p>
        </section>
      ) : posts.length > 0 ? (
        <section className="space-y-3">
          {visiblePosts.map((post) => (
            <NewsCard
              key={post.id}
              post={post}
              fundraiser={fundraiser}
              featured={
                post.id === featuredPostId
              }
                isRead={
                readNewsIds.has(
                  post.id,
                )
              }
              autoOpen={
                post.id === targetNewsId
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

          {hasArchivedPosts && (
            <button
              type="button"
              onClick={() =>
                setShowArchive(
                  (current) => !current,
                )
              }
              className="mt-2 w-full rounded-2xl bg-white px-4 py-4 text-sm font-bold text-[#183b70] shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              {showArchive
                ? 'Dölj äldre nyheter'
                : `Visa äldre nyheter (${posts.length - 10})`}
            </button>
          )}
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

    </div>
  )
}

type NewsCardProps = {
  post: NewsPost
  fundraiser: Fundraiser | null
  featured: boolean
  isRead: boolean
  autoOpen?: boolean
  onRead: () => void
}

function NewsCard({
  post,
  fundraiser,
  featured,
  isRead,
  autoOpen = false,
  onRead,
}: NewsCardProps) {
  const [open, setOpen] =
    useState(false)

  useEffect(() => {
    if (!autoOpen) {
      return
    }

    setOpen(true)

    if (!isRead) {
      onRead()
    }
  }, [
    autoOpen,
    isRead,
    onRead,
  ])

  const publishedDate =
    formatPostDate(
      post.publishedAt ??
        post.createdAt,
    )

  

  const isFundraiser =
    post.category === 'fundraiser'

  const fundraiserGoal =
    fundraiser?.goalAmount ?? 0

  const fundraiserCurrent =
    fundraiser?.currentAmount ?? 0

  const fundraiserPercent =
    fundraiserGoal > 0
      ? Math.min(
          100,
          Math.round(
            (
              fundraiserCurrent /
              fundraiserGoal
            ) * 100,
          ),
        )
      : 0
return (
    <article
      id={`news-${post.id}`}
      className="w-full scroll-mt-24 overflow-hidden rounded-3xl bg-white text-left shadow-sm ring-1 ring-slate-200"
    >
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt=""
          className={
            featured
              ? "h-56 w-full object-cover"
              : "h-44 w-full object-cover"
          }
        />
      )}

      <div className="p-5">
        <div className="flex items-center gap-2">
          {featured && (
            <span className="rounded-full bg-[#183b70] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
              Senaste nytt
            </span>
          )}

          {post.isPinned && (
            <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-800">
              <Pin className="h-3 w-3" />
              Viktigt
            </span>
          )}

          {post.category === 'externalEvent' && (
            <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-sky-800">
              Externt event
            </span>
          )}

          {!isRead && (
            <span className="rounded-full bg-rose-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
              Ny
            </span>
          )}
        </div>

        <h2
          className={
            featured
              ? "mt-3 text-2xl font-bold leading-tight text-slate-900"
              : "mt-3 text-lg font-bold text-slate-900"
          }
        >
          {post.title}
        </h2>

        <p
          className={
            featured
              ? "mt-3 whitespace-pre-line text-base leading-7 text-slate-600"
              : "mt-2 whitespace-pre-line text-sm leading-6 text-slate-500"
          }
        >
          {post.excerpt}
        </p>

        {post.linkUrl && (
          <a
            href={post.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => {
              event.stopPropagation()
              onRead()
            }}
            className="mt-4 flex w-full items-center justify-between rounded-2xl bg-[#183b70] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#102d57]"
          >
            <span>
              {post.linkLabel || 'Läs mer'}
            </span>

            <ChevronRight className="h-4 w-4" />
          </a>
        )}

        {isFundraiser &&
          fundraiser &&
          fundraiser.active && (
            <div className="mt-5 rounded-2xl bg-sky-50 p-4 ring-1 ring-sky-100">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[#183b70]">
                    Insamlat
                  </p>

                  <p className="mt-1 text-2xl font-bold text-[#183b70]">
                    {fundraiserCurrent.toLocaleString(
                      'sv-SE',
                    )}{' '}
                    kr
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-500">
                    Mål
                  </p>

                  <p className="font-bold text-slate-700">
                    {fundraiserGoal.toLocaleString(
                      'sv-SE',
                    )}{' '}
                    kr
                  </p>
                </div>
              </div>

              <div className="mt-4 h-3 overflow-hidden rounded-full bg-sky-100">
                <div
                  className="h-full rounded-full bg-[#183b70] transition-all"
                  style={{
                    width: `${fundraiserPercent}%`,
                  }}
                />
              </div>

              <p className="mt-2 text-right text-xs font-bold text-[#183b70]">
                {fundraiserPercent}% av målet
              </p>

                <div className="mt-4 border-t border-sky-200 pt-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#183b70]">
                    Stöd insamlingen med Swish
                  </p>

                  <p className="mt-2 text-xl font-black tracking-wide text-[#183b70]">
                    {synagogueSettings.swish.number}
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    Meddelande:{' '}
                    <strong>
                      {fundraiser.title ||
                        synagogueSettings.swish.message}
                    </strong>
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard
                        .writeText(
                          synagogueSettings.swish.number,
                        )
                        .then(() => {
                          window.alert(
                            `Swishnummer ${synagogueSettings.swish.number} har kopierats.`,
                          )
                        })
                        .catch(() => {
                          window.alert(
                            `Swish: ${synagogueSettings.swish.number}`,
                          )
                        })
                    }}
                    className="mt-3 w-full rounded-2xl bg-[#183b70] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#102d57]"
                  >
                    Kopiera Swish-nummer
                  </button>
                </div>
            </div>
          )}


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
