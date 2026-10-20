export type MembershipFeeAnswers = {
  under26: boolean | null
  jfstMember: boolean | null
  seat: boolean | null
  gender: 'man' | 'woman' | null
}

export function calculateMembershipFee({
  under26,
  jfstMember,
  seat,
  gender,
}: MembershipFeeAnswers): number | null {
  if (under26 === true && seat !== null) {
    return seat ? 350 : 100
  }

  if (under26 === false && jfstMember !== null) {
    if (seat === false) {
      return jfstMember ? 1400 : 1700
    }

    if (seat === true && gender !== null) {
      if (jfstMember) {
        return gender === 'man' ? 2100 : 1500
      }

      return gender === 'man' ? 2900 : 2200
    }
  }

  return null
}
