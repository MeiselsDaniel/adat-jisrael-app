import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '../firebase/config'

export type NewsStatus =
  | 'draft'
  | 'published'

export type NewsCategory =
  | 'news'
  | 'fundraiser'

export type NewsPost = {
  id: string
  title: string
  excerpt: string
  content: string
  imageUrl?: string | null
  isPinned: boolean
  status: NewsStatus
category?: NewsCategory
  authorId: string
  authorName?: string | null
  publishedAt?: unknown
  createdAt?: unknown
  updatedAt?: unknown
}

export type CreateNewsPostInput = {
  title: string
  excerpt: string
  content: string
  imageUrl?: string
  isPinned?: boolean
  status: NewsStatus
category?: NewsCategory
  authorId: string
  authorName?: string
}

export type UpdateNewsPostInput = {
  title?: string
  excerpt?: string
  content?: string
  imageUrl?: string | null
  isPinned?: boolean
  status?: NewsStatus
category?: NewsCategory
}

export async function createNewsPost(
  input: CreateNewsPostInput,
): Promise<string> {
  const reference =
    await addDoc(
      collection(db, 'news'),
      {
        title: input.title.trim(),
        excerpt: input.excerpt.trim(),
        content: input.content.trim(),
        imageUrl:
          input.imageUrl?.trim() ||
          null,
        isPinned:
          input.isPinned ?? false,
        status: input.status,
category: input.category ?? 'news',
        authorId: input.authorId,
        authorName:
          input.authorName?.trim() ||
          null,

        publishedAt:
          input.status === 'published'
            ? serverTimestamp()
            : null,

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp(),
      },
    )

  return reference.id
}

export async function updateNewsPost(
  id: string,
  input: UpdateNewsPostInput,
): Promise<void> {
  const updateData: Record<
    string,
    unknown
  > = {
    updatedAt: serverTimestamp(),
  }

  if (input.category !== undefined) {
updateData.category =
input.category
}

if (input.title !== undefined) {
    updateData.title =
      input.title.trim()
  }

  if (input.excerpt !== undefined) {
    updateData.excerpt =
      input.excerpt.trim()
  }

  if (input.content !== undefined) {
    updateData.content =
      input.content.trim()
  }

  if (input.imageUrl !== undefined) {
    updateData.imageUrl =
      input.imageUrl?.trim() ||
      null
  }

  if (input.isPinned !== undefined) {
    updateData.isPinned =
      input.isPinned
  }

  if (input.status !== undefined) {
    updateData.status =
      input.status

    if (
      input.status ===
        'published'
    ) {
      updateData.publishedAt =
        serverTimestamp()
    }
  }

  await updateDoc(
    doc(db, 'news', id),
    updateData,
  )
}

export async function deleteNewsPost(
  id: string,
): Promise<void> {
  await deleteDoc(
    doc(db, 'news', id),
  )
}

export function subscribeToNews(
  callback: (
    posts: NewsPost[],
  ) => void,
  onError?: (
    error: Error,
  ) => void,
): Unsubscribe {
  const newsQuery =
    query(
      collection(db, 'news'),
      orderBy(
        'createdAt',
        'desc',
      ),
    )

  return onSnapshot(
    newsQuery,
    (snapshot) => {
      callback(
        snapshot.docs.map(
          (document) => ({
            id: document.id,
            ...(document.data() as Omit<
              NewsPost,
              'id'
            >),
          }),
        ),
      )
    },
    (error) => {
      console.error(
        'Kunde inte läsa nyheter:',
        error,
      )

      onError?.(error)
    },
  )
}

export function subscribeToPublishedNews(
  callback: (
    posts: NewsPost[],
  ) => void,
  onError?: (
    error: Error,
  ) => void,
): Unsubscribe {
  return subscribeToNews(
    (posts) => {
      const published =
        posts
          .filter(
            (post) =>
              post.status ===
              'published',
          )
          .sort(
            (
              first,
              second,
            ) => {
              if (
                first.isPinned !==
                second.isPinned
              ) {
                return first.isPinned
                  ? -1
                  : 1
              }

              return 0
            },
          )

      callback(published)
    },
    onError,
  )
}
