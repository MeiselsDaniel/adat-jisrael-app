import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore'
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from 'firebase/storage'
import {
  db,
  storage,
} from '../firebase/config'

export type MemberDocument = {
  id: string
  title: string
  fileName: string
  fileUrl: string
  storagePath: string
  createdAt: Timestamp | null
}

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

export function subscribeToDocuments(
  onDocuments: (
    documents: MemberDocument[],
  ) => void,
  onError?: (error: Error) => void,
) {
  const documentsQuery = query(
    collection(db, 'documents'),
    orderBy('createdAt', 'desc'),
  )

  return onSnapshot(
    documentsQuery,
    (snapshot) => {
      const documents =
        snapshot.docs.map(
          (documentSnapshot) => {
            const data =
              documentSnapshot.data()

            return {
              id: documentSnapshot.id,
              title:
                typeof data.title ===
                'string'
                  ? data.title
                  : '',
              fileName:
                typeof data.fileName ===
                'string'
                  ? data.fileName
                  : '',
              fileUrl:
                typeof data.fileUrl ===
                'string'
                  ? data.fileUrl
                  : '',
              storagePath:
                typeof data.storagePath ===
                'string'
                  ? data.storagePath
                  : '',
              createdAt:
                data.createdAt ?? null,
            } satisfies MemberDocument
          },
        )

      onDocuments(documents)
    },
    (caughtError) => {
      console.error(
        'Kunde inte hämta dokument:',
        caughtError,
      )

      if (onError) {
        onError(
          caughtError instanceof Error
            ? caughtError
            : new Error(
                'Dokumenten kunde inte hämtas.',
              ),
        )
      }
    },
  )
}

export async function uploadDocument(
  file: File,
  title: string,
): Promise<void> {
  const cleanTitle = title.trim()

  if (!cleanTitle) {
    throw new Error(
      'Ange en titel för dokumentet.',
    )
  }

  const isPdf =
    file.type === 'application/pdf' ||
    file.name
      .toLowerCase()
      .endsWith('.pdf')

  if (!isPdf) {
    throw new Error(
      'Filen måste vara en PDF.',
    )
  }

  const maxSize =
    10 * 1024 * 1024

  if (file.size > maxSize) {
    throw new Error(
      'PDF-filen får vara högst 10 MB.',
    )
  }

  const safeName =
    sanitizeFileName(
      file.name || 'document.pdf',
    )

  const storagePath =
    `documents/${Date.now()}-${safeName}`

  const storageRef =
    ref(
      storage,
      storagePath,
    )

  await uploadBytes(
    storageRef,
    file,
    {
      contentType:
        'application/pdf',
    },
  )

  const fileUrl =
    await getDownloadURL(
      storageRef,
    )

  try {
    await addDoc(
      collection(db, 'documents'),
      {
        title: cleanTitle,
        fileName: file.name,
        fileUrl,
        storagePath,
        createdAt:
          serverTimestamp(),
      },
    )
  } catch (error) {
    try {
      await deleteObject(
        storageRef,
      )
    } catch {
      // Om städningen misslyckas
      // behåller vi ursprungsfelet.
    }

    throw error
  }
}

export async function deleteDocument(
  document: MemberDocument,
): Promise<void> {
  if (document.storagePath) {
    const storageRef =
      ref(
        storage,
        document.storagePath,
      )

    await deleteObject(
      storageRef,
    )
  }

  await deleteDoc(
    doc(
      db,
      'documents',
      document.id,
    ),
  )
}