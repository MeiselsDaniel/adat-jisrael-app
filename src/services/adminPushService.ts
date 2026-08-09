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

export async function sendMinyanNeedPush(
  tefilaId: string,
): Promise<MinyanPushResult> {
  const result =
    await sendMinyanNeedPushCallable({
      tefilaId,
    })

  return result.data
}
