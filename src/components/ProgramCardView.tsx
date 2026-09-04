import type { ReactNode } from 'react'
import {
  BookOpen,
  Clock,
  Mic2,
  ScrollText,
  Star,
  Tablets,
  TentTree,
  Utensils,
  Apple,
  Wheat,
  Wine,
} from 'lucide-react'
import type {
  ProgramItem,
} from '../data/todayProgram'

type ProgramCardViewProps = {
  isHoliday: boolean
  headerLabel: string
  displayDate: string
  displayTitle: string
  hebrewDate?: string | null
  program: ProgramItem[]
  comment?: string
  moreInformation?: string
}

function ProgramCardView({
  isHoliday,
  headerLabel,
  displayDate,
  displayTitle,
  hebrewDate,
  program,
  comment,
  moreInformation,
}: ProgramCardViewProps) {
  const HolidayIcon =
    getHolidayIcon(
      `${headerLabel} ${displayTitle}`,
    )

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
      <div
        className={`${accentColor} px-5 py-3 text-white`}
      >
        <div className="flex items-center gap-2">
          {isHoliday && (
            <HolidayIcon className="h-5 w-5" />
          )}

          <p className="text-sm font-bold uppercase tracking-wide">
            {headerLabel}
          </p>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p
              className={`text-sm font-semibold ${accentTextColor}`}
            >
              {displayDate}
            </p>

            <h2 className="mt-1 text-2xl font-bold text-[#183b70]">
              {displayTitle}
            </h2>

            {hebrewDate && (
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {hebrewDate}
              </p>
            )}
          </div>

          {isHoliday && (
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${accentBackground} ${accentTextColor}`}
            >
              <HolidayIcon className="h-6 w-6" />
            </div>
          )}
        </div>

        <div className="mt-5 divide-y divide-slate-100">
          {program.map((item) => (
            <ProgramDetail
              key={item.id}
              item={item}
            />
          ))}
        </div>

        {comment && (
          <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
            {comment}
          </div>
        )}

        {moreInformation && (
          <div className="mt-5 rounded-2xl bg-sky-50 p-4 ring-1 ring-sky-100">
            <p className="text-xs font-bold uppercase tracking-wide text-[#183b70]">
              Mer information
            </p>

            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
              {moreInformation}
            </p>
          </div>
        )}
      </div>
    </article>
  )
}

function getHolidayIcon(label: string) {
  const value = label.toLowerCase()

  if (
    value.includes('rosh hashana') ||
    value.includes('rosh hashanah')
  ) {
    return Apple
  }

  if (
    value.includes('yom kippur') ||
    value.includes('jom kippur')
  ) {
    return BookOpen
  }

  if (value.includes('sukkot')) {
    return TentTree
  }

  if (
    value.includes('simchat') ||
    value.includes('shmini atzeret') ||
    value.includes('shemini atzeret')
  ) {
    return ScrollText
  }

  if (
    value.includes('pesach') ||
    value.includes('passover')
  ) {
    return Wheat
  }

  if (value.includes('shavuot')) {
    return Tablets
  }

  return Star
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
      return (
        <BookOpen
          className={iconClassName}
        />
      )

    case 'clock':
      return (
        <Clock className={iconClassName} />
      )

    case 'mic':
      return (
        <Mic2 className={iconClassName} />
      )

    case 'wine':
      return (
        <Wine className={iconClassName} />
      )

    case 'food':
      return (
        <Utensils
          className={iconClassName}
        />
      )

    case 'moon':
      return (
        <Clock className={iconClassName} />
      )

    default:
      return (
        <Star className={iconClassName} />
      )
  }
}

export default ProgramCardView
