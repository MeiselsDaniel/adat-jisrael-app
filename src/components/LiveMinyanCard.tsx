import { useEffect, useMemo, useState } from 'react'
import MinyanCard from './MinyanCard'
import { useAuth } from '../hooks/useAuth'
import { useTefilaRegistrations } from '../hooks/useTefilaRegistrations'
import {
  confirmMinyan,
  ensureTefilaExists,
  setTefilaStatus,
  subscribeToTefila,
  type MinyanResult,
  type TefilaRecord,
} from '../services/tefilaService'
import type { Tefila } from '../types'
import { getHebcalDayInfo } from '../services/hebcalService'
import {
  getDisplayedCandleLightingTime,
  getDisplayedHavdalaTime,
  subscribeToDaySettings,
  type DaySettings,
} from '../services/daySettingsService'
import { sendMinyanNeedPush } from '../services/adminPushService'

type LiveMinyanCardProps = {
  tefila: Tefila
  showAdminControls?: boolean
  extraInfo?: {
    label: string
    value: string
  }
  holidayLabel?: string
}

function LiveMinyanCard({
  tefila,
  showAdminControls = false,
  extraInfo,
  holidayLabel,
}: LiveMinyanCardProps) {
  const { firebaseUser, profile } = useAuth()

  const tefilaId =
    tefila.firestoreId ??
    `tefila-${tefila.id}`

  const [record, setRecord] =
    useState<TefilaRecord | null>(null)

  const [daySettings, setDaySettings] =
    useState<DaySettings | null>(null)

  const [
    sendingMinyanPush,
    setSendingMinyanPush,
  ] = useState(false)

  const [
    minyanPushMessage,
    setMinyanPushMessage,
  ] = useState('')

  useEffect(() => {
    const unsubscribe = subscribeToTefila(
      tefilaId,
      setRecord,
    )

    return unsubscribe
  }, [tefilaId])


  useEffect(() => {
    if (!tefila.dateValue) {
      setDaySettings(null)
      return
    }

    return subscribeToDaySettings(
      tefila.dateValue,
      setDaySettings,
    )
  }, [tefila.dateValue])

  /*
   * Standardschemat används som grund.
   * Finns en ändring i Firestore tar den över
   * titel och tid för just denna tfilah.
   */
  const displayedTefila = useMemo<Tefila>(
    () => ({
      ...tefila,
      title: record?.title ?? tefila.title,
      time: record?.time ?? tefila.time,
    }),
    [record, tefila],
  )

  const {
    loading,
    registrations,
    attendance,
    registered,
    currentRegistration,
    register,
    unregister,
  } = useTefilaRegistrations(
    tefilaId,
    firebaseUser?.uid,
    profile?.name,
  )

  const canManage =
    showAdminControls &&
    profile?.role === 'admin'

  const isHolidayWithoutRegistration =
    daySettings?.dayType === 'holiday' ||
    daySettings?.dayType === 'shabbatHoliday'

  const registrationAllowed =
    !isHolidayWithoutRegistration &&
    displayedTefila.allowRegistration !== false &&
    record?.allowRegistration !== false

  const canRegisterForMinyan =
    registrationAllowed &&
    (
      profile?.role === 'admin' ||
      profile?.countsForMinyan === true
    )

  const hebcalInfo =
    tefila.dateValue
      ? getHebcalDayInfo(
          tefila.dateValue,
        )
      : null

  const candleLightingTime =
    getDisplayedCandleLightingTime(
      hebcalInfo?.candleLightingTime ??
        null,
      daySettings,
    )

  const havdalaTime =
    getDisplayedHavdalaTime(
      hebcalInfo?.havdalaTime ??
        null,
      daySettings,
    )

  const dayIsHoliday =
    daySettings?.dayType === 'holiday' ||
    daySettings?.dayType === 'shabbatHoliday'

  const isErevShabbatErevHoliday =
    daySettings?.dayType ===
    'erevShabbatErevHoliday'

  const isShacharitForErevStyling =
    displayedTefila.title
      .toLowerCase()
      .includes('shacharit')

  const applyErevShabbatErevHolidayStyling =
    isErevShabbatErevHoliday &&
    !isShacharitForErevStyling

  const effectiveHolidayKind =
    tefila.kind === 'erevHoliday' ||
    applyErevShabbatErevHolidayStyling
      ? 'erevHoliday'
      : tefila.kind === 'holiday' ||
          dayIsHoliday
        ? 'holiday'
        : tefila.kind

  const rawHolidayName =
    daySettings?.holidayName?.trim() ||
    hebcalInfo?.holidayNames?.[0] ||
    ''

  const erevHolidayName =
    rawHolidayName
      .toLowerCase()
      .startsWith('erev ')
      ? rawHolidayName
      : rawHolidayName
        ? `Erev ${rawHolidayName}`
        : 'Erev högtid'

  const calculatedHolidayLabel =
    applyErevShabbatErevHolidayStyling
      ? `Erev Shabbat · ${erevHolidayName}`
      : effectiveHolidayKind === 'erevHoliday'
        ? erevHolidayName
        : effectiveHolidayKind === 'holiday'
          ? rawHolidayName || 'Högtid'
          : undefined

  const hebcalHolidayNames =
    hebcalInfo?.holidayNames ?? []

  const cholHamoedHoliday =
    hebcalHolidayNames.find((name) => {
      const normalized =
        name.toLowerCase()

      return (
        normalized.includes('chol hamoed') ||
        normalized.includes("ch''m") ||
        normalized.includes('ch”m') ||
        normalized.includes('ch\"m')
      )
    })

  const chanukahHoliday =
    hebcalHolidayNames.find((name) => {
      const normalized =
        name.toLowerCase()

      return (
        normalized.includes('chanukah') ||
        normalized.includes('hanukkah')
      )
    })

  const fastHoliday =
    hebcalHolidayNames.find((name) => {
      const normalized =
        name.toLowerCase()

      return (
        normalized.includes('tzom gedalia') ||
        normalized.includes('gedaliah') ||
        normalized.includes("asara b'tevet") ||
        normalized.includes('asara b’tevet') ||
        normalized.includes("ta'anit esther") ||
        normalized.includes('ta’anit esther') ||
        normalized.includes('tzom tammuz') ||
        normalized.includes("tisha b'av") ||
        normalized.includes('tisha b’av')
      )
    })

  const minorDayLabel =
    effectiveHolidayKind !== 'holiday' &&
    effectiveHolidayKind !== 'erevHoliday'
      ? cholHamoedHoliday
        ? cholHamoedHoliday
            .toLowerCase()
            .includes('pesach')
          ? 'Chol Hamoed · Pesach'
          : 'Chol Hamoed · Sukkot'
        : chanukahHoliday
          ? 'Chanukka'
          : fastHoliday
            ? `Fastedag · ${
                fastHoliday
                  .replace(/^Fast of /i, '')
                  .replace(/h$/, '')
              }`
            : undefined
      : undefined

  const holidayExtraInfo =
    effectiveHolidayKind === 'erevHoliday' &&
    candleLightingTime
      ? {
          label: 'Ljuständning',
          value: candleLightingTime,
        }
      : effectiveHolidayKind === 'holiday' &&
          havdalaTime
        ? {
            label: 'Havdala',
            value: havdalaTime,
          }
        : undefined

  const displayedExtraInfo =
    extraInfo ?? holidayExtraInfo

  async function ensureRecord() {
    await ensureTefilaExists({
      id: tefilaId,
      title: displayedTefila.title,
      date:
        tefila.dateValue ??
        tefila.date,
      time: displayedTefila.time,
    })
  }

  async function cancelTefila() {
    await ensureRecord()

    await setTefilaStatus(
      tefilaId,
      'cancelled',
    )
  }

  async function reactivateTefila() {
    await ensureRecord()

    await setTefilaStatus(
      tefilaId,
      'scheduled',
    )
  }

  async function saveMinyanResult(
    result: MinyanResult,
    actualAttendance: number,
  ) {
    if (!firebaseUser) {
      return
    }

    await ensureRecord()

    await confirmMinyan({
      tefilaId,
      result,
      actualAttendance,
      confirmedBy: firebaseUser.uid,
    })
  }

  async function sendMinyanPush() {
    setSendingMinyanPush(true)
    setMinyanPushMessage('')

    try {
      const result =
        await sendMinyanNeedPush(
          tefilaId,
        )

      setMinyanPushMessage(
        result.successCount > 0
          ? `Push skickad till ${result.successCount} enheter.`
          : 'Ingen push kunde skickas.',
      )
    } catch (error) {
      console.error(
        'Kunde inte skicka minjanpush:',
        error,
      )

      const firebaseError =
        error as {
          code?: string
          message?: string
          details?: unknown
        }

      console.error(
        'Minjanpush error details:',
        {
          code: firebaseError.code,
          message: firebaseError.message,
          details: firebaseError.details,
        },
      )

      setMinyanPushMessage(
        firebaseError.message ||
          'Pushen kunde inte skickas.',
      )
    } finally {
      setSendingMinyanPush(false)
    }
  }

  const peopleNeeded =
    Math.max(
      0,
      10 - attendance,
    )

  const isStandardShacharit =
    tefila.firestoreId?.endsWith(
      '-shacharit',
    ) ||
    String(tefila.id).endsWith(
      '-shacharit',
    ) ||
    displayedTefila.title
      .toLowerCase()
      .includes('shacharit')

  const hideStandardShacharitInAdmin =
    showAdminControls &&
    isStandardShacharit &&
    (
      daySettings?.dayType === 'holiday' ||
      daySettings?.dayType === 'shabbat' ||
      daySettings?.dayType === 'shabbatHoliday'
    )

  if (hideStandardShacharitInAdmin) {
    return null
  }

  return (
    <>
      <MinyanCard
      tefila={{
        ...displayedTefila,
        kind: effectiveHolidayKind,
        allowRegistration:
          registrationAllowed,
      }}
      registered={registered}
      attendance={attendance}
      registrations={registrations}
      currentGuestCount={
        currentRegistration?.guestCount ?? 0
      }
      currentGuestComment={
        currentRegistration?.guestComment
      }
      loading={loading}
      cancelled={
        record?.status === 'cancelled'
      }
      completed={
        record?.status === 'completed'
      }
      minyanResult={record?.minyanResult}
      actualAttendance={
        record?.actualAttendance
      }
      canManage={canManage}
      canRegister={canRegisterForMinyan}
      extraInfo={displayedExtraInfo}
      holidayLabel={
        holidayLabel ??
        calculatedHolidayLabel ??
        minorDayLabel
      }
      sermon={
        tefila.title
          .toLowerCase()
          .includes('shacharit') ||
        tefila.kind === 'erevHoliday'
          ? daySettings?.sermon
          : undefined
      }
      comment={
        daySettings?.comment
      }
      moreInformation={
        daySettings?.moreInformation
      }
      onRegister={register}
      onUnregister={unregister}
      onCancel={cancelTefila}
      onReactivate={reactivateTefila}
      onConfirm={saveMinyanResult}
    />

      {canManage &&
        registrationAllowed &&
        record?.status !== 'cancelled' &&
        peopleNeeded > 0 && (
          <div className="mt-2 rounded-2xl bg-amber-50 p-3 ring-1 ring-amber-100">
            <button
              type="button"
              disabled={sendingMinyanPush}
              onClick={() => {
                void sendMinyanPush()
              }}
              className="w-full rounded-xl bg-amber-700 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
            >
              {sendingMinyanPush
                ? 'Skickar…'
                : peopleNeeded === 1
                  ? 'Skicka push – en till behövs'
                  : `Skicka push – ${peopleNeeded} till behövs`}
            </button>

            {minyanPushMessage && (
              <p className="mt-2 text-center text-xs font-semibold text-amber-900">
                {minyanPushMessage}
              </p>
            )}
          </div>
        )}
    </>
  )
}

export default LiveMinyanCard
