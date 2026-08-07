export type ProgramItem = {
  id: string
  label: string
  value: string
  icon:
    | 'book'
    | 'clock'
    | 'mic'
    | 'food'
    | 'moon'
    | 'wine'
}

export type TodayProgram = {
  type: 'shabbat' | 'holiday'
  title: string
  date: string
  program: ProgramItem[]
}

export const todayProgram: TodayProgram = {
  type: 'shabbat',

  title: 'Parashat Devarim',

  date: 'Lördag 15 augusti',

  program: [
    {
      id: 'shacharit',
      icon: 'book',
      label: 'Shacharit',
      value: '09.00',
    },
    {
      id: 'mincha',
      icon: 'clock',
      label: 'Mincha',
      value: '12.34',
    },
    {
      id: 'rabbi',
      icon: 'mic',
      label: 'Predikan',
      value: 'Rabbin Amster',
    },
    {
      id: 'havdala',
      icon: 'moon',
      label: 'Havdala',
      value: '19.45',
    },
  ],
}