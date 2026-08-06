import {
  BookOpen,
  ChevronRight,
  Clock,
  Heart,
  Info,
  Mic2,
  MoonStar,
  Star,
  Utensils,
} from 'lucide-react'
import type { ReactNode } from 'react'
import LiveMinyanCard from '../components/LiveMinyanCard'
import { informationPosts } from '../data/events'
import { synagogueSettings } from '../data/settings'
import {
  todayProgram,
  type ProgramItem,
} from '../data/todayProgram'
import type { Tefila } from '../types'
import { generateStandardTfilot } from '../utils/generateStandardTfilot'

type HomePageProps = {
  showMemberInformation: boolean
  openInformation: () => void
}

const upcomingTfilot = generateStandardTfilot()

const nextFriday = findNextWeekday(new Date(), 5)
const nextSaturday = addDays(nextFriday, 1)

const fridayDateValue = formatDateValue(nextFriday)
const saturdayDateValue = formatDateValue(nextSaturday)

const scheduleWithKabbalat =
  synagogueSettings.schedule as typeof synagogueSettings.schedule & {
    kabbalatShabbat?: string
  }

const kabbalatShabbat: Tefila = {
  id: `${fridayDateValue}-kabbalat-shabbat`,
  firestoreId: `${fridayDateValue}-kabbalat-shabbat`,
  dateValue: fridayDateValue,
  day: 'Fredag',
  date: formatSwedishDate(nextFriday),
  title: 'Kabbalat Shabbat',
  time: scheduleWithKabbalat.kabbalatShabbat ?? '19.30',
  attending: 0,
}

const tfilotBeforeShabbat = upcomingTfilot.filter(
  (tefila) =>
    !tefila.dateValue ||
    tefila.dateValue < saturdayDateValue,
)

const tfilotAfterShabbat = upcomingTfilot.filter(
  (tefila) =>
    (tefila.dateValue ?? '') >
    saturdayDateValue,
)

function HomePage({
  showMemberInformation,
  openInformation,
}: HomePageProps) {
  return (
    <div className="space-y-7">
      <section>
        <h1 className="text-2xl font-bold text-[#183b70]">
          På gång
        </h1>
      </section>

      <section className="space-y-3">
        {tfilotBeforeShabbat.map((tefila) => (
          <LiveMinyanCard
            key={tefila.id}
            tefila={tefila}
          />
        ))}

        <LiveMinyanCard
          tefila={kabbalatShabbat}
        />

        <ProgramCard />

        {tfilotAfterShabbat.map((tefila) => (
          <LiveMinyanCard
            key={tefila.id}
            tefila={tefila}
          />
        ))}
      </section>

      {showMemberInformation && (
        <InformationSection
          openInformation={openInformation}
        />
      )}

      <SupportSection />

      <SponsorsSection />
    </div>
  )
}

