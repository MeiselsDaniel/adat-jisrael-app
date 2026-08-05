import type {
  AppUser,
  Permissions,
  UserCategory,
} from '../types'

const memberPermissions: Permissions = {
  registerForTfilot: true,
  viewAttendanceCount: true,
  viewAttendeeNames: true,
  viewMemberCalendar: true,
  bookKiddush: true,
  viewMemberInformation: true,
}

const nonMemberPermissions: Permissions = {
  registerForTfilot: true,
  viewAttendanceCount: true,
  viewAttendeeNames: false,
  viewMemberCalendar: false,
  bookKiddush: false,
  viewMemberInformation: false,
}

export const demoUsers: AppUser[] = [
  {
    id: 'user-daniel',
    name: 'Daniel Meisels',
    email: 'daniel@adatjisrael.se',
    role: 'admin',
    category: 'board',
    status: 'approved',
    permissions: memberPermissions,
  },
  {
    id: 'user-member',
    name: 'Testmedlem',
    email: 'medlem@adatjisrael.se',
    role: 'user',
    category: 'member',
    status: 'approved',
    permissions: memberPermissions,
  },
  {
    id: 'user-guest',
    name: 'Testbesökare',
    email: 'gast@adatjisrael.se',
    role: 'user',
    category: 'nonMember',
    status: 'approved',
    permissions: nonMemberPermissions,
  },
]

export function getDefaultPermissions(
  category: UserCategory,
): Permissions {
  if (
    category === 'member' ||
    category === 'board' ||
    category === 'staff' ||
    category === 'rabbi'
  ) {
    return { ...memberPermissions }
  }

  return { ...nonMemberPermissions }
}