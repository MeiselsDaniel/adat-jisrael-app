import { getApp } from 'firebase/app'
import {
  getFunctions,
  httpsCallable,
} from 'firebase/functions'

export type SendNewsPushInput = {
  title: string
  body: string
}

export type SendPushResult = {
  recipients: number
  successCount: number
  failureCount: number
}

const functions = getFunctions(
  getApp(),
  'europe-west1',
)

export async function sendNewsPushNotification(
  input: SendNewsPushInput,
): Promise<SendPushResult> {
  const sendNewsPush = httpsCallable<
    SendNewsPushInput,
    SendPushResult
  >(functions, 'sendNewsPush')

  const response = await sendNewsPush(input)

  return response.data
}

export type SendEventPushInput = {
  eventId: string
  title: string
  body: string
}

export async function sendEventPushNotification(
  input: SendEventPushInput,
): Promise<SendPushResult> {
  const sendEventPush = httpsCallable<
    SendEventPushInput,
    SendPushResult
  >(functions, 'sendEventPush')

  const response =
    await sendEventPush(input)

  return response.data
}

