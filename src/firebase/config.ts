import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyD-_RMtvr4Fxgwu46B2A9TNj4JHSWDOdVA',
  authDomain: 'adat-jisrael-app.firebaseapp.com',
  projectId: 'adat-jisrael-app',
  storageBucket: 'adat-jisrael-app.firebasestorage.app',
  messagingSenderId: '991999629869',
  appId: '1:991999629869:web:6c9254b9083063d69876a4',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)