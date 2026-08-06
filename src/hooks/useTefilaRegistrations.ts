import { useEffect, useState } from 'react'
import {
  calculateAttendance,
  getRegistrations,
  saveRegistration,
  removeRegistration,
  subscribeToRegistrations,
  type TefilaRegistration,
} from '../services/tefilaService'

export function useTefilaRegistrations(
  tefilaId: string,
  currentUserId?: string,
  currentUserName?: string,
) {
  const [registrations, setRegistrations] =
    useState<TefilaRegistration[]>([])

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    let active = true

    getRegistrations(tefilaId).then((items) => {
      if (!active) return

      setRegistrations(items)
      setLoading(false)
    })

    const unsubscribe =
      subscribeToRegistrations(
        tefilaId,
        setRegistrations,
      )

    return () => {
      active = false
      unsubscribe()
    }
  }, [tefilaId])

  async function register(
    guests = 0,
    comment?: string,
  ) {
    if (!currentUserId || !currentUserName) return

    await saveRegistration({
      tefilaId,
      userId: currentUserId,
      userName: currentUserName,
      guestCount: guests,
      guestComment: comment,
    })
  }

  async function unregister() {
    if (!currentUserId) return

    await removeRegistration(
      tefilaId,
      currentUserId,
    )
  }

  const currentRegistration =
    registrations.find(
      (item) =>
        item.userId === currentUserId,
    )

  return {
    loading,
    registrations,
    attendance:
      calculateAttendance(registrations),
    registered:
      currentRegistration !== undefined,
    currentRegistration,
    register,
    unregister,
  }
}