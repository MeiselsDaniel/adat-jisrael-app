import {
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import {
  isSupported,
  onRegistered,
  register,
} from 'firebase/messaging'
import {
  db,
  messaging,
} from '../firebase/config'

export const VAPID_KEY =
  'BIDKHBK90dA0Kjr980kvLFTnExsIHR_07gRsQJwxAeO62F8Pl7cu3DLwJNC7tPENBGBDDgWAXGoCERnbaYzlxxg'


export type PushRegistration = {
  installationId: string
  userId: string
  enabled: boolean
  userAgent: string
  createdAt?: unknown
  updatedAt?: unknown
}

export async function enablePushNotifications(
  userId: string,
): Promise<void> {
  if (
    !('Notification' in window) ||
    !('serviceWorker' in navigator)
  ) {
    throw new Error(
      'Den här webbläsaren stöder inte pushnotiser.',
    )
  }

  const supported =
    await isSupported()

  if (!supported) {
    throw new Error(
      'Pushnotiser stöds inte på den här enheten.',
    )
  }

  const permission =
    await Notification.requestPermission()

  if (permission !== 'granted') {
    throw new Error(
      permission === 'denied'
        ? 'Notiser är blockerade i webbläsaren.'
        : 'Tillåtelse till notiser gavs inte.',
    )
  }

  await navigator.serviceWorker.register(
    '/firebase-messaging-sw.js',
  )

  await navigator.serviceWorker.ready

  await new Promise<void>(
    (resolve, reject) => {
      let finished = false

      const timeoutId =
        window.setTimeout(
          () => {
            if (finished) {
              return
            }

            finished = true

            reject(
              new Error(
                'Firebase registrerade enheten, men något gick fel när registreringen skulle sparas.',
              ),
            )
          },
          15000,
        )

      onRegistered(
        messaging,
        (installationId) => {
          if (finished) {
            return
          }

          void savePushRegistration(
            userId,
            installationId,
          )
            .then(() => {
              finished = true

              window.clearTimeout(
                timeoutId,
              )

              resolve()
            })
            .catch((error) => {
              finished = true

              window.clearTimeout(
                timeoutId,
              )

              reject(error)
            })
        },
      )

      void register(
        messaging,
        {
          vapidKey: VAPID_KEY,
        },
      ).catch((error) => {
        if (finished) {
          return
        }

        finished = true

        window.clearTimeout(
          timeoutId,
        )

        reject(error)
      })
    },
  )
}

export async function savePushRegistration(
  userId: string,
  installationId: string,
): Promise<void> {
  const registrationId =
    `${userId}__${installationId}`

  await setDoc(
    doc(
      db,
      'pushRegistrations',
      registrationId,
    ),
    {
      installationId,
      userId,
      enabled: true,
      userAgent:
        navigator.userAgent,
      createdAt:
        serverTimestamp(),
      updatedAt:
        serverTimestamp(),
    },
    {
      merge: true,
    },
  )
}

export async function removePushRegistration(
  userId: string,
  installationId: string,
): Promise<void> {
  await deleteDoc(
    doc(
      db,
      'pushRegistrations',
      `${userId}__${installationId}`,
    ),
  )
}

export function getNotificationPermission():
  NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) {
    return 'unsupported'
  }

  return Notification.permission
}
