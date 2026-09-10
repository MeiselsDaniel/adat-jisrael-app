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

  const currentRegistration =
    registrations.find(
      (item) =>
        item.userId === currentUserId,
    )

  async function register() {
    if (!currentUserId || !currentUserName) return

    await saveRegistration({
      tefilaId,
      userId: currentUserId,
      userName: currentUserName,
      attending: true,
      guestCount:
        currentRegistration?.guestCount ?? 0,
      guestNames:
        currentRegistration?.guestNames,
      guestComment:
        currentRegistration?.guestComment,
    })
  }

  async function unregister() {
    if (!currentUserId || !currentUserName) return

    const guestNames =
      currentRegistration?.guestNames ?? []

    const guestCount =
      guestNames.length > 0
        ? guestNames.length
        : currentRegistration?.guestCount ?? 0

    if (guestCount === 0) {
      await removeRegistration(
        tefilaId,
        currentUserId,
      )
      return
    }

    await saveRegistration({
      tefilaId,
      userId: currentUserId,
      userName: currentUserName,
      attending: false,
      guestCount,
      guestNames:
        guestNames.length > 0
          ? guestNames
          : undefined,
      guestComment:
        currentRegistration?.guestComment,
    })
  }

  async function saveGuests(
    guestNames: string[],
  ) {
    if (!currentUserId || !currentUserName) return

    const normalizedGuestNames =
      guestNames
        .map((name) => name.trim())
        .filter(Boolean)
        .slice(0, 50)

    const attending =
      currentRegistration?.attending === true

    if (
      normalizedGuestNames.length === 0 &&
      !attending
    ) {
      await removeRegistration(
        tefilaId,
        currentUserId,
      )
      return
    }

    await saveRegistration({
      tefilaId,
      userId: currentUserId,
      userName: currentUserName,
      attending,
      guestNames: normalizedGuestNames,
      guestCount: normalizedGuestNames.length,
    })
  }

  return {
    loading,
    registrations,
    attendance:
      calculateAttendance(registrations),
    registered:
      currentRegistration?.attending === true,
    currentRegistration,
    register,
    unregister,
    saveGuests,
  }
}