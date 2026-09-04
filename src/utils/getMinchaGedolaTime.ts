import {
  GeoLocation,
  Zmanim,
} from '@hebcal/core'

export function getMinchaGedolaTime(
  date: Date,
): string | null {
  try {
    const location = new GeoLocation(
      'Stockholm',
      59.3293,
      18.0686,
      0,
      'Europe/Stockholm',
    )

    const zmanim = new Zmanim(
      location,
      date,
      false,
    )

    const minchaGedola =
      zmanim.minchaGedola()

    return new Intl.DateTimeFormat(
      'sv-SE',
      {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Europe/Stockholm',
      },
    ).format(minchaGedola)
  } catch (error) {
    console.error(
      'Kunde inte beräkna Mincha Gedolah:',
      error,
    )

    return null
  }
}
