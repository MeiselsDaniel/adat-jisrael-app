import {
  getDownloadURL,
  ref,
  uploadBytes,
} from 'firebase/storage'
import { storage } from '../firebase/config'

function sanitizeFileName(
  value: string,
): string {
  return value
    .toLowerCase()
    .replace(
      /[^a-z0-9._-]+/g,
      '-',
    )
    .replace(
      /^-+|-+$/g,
      '',
    )
}

export async function uploadEventImage(
  file: File,
  eventId: string,
): Promise<string> {
  if (
    !file.type.startsWith(
      'image/',
    )
  ) {
    throw new Error(
      'Filen måste vara en bild.',
    )
  }

  const maxSize =
    8 * 1024 * 1024

  if (file.size > maxSize) {
    throw new Error(
      'Bilden får vara högst 8 MB.',
    )
  }

  const safeName =
    sanitizeFileName(
      file.name || 'event-image',
    )

  const storageRef =
    ref(
      storage,
      `event-images/${eventId}/${Date.now()}-${safeName}`,
    )

  await uploadBytes(
    storageRef,
    file,
    {
      contentType:
        file.type,
    },
  )

  return getDownloadURL(
    storageRef,
  )
}
