import { Capacitor } from '@capacitor/core'
import { FirebaseMessaging } from '@capacitor-firebase/messaging'
import {
  doc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { db } from '../firebase/config'

export async function registerNativePush(
  userId: string,
): Promise<void> {
  if (Capacitor.getPlatform() !== 'ios') {
    return
  }

  const currentPermission =
    await FirebaseMessaging.checkPermissions()

  let permission = currentPermission.receive

  if (permission === 'prompt') {
    const requested =
      await FirebaseMessaging.requestPermissions()

    permission = requested.receive
  }

  if (permission !== 'granted') {
    throw new Error(
      'Tillåtelse för pushnotiser gavs inte.',
    )
  }

  const { token } =
    await FirebaseMessaging.getToken()

  if (!token) {
    throw new Error(
      'Kunde inte hämta FCM-token.',
    )
  }

  const registrationId =
    `${userId}__ios__${token}`

  await setDoc(
    doc(
      db,
      'pushRegistrations',
      registrationId,
    ),
    {
      installationId: token,
      userId,
      enabled: true,
      platform: 'ios',
      userAgent: navigator.userAgent,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    },
  )

  console.log(
    'iOS FCM-registrering sparad.',
  )
}


export async function listenForNativePushActions(
  onNewsOpen: (newsId: string) => void,
): Promise<() => void> {
  if (Capacitor.getPlatform() !== 'ios') {
    return () => {}
  }

  const listener =
    await FirebaseMessaging.addListener(
      'notificationActionPerformed',
      (event) => {
        const data =
          event.notification?.data as
            | {
                type?: string
                newsId?: string
              }
            | undefined

        if (
          data?.type === 'news' &&
          data.newsId
        ) {
          onNewsOpen(data.newsId)
        }
      },
    )

  return () => {
    void listener.remove()
  }
}
