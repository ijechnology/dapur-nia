import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app'
import { getFirestore, Firestore } from 'firebase/firestore'

export interface FirebaseConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket?: string
  messagingSenderId?: string
  appId: string
}

export function getEnvFirebaseConfig(): FirebaseConfig | null {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID

  if (apiKey && projectId) {
    return {
      apiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
      projectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    }
  }

  return null
}

let appInstance: FirebaseApp | null = null
let dbInstance: Firestore | null = null

export function getFirebaseDb(): Firestore | null {
  if (dbInstance) return dbInstance

  const config = getEnvFirebaseConfig()
  if (!config || !config.apiKey || !config.projectId) {
    return null
  }

  try {
    if (!getApps().length) {
      appInstance = initializeApp(config)
    } else {
      appInstance = getApp()
    }
    dbInstance = getFirestore(appInstance)
    return dbInstance
  } catch (error) {
    console.error('Gagal menginisialisasi Cloud Firestore:', error)
    return null
  }
}
