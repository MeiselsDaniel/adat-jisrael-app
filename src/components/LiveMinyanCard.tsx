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
import { sendMinyanNeedPush } from '../services/adminPushService'

type LiveMinyanCardProps = {
  tefila: Tefila
  showAdminControls?: boolean
  extraInfo?: {
    label: string
    value: string
  }
}

function LiveMinyanCard({
  tefila,
  showAdminControls = false,
  extraInfo,
}: LiveMinyanCardProps) {
  const { firebaseUser, profile } = useAuth()

  const tefilaId =
    tefila.firestoreId ??
    `tefila-${tefila.id}`

  const [record, setRecord] =
    useState<TefilaRecord | null>(null)

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

  const canRegisterForMinyan =
    profile?.role === 'admin' ||
    profile?.countsForMinyan === true

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

      setMinyanPushMessage(
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

  return (
    <>
      <MinyanCard
      tefila={displayedTefila}
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
      extraInfo={extraInfo}
      onRegister={register}
      onUnregister={unregister}
      onCancel={cancelTefila}
      onReactivate={reactivateTefila}
      onConfirm={saveMinyanResult}
    />

      {canManage &&
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
