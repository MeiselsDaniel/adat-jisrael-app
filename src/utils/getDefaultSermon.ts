const REFERENCE_SHABBAT =
  new Date('2026-08-15T12:00:00')

const WEEK_MS =
  7 * 24 * 60 * 60 * 1000

export function getDefaultSermon(
  dateValue: string,
): string | null {
  const date =
    new Date(
      `${dateValue}T12:00:00`,
    )

  // Grundschemat gäller Shabbat.
  if (
    Number.isNaN(date.getTime()) ||
    date.getDay() !== 6
  ) {
    return null
  }

  const weeksFromReference =
    Math.round(
      (
        date.getTime() -
        REFERENCE_SHABBAT.getTime()
      ) / WEEK_MS,
    )

  return Math.abs(weeksFromReference) % 2 === 0
    ? 'Rabbin Amster'
    : 'Rabbin Greisman'
}
