import type {
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