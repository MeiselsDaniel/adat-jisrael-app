import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  CalendarDays,
  Check,
  Search,
  Send,
  Wine,
  X,
} from 'lucide-react'
import KiddushCard from '../components/KiddushCard'
import type { KiddushListItem } from '../components/KiddushCard'
import { generateKiddushDates } from '../utils/generateKiddushDates'

type KiddushFilter = 'all' | 'available' | 'booked'

function KiddushPage() {
  const [items, setItems] = useState<KiddushListItem[]>(
  generateKiddushDates(),
)

  const [filter, setFilter] =
    useState<KiddushFilter>('all')

  const [selectedItem, setSelectedItem] =
    useState<KiddushListItem | null>(null)

  const [host, setHost] = useState('')
  const [dedication, setDedication] = useState('')
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const [confirmationOpen, setConfirmationOpen] =
    useState(false)

  const filteredItems = useMemo(() => {
    if (filter === 'available') {
      return items.filter(
        (item) => item.status === 'available',
      )
    }

    if (filter === 'booked') {
      return items.filter(
        (item) =>
          item.status === 'booked' ||
          item.status === 'pending',
      )
    }

    return items
  }, [filter, items])

  const availableCount = items.filter(
    (item) => item.status === 'available',
  ).length

  function openBooking(item: KiddushListItem) {
    setSelectedItem(item)
    setHost('')
    setDedication('')
    setComment('')
    setError('')
    setConfirmationOpen(false)
  }

  function closeBooking() {
    setSelectedItem(null)
    setError('')
  }

  function handleBooking(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()
    setError('')

    if (!selectedItem) {
      return
    }

    if (!host.trim()) {
      setError(
        'Skriv namnet eller familjen som vill boka Kiddush.',
      )
      return
    }

    setItems((current) =>
      current.map((item) =>
        item.id === selectedItem.id
          ? {
              ...item,
              status: 'pending',
              host: host.trim(),
              dedication:
                dedication.trim() || undefined,
              comment: comment.trim() || undefined,
            }
          : item,
      ),
    )

    setConfirmationOpen(true)
  }

  function finishBooking() {
    setSelectedItem(null)
    setConfirmationOpen(false)
    setHost('')
    setDedication('')
    setComment('')
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-3xl bg-[#68123f] text-white shadow-sm">
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <Wine className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-xl font-bold">
                Boka Kiddush
              </h1>

              <p className="mt-2 text-sm leading-6 text-rose-100">
                Se lediga datum och skicka en
                bokningsförfrågan för kommande Shabbat.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-white/10 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wide text-rose-100">
              Lediga datum
            </p>

            <p className="mt-1 text-2xl font-black">
              {availableCount}
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1.5">
          <FilterButton
            active={filter === 'all'}
            label="Alla"
            onClick={() => setFilter('all')}
          />

          <FilterButton
            active={filter === 'available'}
            label="Lediga"
            onClick={() => setFilter('available')}
          />

          <FilterButton
            active={filter === 'booked'}
            label="Bokade"
            onClick={() => setFilter('booked')}
          />
        </div>
      </section>

      {filteredItems.length > 0 ? (
        <section className="space-y-3">
          {filteredItems.map((item) => (
            <KiddushCard
              key={item.id}
              item={item}
              onBook={openBooking}
            />
          ))}
        </section>
      ) : (
        <section className="rounded-3xl bg-white p-7 text-center shadow-sm ring-1 ring-slate-200">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
            <Search className="h-7 w-7" />
          </div>

          <h2 className="mt-5 font-bold text-slate-800">
            Inga datum i detta filter
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Byt filter för att visa andra kommande
            Kiddushdatum.
          </p>
        </section>
      )}

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 px-3 pt-10 backdrop-blur-sm sm:items-center">
          <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-[#f8fafc] p-5 shadow-2xl sm:rounded-3xl">
            {confirmationOpen ? (
              <BookingConfirmation
                item={selectedItem}
                host={host}
                onClose={finishBooking}
              />
            ) : (
              <>
                <header className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-[#68123f]">
                      Kiddush
                    </p>

                    <h2 className="mt-1 text-2xl font-bold text-[#183b70]">
                      {selectedItem.date}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {selectedItem.occasion}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeBooking}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200"
                    aria-label="Stäng"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </header>

                <form
                  onSubmit={handleBooking}
                  className="mt-6 space-y-4"
                >
                  <label className="block">
                    <span className="text-sm font-bold text-slate-700">
                      Namn eller familj
                    </span>

                    <input
                      value={host}
                      onChange={(event) =>
                        setHost(event.target.value)
                      }
                      type="text"
                      placeholder="Exempel: Familjen Meisels"
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-600"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-bold text-slate-700">
                      Anledning eller dedikation
                    </span>

                    <textarea
                      value={dedication}
                      onChange={(event) =>
                        setDedication(
                          event.target.value,
                        )
                      }
                      rows={3}
                      placeholder="Exempel: Till minne av..., för att fira..."
                      className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-600"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-bold text-slate-700">
                      Kommentar, valfritt
                    </span>

                    <textarea
                      value={comment}
                      onChange={(event) =>
                        setComment(event.target.value)
                      }
                      rows={3}
                      placeholder="Övrig information till Adat Jisrael"
                      className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-600"
                    />
                  </label>

                  {error && (
                    <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#68123f] px-5 py-4 font-bold text-white transition hover:bg-[#561034]"
                  >
                    <Send className="h-5 w-5" />
                    Skicka bokningsförfrågan
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

type FilterButtonProps = {
  active: boolean
  label: string
  onClick: () => void
}

function FilterButton({
  active,
  label,
  onClick,
}: FilterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-3 py-2.5 text-sm font-bold transition ${
        active
          ? 'bg-white text-[#183b70] shadow-sm'
          : 'text-slate-500'
      }`}
    >
      {label}
    </button>
  )
}

type BookingConfirmationProps = {
  item: KiddushListItem
  host: string
  onClose: () => void
}

function BookingConfirmation({
  item,
  host,
  onClose,
}: BookingConfirmationProps) {
  return (
    <div className="py-3 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        <Check className="h-9 w-9" />
      </div>

      <h2 className="mt-6 text-2xl font-bold text-[#183b70]">
        Förfrågan är skickad
      </h2>

      <p className="mt-3 leading-7 text-slate-500">
        Adat Jisrael kommer att behandla bokningen innan
        datumet markeras som slutgiltigt bokat.
      </p>

      <div className="mt-6 rounded-2xl bg-white p-4 text-left ring-1 ring-slate-200">
        <p className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <CalendarDays className="h-4 w-4 text-[#68123f]" />
          {item.date}
        </p>

        <p className="mt-2 text-sm text-slate-600">
          {host}
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="mt-6 w-full rounded-2xl bg-[#183b70] px-5 py-4 font-bold text-white"
      >
        Klart
      </button>

      <p className="mt-4 text-xs leading-5 text-slate-400">
        Bokningen sparas ännu bara i prototypen och
        återställs om sidan laddas om.
      </p>
    </div>
  )
}

export default KiddushPage