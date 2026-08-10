import {
  useEffect,
  useState,
  type FormEvent,
} from 'react'
import {
  ArrowLeft,
  Bell,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  LoaderCircle,
  Newspaper,
  Pencil,
  Pin,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import {
  subscribeToFundraiser,
  type Fundraiser,
} from '../services/fundraiserService'
import {
  sendNewsPushNotification,
} from '../services/pushService'
import {
  createNewsPost,
  deleteNewsPost,
  subscribeToNews,
  updateNewsPost,
  type NewsPost,
  type NewsCategory,
  type NewsStatus,
} from '../services/newsService'

type NewsAdminPageProps = {
  onBack: () => void
}

function NewsAdminPage({
  onBack,
}: NewsAdminPageProps) {
  const {
    firebaseUser,
    profile,
  } = useAuth()

  const [posts, setPosts] =
    useState<NewsPost[]>([])

  const [formOpen, setFormOpen] =
    useState(false)

  const [editingPost, setEditingPost] =
    useState<NewsPost | null>(null)

  const [title, setTitle] =
    useState('')

  const [excerpt, setExcerpt] =
    useState('')

  const [content, setContent] =
    useState('')

  const [imageUrl, setImageUrl] =
    useState('')

  const [isPinned, setIsPinned] =
    useState(false)

  const [category, setCategory] =
    useState<NewsCategory>('news')

  const [fundraiserGoal, setFundraiserGoal] =
    useState('30000')

  const [fundraiserCurrent, setFundraiserCurrent] =
    useState('0')

  const [fundraiserActive, setFundraiserActive] =
    useState(true)

  

  const [currentFundraiser, setCurrentFundraiser] =
    useState<Fundraiser | null>(null)
const [status, setStatus] =
    useState<NewsStatus>('published')

  const [sendPushNotification, setSendPushNotification] =
    useState(false)

  const [saving, setSaving] =
    useState(false)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [saved, setSaved] =
    useState(false)

  useEffect(() => {
    return subscribeToFundraiser(
      (nextFundraiser) => {
        setCurrentFundraiser(
          nextFundraiser,
        )
      },
      (caughtError) => {
        console.error(
          'Kunde inte läsa aktuell insamling:',
          caughtError,
        )
      },
    )
  }, [])

  useEffect(() => {
    return subscribeToNews(
      (nextPosts) => {
        setPosts(nextPosts)
        setLoading(false)
      },
      (caughtError) => {
        console.error(
          'Kunde inte läsa nyheter i admin:',
          caughtError,
        )

        setError(
          'Nyheterna kunde inte hämtas.',
        )
        setLoading(false)
      },
    )
  }, [])

  function resetForm() {
    setEditingPost(null)
    setTitle('')
    setExcerpt('')
    setContent('')
    setImageUrl('')
    setIsPinned(false)
    setCategory('news')
    setStatus('published')
    setSendPushNotification(false)
    setError('')
    setSaved(false)
  }

  function startNewPost() {
    resetForm()
    setFormOpen(true)
  }

  function editPost(
    post: NewsPost,
  ) {
    setEditingPost(post)
    setTitle(post.title)
    setExcerpt(post.excerpt)
    setContent(post.content)
    setImageUrl(
      post.imageUrl ?? '',
    )
    setIsPinned(
      post.isPinned,
    )
    setCategory(
      post.category ?? 'news',
    )

    if (
      post.category === 'fundraiser' &&
      currentFundraiser
    ) {
      setFundraiserGoal(
        String(
          currentFundraiser.goalAmount,
        ),
      )

      setFundraiserCurrent(
        String(
          currentFundraiser.currentAmount,
        ),
      )

      setFundraiserActive(
        currentFundraiser.active,
      )
    }
    setStatus(post.status)
    setSendPushNotification(false)
    setError('')
    setSaved(false)
    setFormOpen(true)
  }

  function closeForm() {
    resetForm()
    setFormOpen(false)
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (!firebaseUser) {
      return
    }

    if (!title.trim()) {
      setError(
        'Skriv en rubrik.',
      )
      return
    }

    if (!excerpt.trim()) {
      setError(
        'Skriv en kort ingress.',
      )
      return
    }

    if (!content.trim()) {
      setError(
        'Skriv nyhetens innehåll.',
      )
      return
    }

    setSaving(true)
    setSaved(false)
    setError('')

    let newsWasSaved = false

    try {
      if (editingPost) {
        await updateNewsPost(
          editingPost.id,
          {
            title,
            excerpt,
            content,
            imageUrl:
              imageUrl.trim() ||
              null,
            isPinned,

            category,
            status,
          },
        )
      } else {
        await createNewsPost({
          title,
          excerpt,
          content,
          imageUrl:
            imageUrl.trim() ||
            undefined,
          isPinned,

          category,
          status,
          authorId:
            firebaseUser.uid,
          authorName:
            profile?.name ||
            undefined,
        })
      }

      newsWasSaved = true

      if (
        status === 'published' &&
        sendPushNotification
      ) {
        await sendNewsPushNotification({
          title: title.trim(),
          body: excerpt.trim(),
        })
      }

      setSaved(true)

      window.setTimeout(
        () => {
          closeForm()
        },
        700,
      )
    } catch (caughtError) {
      console.error(
        newsWasSaved
          ? 'Nyheten sparades men pushen misslyckades:'
          : 'Kunde inte spara nyheten:',
        caughtError,
      )

      setError(
        newsWasSaved
          ? 'Nyheten är sparad, men pushnotisen kunde inte skickas.'
          : caughtError instanceof Error
            ? caughtError.message
            : 'Nyheten kunde inte sparas.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function removePost(
    post: NewsPost,
  ) {
    const confirmed =
      window.confirm(
        `Ta bort "${post.title}"?`,
      )

    if (!confirmed) {
      return
    }

    setError('')

    try {
      await deleteNewsPost(
        post.id,
      )
    } catch (caughtError) {
      console.error(
        'Kunde inte ta bort nyheten:',
        caughtError,
      )

      setError(
        'Nyheten kunde inte tas bort.',
      )
    }
  }

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#183b70] shadow-sm ring-1 ring-slate-200"
          aria-label="Tillbaka"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-sky-700">
            Administration
          </p>

          <h1 className="text-2xl font-bold text-[#183b70]">
            Nyheter
          </h1>
        </div>
      </header>

      <section className="rounded-3xl bg-sky-50 p-5 ring-1 ring-sky-100">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-[#183b70]">
            <Newspaper className="h-5 w-5" />
          </div>

          <div className="flex-1">
            <p className="font-bold text-[#183b70]">
              Nyheter till medlemmarna
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              Skapa, redigera och publicera nyheter från Adat Jisrael.
            </p>
          </div>
        </div>
      </section>

      {!formOpen && (
        <button
          type="button"
          onClick={startNewPost}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#183b70] px-4 py-4 text-sm font-bold text-white shadow-sm"
        >
          <Plus className="h-5 w-5" />
          Ny nyhet
        </button>
      )}

      {formOpen && (
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-sky-700">
                {editingPost
                  ? 'Redigera'
                  : 'Ny nyhet'}
              </p>

              <h2 className="mt-1 text-xl font-bold text-[#183b70]">
                {editingPost
                  ? editingPost.title
                  : 'Skriv nyhet'}
              </h2>
            </div>

            <button
              type="button"
              onClick={closeForm}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">
              Rubrik
            </span>

            <input
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value,
                )
              }
              placeholder="Exempel: Rosh Hashana-programmet är klart"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-600"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">
              Kort ingress
            </span>

            <textarea
              value={excerpt}
              onChange={(event) =>
                setExcerpt(
                  event.target.value,
                )
              }
              rows={3}
              placeholder="En kort sammanfattning som visas på nyhetskortet."
              className="mt-2 w-full resize-y rounded-2xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none focus:border-sky-600"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">
              Nyhet
            </span>

            <textarea
              value={content}
              onChange={(event) =>
                setContent(
                  event.target.value,
                )
              }
              rows={9}
              placeholder="Skriv hela nyheten här..."
              className="mt-2 w-full resize-y rounded-2xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none focus:border-sky-600"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">
              Bild-URL
            </span>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Valfritt tills vi bygger riktig bilduppladdning.
            </p>

            <input
              value={imageUrl}
              onChange={(event) =>
                setImageUrl(
                  event.target.value,
                )
              }
              placeholder="https://..."
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-sky-600"
            />
          </label>

          <div>
            <p className="text-sm font-bold text-slate-700">
              Kategori
            </p>

            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  setCategory('news')
                }
                className={`rounded-2xl px-4 py-3 text-sm font-bold ${
                  category === 'news'
                    ? 'bg-[#183b70] text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                Nyhet
              </button>

              <button
                type="button"
                onClick={() =>
                  setCategory('fundraiser')
                }
                className={`rounded-2xl px-4 py-3 text-sm font-bold ${
                  category === 'fundraiser'
                    ? 'bg-[#68123f] text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                Insamling
              </button>
            </div>
          </div>

          {category === 'fundraiser' && (
            <section className="space-y-4 rounded-2xl bg-rose-50 p-4 ring-1 ring-rose-100">
              <div>
                <p className="font-bold text-[#68123f]">
                  Insamlingsuppgifter
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Beloppen visas automatiskt i insamlingskortet under Nyheter.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">
                    Målbelopp
                  </span>

                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={fundraiserGoal}
                    onChange={(event) =>
                      setFundraiserGoal(
                        event.target.value,
                      )
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-sky-600"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">
                    Insamlat
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={fundraiserCurrent}
                    onChange={(event) =>
                      setFundraiserCurrent(
                        event.target.value,
                      )
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-sky-600"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={() =>
                  setFundraiserActive(
                    (current) => !current,
                  )
                }
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold ${
                  fundraiserActive
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-white text-slate-600 ring-1 ring-slate-200'
                }`}
              >
                <span>
                  {fundraiserActive
                    ? 'Insamlingen är aktiv'
                    : 'Insamlingen är avslutad'}
                </span>

                {fundraiserActive && (
                  <Check className="h-5 w-5" />
                )}
              </button>
            </section>
          )}

          <button
            type="button"
            onClick={() =>
              setIsPinned(
                (current) =>
                  !current,
              )
            }
            className={`flex w-full items-center gap-3 rounded-2xl p-4 text-left ring-1 ${
              isPinned
                ? 'bg-amber-50 text-amber-900 ring-amber-200'
                : 'bg-slate-50 text-slate-700 ring-slate-200'
            }`}
          >
            <Pin className="h-5 w-5 shrink-0" />

            <div className="flex-1">
              <p className="text-sm font-bold">
                Fäst högst upp
              </p>

              <p className="mt-0.5 text-xs opacity-70">
                Viktiga nyheter visas före övriga nyheter.
              </p>
            </div>

            {isPinned && (
              <Check className="h-5 w-5" />
            )}
          </button>

          <div>
            <p className="text-sm font-bold text-slate-700">
              Status
            </p>

            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setStatus('draft')
                  setSendPushNotification(false)
                }}
                className={`rounded-2xl px-4 py-3 text-sm font-bold ${
                  status === 'draft'
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                Utkast
              </button>

              <button
                type="button"
                onClick={() =>
                  setStatus(
                    'published',
                  )
                }
                className={`rounded-2xl px-4 py-3 text-sm font-bold ${
                  status === 'published'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                Publicerad
              </button>
            </div>
          </div>

          {status === 'published' && (
            <button
              type="button"
              onClick={() =>
                setSendPushNotification(
                  (current) => !current,
                )
              }
              className={`flex w-full items-center gap-3 rounded-2xl p-4 text-left ring-1 ${
                sendPushNotification
                  ? 'bg-sky-50 text-[#183b70] ring-sky-200'
                  : 'bg-slate-50 text-slate-700 ring-slate-200'
              }`}
            >
              <Bell className="h-5 w-5 shrink-0" />

              <div className="flex-1">
                <p className="text-sm font-bold">
                  Skicka pushnotis
                </p>

                <p className="mt-0.5 text-xs opacity-70">
                  Skicka rubriken och ingressen som en notis till medlemmarna.
                </p>
              </div>

              {sendPushNotification && (
                <Check className="h-5 w-5" />
              )}
            </button>
          )}

          {error && (
            <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800 ring-1 ring-rose-200">
              {error}
            </p>
          )}

          {saved && (
            <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-200">
              {sendPushNotification && status === 'published'
                ? 'Nyheten är publicerad och pushnotisen är skickad.'
                : 'Nyheten är sparad.'}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#183b70] px-4 py-4 text-sm font-bold text-white disabled:opacity-60"
          >
            {saving ? (
              <LoaderCircle className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}

            {saving
              ? sendPushNotification && status === 'published'
                ? 'Publicerar och skickar…'
                : 'Sparar…'
              : status === 'published'
                ? sendPushNotification
                  ? 'Publicera och skicka push'
                  : 'Publicera'
                : 'Spara utkast'}
          </button>
        </form>
      )}

      {error && !formOpen && (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
          {error}
        </p>
      )}

      {!formOpen && (
        <section className="space-y-3">
          {loading && (
            <div className="flex justify-center py-8">
              <LoaderCircle className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          )}

          {!loading &&
            posts.length === 0 && (
              <div className="rounded-3xl bg-white p-7 text-center shadow-sm ring-1 ring-slate-200">
                <Newspaper className="mx-auto h-8 w-8 text-slate-300" />

                <h2 className="mt-4 font-bold text-slate-700">
                  Inga nyheter ännu
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Skapa den första nyheten ovan.
                </p>
              </div>
            )}

          {posts.map((post) => (
            <NewsAdminCard
              key={post.id}
              post={post}
              onEdit={() =>
                editPost(post)
              }
              onDelete={() => {
                void removePost(post)
              }}
            />
          ))}
        </section>
      )}
    </div>
  )
}

type NewsAdminCardProps = {
  post: NewsPost
  onEdit: () => void
  onDelete: () => void
}

function NewsAdminCard({
  post,
  onEdit,
  onDelete,
}: NewsAdminCardProps) {
  const [open, setOpen] =
    useState(false)

  return (
    <article className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
      <button
        type="button"
        onClick={() =>
          setOpen(
            (current) =>
              !current,
          )
        }
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
            post.isPinned
              ? 'bg-amber-100 text-amber-800'
              : 'bg-sky-100 text-[#183b70]'
          }`}
        >
          {post.isPinned ? (
            <Pin className="h-5 w-5" />
          ) : (
            <FileText className="h-5 w-5" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-bold text-slate-800">
            {post.title}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                post.status ===
                'published'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {post.status ===
              'published'
                ? 'Publicerad'
                : 'Utkast'}
            </span>

            {post.category === 'fundraiser' && (
              <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#68123f]">
                Insamling
              </span>
            )}

            {post.isPinned && (
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-800">
                Fäst
              </span>
            )}
          </div>
        </div>

        {open ? (
          <ChevronUp className="mt-2 h-4 w-4 text-slate-400" />
        ) : (
          <ChevronDown className="mt-2 h-4 w-4 text-slate-400" />
        )}
      </button>

      {open && (
        <div className="border-t border-slate-100 p-4">
          <p className="text-sm leading-6 text-slate-600">
            {post.excerpt}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="flex items-center justify-center gap-2 rounded-2xl bg-sky-50 px-3 py-3 text-sm font-bold text-[#183b70]"
            >
              <Pencil className="h-4 w-4" />
              Redigera
            </button>

            <button
              type="button"
              onClick={onDelete}
              className="flex items-center justify-center gap-2 rounded-2xl bg-rose-50 px-3 py-3 text-sm font-bold text-rose-700"
            >
              <Trash2 className="h-4 w-4" />
              Ta bort
            </button>
          </div>
        </div>
      )}
    </article>
  )
}

export default NewsAdminPage
