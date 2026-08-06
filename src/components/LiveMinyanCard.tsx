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

type LiveMinyanCardProps = {
  tefila: Tefila
  showAdminControls?: boolean
}

function LiveMinyanCard({
  tefila,
  showAdminControls = false,
}: LiveMinyanCardProps) {
  const { firebaseUser, profile } = useAuth()

  const tefilaId =
    tefila.firestoreId ??
    `tefila-${tefila.id}`

  const [record, setRecord] =
    useState<TefilaRecord | null>(null)

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

  return (
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
      onRegister={register}
      onUnregister={unregister}
      onCancel={cancelTefila}
      onReactivate={reactivateTefila}
      onConfirm={saveMinyanResult}
    />
  )
}

export default LiveMinyanCard
