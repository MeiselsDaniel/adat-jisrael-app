import { useEffect, useMemo, useState } from 'react'
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
import { useAuth } from '../hooks/useAuth'
import {
  createKiddushRequest,
  subscribeToAllKiddush,
  type KiddushBooking,
  type KiddushDedicationType,
} from '../services/kiddushService'

type KiddushFilter = 'all' | 'available' | 'booked'

function KiddushPage() {
  const { firebaseUser, profile } = useAuth()

  const [items, setItems] = useState<KiddushListItem[]>(
  generateKiddushDates(),
)

  const [filter, setFilter] =
    useState<KiddushFilter>('all')

  const [selectedItem, setSelectedItem] =
    useState<KiddushListItem | null>(null)

  const [host, setHost] = useState('')
  const [dedication, setDedication] = useState('')
  const [dedicationType, setDedicationType] =
    useState<KiddushDedicationType>('occasion')
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const [confirmationOpen, setConfirmationOpen] =
    useState(false)

  const [showKiddushRules, setShowKiddushRules] =
    useState(false)

  useEffect(() => {
    const unsubscribe =
      subscribeToAllKiddush(
        (bookings) => {
          setItems(
            mergeKiddushBookings(
              generateKiddushDates(),
              bookings,
            ),
          )
        },
        (caughtError) => {
          console.error(
            'Kunde inte läsa Kiddushbokningar:',
            caughtError,
          )

          setError(
            'Kiddushbokningarna kunde inte hämtas.',
          )
        },
      )

    return unsubscribe
  }, [])

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
    setDedicationType('occasion')
    setComment('')
    setError('')
    setConfirmationOpen(false)
  }

  function closeBooking() {
    setSelectedItem(null)
    setError('')
  }

  async function handleBooking(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()
    setError('')

    if (!selectedItem) {
      return
    }

    if (!firebaseUser) {
      setError(
        'Du måste vara inloggad för att boka Kiddush.',
      )
      return
    }

    if (!host.trim()) {
      setError(
        'Skriv namnet eller familjen som vill boka Kiddush.',
      )
      return
    }

    try {
      await createKiddushRequest({
        date: selectedItem.dateValue,
        sponsor: host.trim(),
        dedication:
          dedication.trim() || undefined,
        dedicationType:
          dedication.trim()
            ? dedicationType
            : undefined,
        comment:
          comment.trim() || undefined,
        requestedBy: firebaseUser.uid,
        requestedByName:
          profile?.name || undefined,
      })

      setItems((current) =>
        current.map((item) =>
          item.id === selectedItem.id
            ? {
                ...item,
                status: 'booked',
                host: host.trim(),
                dedication:
                  dedication.trim() ||
                  undefined,
                comment:
                  comment.trim() ||
                  undefined,
              }
            : item,
        ),
      )

      setConfirmationOpen(true)
    } catch (caughtError) {
      console.error(
        'Kunde inte skicka Kiddushförfrågan:',
        caughtError,
      )

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Kunde inte skicka bokningsförfrågan.',
      )
    }
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
                Se lediga datum och boka en kommande
                Shabbat eller Jom Tov.
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

      <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
        <button
          type="button"
          onClick={() =>
            setShowKiddushRules(
              (current) => !current,
            )
          }
          className="flex w-full items-center justify-between gap-4 p-5 text-left"
          aria-expanded={showKiddushRules}
        >
          <div>
            <h2 className="font-bold text-[#183b70]">
              Regler för Kiddush
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Läs reglerna innan du bokar.
            </p>
          </div>

          <span className="shrink-0 text-sm font-bold text-[#68123f]">
            {showKiddushRules
              ? 'Dölj ▲'
              : 'Visa ▼'}
          </span>
        </button>

        {showKiddushRules && (
          <div className="space-y-5 border-t border-slate-100 px-5 pb-5 pt-4 text-sm leading-6 text-slate-600">
            <p>
              Vi uppskattar att du vill ordna en Kiddush i
              Adat Jisrael. Det betyder mycket för vår
              församling och våra medlemmar.
            </p>

            <div>
              <h3 className="font-bold text-slate-900">
                Kosher
              </h3>

              <p className="mt-1">
                Adat Jisrael följer rabbin Mattias Amsters
                kosherregler. All mat och dryck som serveras
                måste därför följa församlingens
                kosherbestämmelser enligt{' '}
                <strong>kosher.jfst.se</strong>.
              </p>

              <p className="mt-2 font-semibold text-slate-800">
                Vänd dig till Chezi när det gäller catering.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900">
                Material och leverans
              </h3>

              <p className="mt-1">
                Den som arrangerar Kiddush ansvarar själv,
                eller genom sin caterer, för allt material
                som behövs, exempelvis tallrikar, muggar,
                servetter, bestick, övrigt serveringsmaterial
                och all dryck.
              </p>

              <p className="mt-2">
                All mat och utrustning måste finnas på plats
                <strong> innan Shabbat eller Jom Tov börjar</strong>.
                Borttransport kan ske först efter Shabbat
                eller Jom Tov.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900">
                Städning
              </h3>

              <p className="mt-1">
                Arrangören ansvarar för att lokalen lämnas i
                samma skick som den var innan Kiddush.
              </p>

              <p className="mt-2">
                Om extra städning krävs kan församlingen
                komma att ta ut en städavgift för att täcka
                sina omkostnader.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900">
                Gästlista och säkerhet
              </h3>

              <p className="mt-1">
                Senast <strong>10 dagar före Kiddush</strong>{' '}
                ska arrangören skicka en gästlista till
                synagogan och vid behov hjälpa till att
                identifiera gäster som inte är kända av
                församlingen.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900">
                Bar/Bat Mitzva
              </h3>

              <p className="mt-1">
                Planerar ni en Bar eller Bat Mitzva?{' '}
                <strong>Mazel tov!</strong> Kom ihåg att
                samordna datum och planering med rabbin Amster
                och gabbaim. Kontakta{' '}
                <a
                  href="mailto:info@adatjisrael.se"
                  className="font-bold text-[#183b70]"
                >
                  info@adatjisrael.se
                </a>
                .
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900">
                Fotografering
              </h3>

              <p className="mt-1">
                Under Shabbat och Jom Tov är fotografering,
                filmning och ljudupptagning inte tillåten.
              </p>
            </div>

            <div className="rounded-2xl bg-sky-50 p-4">
              <h3 className="font-bold text-[#183b70]">
                Frågor?
              </h3>

              <p className="mt-2">
                Styrelsen:
                <br />
                <a
                  href="mailto:info@adatjisrael.se"
                  className="font-bold text-[#183b70]"
                >
                  info@adatjisrael.se
                </a>
              </p>

              <p className="mt-3">
                Rabbin Mattias Amster:
                <br />
                <a
                  href="mailto:mattias.amster@jfst.se"
                  className="font-bold text-[#183b70]"
                >
                  mattias.amster@jfst.se
                </a>
              </p>
            </div>
          </div>
        )}
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

                  <div className="space-y-3">
                    

                    <div className="space-y-3">
                    <label className="block">
                      <span className="text-sm font-bold text-slate-700">
                        Typ av dedikation
                      </span>

                      <select
                        value={dedicationType}
                        onChange={(event) =>
                          setDedicationType(
                            event.target.value as KiddushDedicationType,
                          )
                        }
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-600"
                      >
                        <option value="occasion">
                          Med anledning av
                        </option>

                        <option value="memory">
                          Till minne av
                        </option>

                        <option value="celebration">
                          För att fira
                        </option>

                        <option value="custom">
                          Egen text
                        </option>
                      </select>
                    </label>

                    <label className="block">
                      <span className="text-sm font-bold text-slate-700">
                        {dedicationType === 'memory'
                          ? 'Till minne av vem?'
                          : dedicationType === 'celebration'
                            ? 'Vad vill du fira?'
                            : dedicationType === 'custom'
                              ? 'Text'
                              : 'Anledning'}
                      </span>

                      <textarea
                        value={dedication}
                        onChange={(event) =>
                          setDedication(
                            event.target.value,
                          )
                        }
                        rows={3}
                        placeholder={
                          dedicationType === 'memory'
                            ? 'Exempel: David ben Moshe'
                            : dedicationType === 'celebration'
                              ? 'Exempel: vår dotters bat mitzva'
                              : dedicationType === 'custom'
                                ? 'Skriv texten som den ska visas'
                                : 'Exempel: Ervins födelsedag'
                        }
                        className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-600"
                      />
                    </label>
                  </div>
                  </div>

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

