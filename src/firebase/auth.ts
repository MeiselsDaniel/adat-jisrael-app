import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { auth } from './config'

export async function registerUser(
  email: string,
  password: string,
) {
  return createUserWithEmailAndPassword(
    auth,
    email,
    password,
  )
}

export async function loginUser(
  email: string,
  password: string,
) {
  return signInWithEmailAndPassword(
    auth,
    email,
    password,
  )
}

export async function logoutUser() {
  return signOut(auth)
}