function ProgramCard() {
  const isHoliday = todayProgram.type === 'holiday'

  const accentColor = isHoliday
    ? 'bg-amber-700'
    : 'bg-[#68123f]'

  const accentTextColor = isHoliday
    ? 'text-amber-800'
    : 'text-[#68123f]'

  const accentBackground = isHoliday
    ? 'bg-amber-100'
    : 'bg-rose-100'

  return (
    <article
      className={`overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ${
        isHoliday
          ? 'ring-amber-700/25'
          : 'ring-[#68123f]/25'
      }`}
    >
      <div className={`${accentColor} px-5 py-3 text-white`}>
        <div className="flex items-center gap-2">
          {isHoliday ? (
            <Star className="h-5 w-5" />
          ) : (
            <MoonStar className="h-5 w-5" />
          )}

          <p className="text-sm font-bold uppercase tracking-wide">
            {isHoliday ? 'Högtid' : 'Shabbat'}
          </p>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p
              className={`text-sm font-semibold ${accentTextColor}`}
            >
              {todayProgram.date}
            </p>

            <h2 className="mt-1 text-2xl font-bold text-[#183b70]">
              {todayProgram.title}
            </h2>
          </div>

          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${accentBackground} ${accentTextColor}`}
          >
            {isHoliday ? (
              <Star className="h-6 w-6" />
            ) : (
              <MoonStar className="h-6 w-6" />
            )}
          </div>
        </div>

        <div className="mt-5 divide-y divide-slate-100">
          {todayProgram.program.map((item) => (
            <ProgramDetail
              key={item.id}
              item={item}
            />
          ))}
        </div>
      </div>
    </article>
  )
}

type ProgramDetailProps = {
  item: ProgramItem
}

function ProgramDetail({
  item,
}: ProgramDetailProps) {
  return (
    <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#183b70]">
        {getProgramIcon(item.icon)}
      </div>

      <div className="flex-1">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
          {item.label}
        </p>

        <p className="mt-0.5 font-semibold text-slate-800">
          {item.value}
        </p>
      </div>
    </div>
  )
}

function getProgramIcon(
  icon: ProgramItem['icon'],
): ReactNode {
  const iconClassName = 'h-5 w-5'

  switch (icon) {
    case 'book':
      return <BookOpen className={iconClassName} />

    case 'clock':
      return <Clock className={iconClassName} />

    case 'mic':
      return <Mic2 className={iconClassName} />

    case 'food':
      return <Utensils className={iconClassName} />

    case 'moon':
      return <MoonStar className={iconClassName} />

    default:
      return <Star className={iconClassName} />
  }
}

type InformationSectionProps = {
  openInformation: () => void
}

function InformationSection({
  openInformation,
}: InformationSectionProps) {
  const latestPosts = informationPosts
    .filter((post) => post.status === 'published')
    .filter(
      (post) => post.visibility === 'membersOnly',
    )
    .slice(0, 2)

  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-[#183b70]">
          Information
        </h2>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-[#183b70]">
          <Info className="h-5 w-5" />
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
        {latestPosts.map((post) => (
          <button
            key={post.id}
            type="button"
            onClick={openInformation}
            className="flex w-full items-center gap-4 border-b border-slate-100 px-5 py-4 text-left transition last:border-0 hover:bg-slate-50"
          >
            <div className="flex-1">
              {post.pinned && (
                <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-800">
                  Viktigt
                </span>
              )}

              <h3 className="mt-2 font-bold text-slate-900">
                {post.title}
              </h3>

              {post.summary && (
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                  {post.summary}
                </p>
              )}
            </div>

            <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={openInformation}
        className="mt-3 w-full rounded-2xl bg-sky-50 px-4 py-3 text-sm font-bold text-[#183b70]"
      >
        Visa all information
      </button>
    </section>
  )
}

function SupportSection() {
  async function handleSwish() {
    try {
      await navigator.clipboard.writeText(
        synagogueSettings.swish.number,
      )

      window.alert(
        `Swishnummer ${synagogueSettings.swish.number} har kopierats.`,
      )
    } catch {
      window.alert(
        `Swish: ${synagogueSettings.swish.number}`,
      )
    }
  }

  return (
    <section className="overflow-hidden rounded-3xl bg-[#183b70] text-white shadow-sm">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
            <Heart className="h-6 w-6" />
          </div>

          <div>
            <h2 className="text-xl font-bold">
              Stöd {synagogueSettings.synagogueName}
            </h2>

            <p className="mt-2 text-sm leading-6 text-blue-100">
              Din gåva bidrar till ett levande judiskt
              församlingsliv, våra tfilot och vår
              verksamhet.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-white/10 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wide text-blue-100">
            Swish
          </p>

          <p className="mt-1 text-2xl font-bold tracking-wide">
            {synagogueSettings.swish.number}
          </p>

          <p className="mt-1 text-sm text-blue-100">
            {synagogueSettings.swish.message}
          </p>
        </div>

        <button
          type="button"
          onClick={handleSwish}
          className="mt-4 w-full rounded-2xl bg-white px-4 py-3 font-bold text-[#183b70] transition hover:bg-blue-50"
        >
          Kopiera Swish-nummer
        </button>
      </div>
    </section>
  )
}

function SponsorsSection() {
  return (
    <section className="pb-2">
      <h2 className="text-center text-sm font-bold uppercase tracking-wide text-slate-400">
        Tack till våra sponsorer
      </h2>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {synagogueSettings.sponsors.map((sponsor) => (
          <div
            key={sponsor.id}
            className="flex min-h-28 items-center justify-center rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
          >
            <img
              src={sponsor.logoUrl}
              alt={sponsor.name}
              className="max-h-20 max-w-full object-contain"
            />
          </div>
        ))}
      </div>
    </section>
  )
}

function findNextWeekday(
  startDate: Date,
  weekday: number,
): Date {
  const result = new Date(startDate)
  result.setHours(0, 0, 0, 0)

  const daysUntil =
    (weekday - result.getDay() + 7) % 7

  result.setDate(result.getDate() + daysUntil)

  return result
}

function addDays(
  date: Date,
  numberOfDays: number,
): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + numberOfDays)

  return result
}

function formatDateValue(
  date: Date,
): string {
  const year = date.getFullYear()
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0')
  const day = String(
    date.getDate(),
  ).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatSwedishDate(
  date: Date,
): string {
  return new Intl.DateTimeFormat('sv-SE', {
    day: 'numeric',
    month: 'long',
  }).format(date)
}

export default HomePage