function mergeKiddushBookings(
  generatedItems: KiddushListItem[],
  bookings: KiddushBooking[],
): KiddushListItem[] {
  const bookingsByDate =
    new Map(
      bookings.map((booking) => [
        booking.date,
        booking,
      ]),
    )

  return generatedItems
    .filter((item) => {
      const booking =
        bookingsByDate.get(
          item.dateValue,
        )

      return booking?.status !== 'blocked'
    })
    .map((item) => {
      const booking =
        bookingsByDate.get(
          item.dateValue,
        )

      if (!booking) {
        return {
          ...item,
          status: 'available',
          host: undefined,
          dedication: undefined,
          comment: undefined,
        }
      }

      if (
        booking.status === 'approved'
      ) {
        return {
          ...item,
          status: 'booked',
          host: booking.sponsor,
          dedication:
            booking.dedication,
          comment:
            booking.comment,
        }
      }

      /*
       * Gamla testposter med pending
       * visas tills de är borttagna.
       */
      if (
        booking.status === 'pending'
      ) {
        return {
          ...item,
          status: 'pending',
          host: booking.sponsor,
          dedication:
            booking.dedication,
          comment:
            booking.comment,
        }
      }

      return item
    })
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
        Kiddush är bokad
      </h2>

      <p className="mt-3 leading-7 text-slate-500">
        Din Kiddushbokning är registrerad.
        Kontakta Adat Jisrael om något behöver ändras.
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
        Bokningen är sparad i Adat Jisraels Kiddushkalender.
      </p>
    </div>
  )
}

export default KiddushPage