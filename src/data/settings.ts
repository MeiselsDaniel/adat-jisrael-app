export type SynagogueSettings = {
  synagogueName: string
  city: string
  countryCode: string
  timeZone: string

  schedule: {
    weekdayShacharit: string
    sundayShacharit: string
    shabbatShacharit: string
  }

  swish: {
    number: string
    message: string
  }

  sponsors: {
    id: string
    name: string
    logoUrl: string
    websiteUrl?: string
  }[]
}

export const synagogueSettings: SynagogueSettings = {
  synagogueName: 'Adat Jisrael',
  city: 'Stockholm',
  countryCode: 'SE',
  timeZone: 'Europe/Stockholm',

  schedule: {
    weekdayShacharit: '07.30',
    sundayShacharit: '08.15',
    shabbatShacharit: '09.00',
  },

  swish: {
    number: '123 237 05 75',
    message: 'Gåva till Adat Jisrael',
  },

  sponsors: [
    {
      id: 'oh-revision',
      name: 'OH Revision',
      logoUrl: '/sponsors/oh-revision.png',
    },
    {
      id: 'sibyllans-kaffe-och-te',
      name: 'Sibyllans Kaffe och Te',
      logoUrl: '/sponsors/sibyllans-kaffe-och-te.png',
    },
  ],
}