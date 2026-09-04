import {
  todayProgram,
  type ProgramItem,
} from '../data/todayProgram'
import type { DaySettings } from '../services/daySettingsService'

const specialShabbatNames = [
  'Shabbat Shuva',
  'Shabbat Shekalim',
  'Shabbat Zachor',
  'Shabbat Parah',
  'Shabbat HaChodesh',
  'Shabbat HaGadol',
  'Shabbat Chazon',
  'Shabbat Nachamu',
]

type HebcalProgramInfo = {
  holidayNames: string[]
  parasha?: string | null
  hebrewDate?: string | null
  isShabbat: boolean
  isShabbatMevarchim: boolean
  roshChodeshName?: string | null
}

type KiddushProgramInfo = {
  show: boolean
  sponsor?: string
  dedication?: string
  dedicationType?: string
}

type BuildProgramCardDataInput = {
  dateValue: string
  hebcalInfo: HebcalProgramInfo
  daySettings: DaySettings | null
  sermon?: string | null
  havdalaTime?: string | null
  minchaTime?: string | null
  minchaLabel?: string | null
  kiddush?: KiddushProgramInfo | null
}

export type ProgramCardData = {
  isHoliday: boolean
  headerLabel: string
  displayDate: string
  displayTitle: string
  hebrewDate?: string | null
  program: ProgramItem[]
  comment?: string
  moreInformation?: string
}

function findProgramItem(
  id: string,
  label: string,
): ProgramItem | undefined {
  return todayProgram.program.find(
    (item) =>
      item.id === id ||
      item.label
        .toLowerCase()
        .includes(label),
  )
}

function formatKiddushDedication(
  dedication: string,
  type?: string,
): string {
  const clean = dedication
    .trim()
    .replace(/[.!?]+$/, '')

  if (type === 'memory') {
    return `Till minne av ${clean}.`
  }

  if (type === 'celebration') {
    return `För att fira ${clean}.`
  }

  if (type === 'custom') {
    return `${clean}.`
  }

  if (type === 'occasion') {
    return `Med anledning av ${clean}.`
  }

  // Gamla bokningar saknar typ.
  return `${clean}.`
}

export function buildProgramCardData({
  dateValue,
  hebcalInfo,
  daySettings,
  sermon,
  havdalaTime,
  minchaTime,
  minchaLabel,
  kiddush,
}: BuildProgramCardDataInput): ProgramCardData {
  const chanukahNames =
    hebcalInfo.holidayNames.filter((name) => {
      const normalized = name.toLowerCase()

      return (
        normalized.includes('chanukah') ||
        normalized.includes('hanukkah')
      )
    })

  const actualHolidayNames =
    hebcalInfo.holidayNames.filter(
      (name) => {
        const normalized = name.toLowerCase()

        return (
          !specialShabbatNames.includes(name) &&
          name !== 'Leil Selichot' &&
          !normalized.includes('chanukah') &&
          !normalized.includes('hanukkah')
        )
      },
    )

  const specialShabbatNotices =
    hebcalInfo.holidayNames.filter(
      (name) =>
        specialShabbatNames.includes(name),
    )

  const configuredAsHoliday =
    daySettings?.dayType === 'holiday' ||
    daySettings?.dayType === 'shabbatHoliday' ||
    daySettings?.dayType === 'erevShabbatHoliday' ||
    daySettings?.dayType ===
      'erevShabbatErevHoliday'

  const isHoliday =
    configuredAsHoliday ||
    actualHolidayNames.length > 0

  const customHolidayName =
    daySettings?.holidayName?.trim()

  const baseDisplayTitle =
    isHoliday
      ? (
          customHolidayName ||
          actualHolidayNames[0] ||
          'Högtid'
        )
      : (
          hebcalInfo.parasha ||
          todayProgram.title
        )

  const notices = [
    ...specialShabbatNotices,
    chanukahNames.length > 0
      ? 'Chanukka'
      : null,
    hebcalInfo.isShabbatMevarchim
      ? 'Shabbat Mevarchim'
      : null,
    hebcalInfo.roshChodeshName,
  ].filter(
    (value): value is string =>
      Boolean(value),
  )

  const displayTitle = [
    baseDisplayTitle,
    ...notices,
  ].join(' · ')

  const date =
    new Date(`${dateValue}T12:00:00`)

  const weekdayName =
    new Intl.DateTimeFormat('sv-SE', {
      weekday: 'long',
    }).format(date)

  const formattedDate =
    new Intl.DateTimeFormat('sv-SE', {
      day: 'numeric',
      month: 'long',
    }).format(date)

  const displayDate =
    `${weekdayName.charAt(0).toUpperCase()}${weekdayName.slice(1)} ${formattedDate}`

  const headerLabel =
    isHoliday
      ? daySettings?.dayType ===
          'shabbatHoliday'
        ? `${baseDisplayTitle} · Shabbat`
        : baseDisplayTitle
      : 'Shabbat'

  const shacharit =
    findProgramItem(
      'shacharit',
      'shacharit',
    )

  const sermonSource =
    findProgramItem(
      'sermon',
      'predikan',
    ) ??
    findProgramItem(
      'rabbi',
      'predikan',
    )

  const minchaSource =
    findProgramItem(
      'mincha',
      'mincha',
    )

  const havdalaSource =
    findProgramItem(
      'havdala',
      'havdala',
    )

  const program: ProgramItem[] = []

  const isYomKippur =
    displayTitle
      .toLowerCase()
      .includes('yom kippur')

  if (shacharit) {
    program.push(shacharit)
  }

  if (sermon && sermonSource) {
    program.push({
      ...sermonSource,
      value: sermon,
    })
  }

  if (kiddush?.show && !isYomKippur) {
    const kiddushSponsor =
      kiddush.sponsor?.trim()

    const kiddushDedication =
      kiddush.dedication?.trim()

    program.push({
      id: 'firebase-kiddush',
      label: 'Kiddush',
      value: kiddushSponsor
        ? kiddushDedication
          ? `${kiddushSponsor} bjuder på Kiddush. ${formatKiddushDedication(
              kiddushDedication,
              kiddush.dedicationType,
            )}`
          : `${kiddushSponsor} bjuder på Kiddush.`
        : 'Adat Jisrael bjuder på Kiddush.',
      icon: 'wine',
    })
  }

  if (minchaTime && minchaSource) {
    program.push({
      ...minchaSource,
      label:
        minchaLabel?.trim() ||
        minchaSource.label,
      value: minchaTime,
    })
  }

  if (
    daySettings?.showHavdala !== false &&
    havdalaTime &&
    havdalaSource
  ) {
    program.push({
      ...havdalaSource,
      value: havdalaTime,
    })
  }

  return {
    isHoliday,
    headerLabel,
    displayDate,
    displayTitle,
    hebrewDate: hebcalInfo.hebrewDate,
    program,
    comment:
      daySettings?.comment?.trim() ||
      undefined,
    moreInformation:
      daySettings?.moreInformation?.trim() ||
      undefined,
  }
}
