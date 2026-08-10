import {
  getFunctions,
  httpsCallable,
} from 'firebase/functions'
import { app } from '../firebase/config'

type MinyanPushResult = {
  attendance: number
  needed: number
  recipients: number
  successCount: number
  failureCount: number
}

type NewsPushResult = {
  recipients: number
  successCount: number
  failureCount: number
}

const functions =
  getFunctions(
    app,
    'europe-west1',
  )

const sendMinyanNeedPushCallable =
  httpsCallable<
    {
      tefilaId: string
    },
    MinyanPushResult
  >(
    functions,
    'sendMinyanNeedPush',
  )

const sendNewsPushCallable =
  httpsCallable<
    {
      newsId: string
      title?: string
      body?: string
    },
    NewsPushResult
  >(
    functions,
    'sendNewsPush',
  )

export async function sendMinyanNeedPush(
  tefilaId: string,
): Promise<MinyanPushResult> {
  const result =
    await sendMinyanNeedPushCallable({
      tefilaId,
    })

  return result.data
}


export async function sendNewsPush(
  newsId: string,
  title?: string,
  body?: string,
): Promise<NewsPushResult> {
  const result =
    await sendNewsPushCallable({
      newsId,
      title,
      body,
    })

  return result.data
}
