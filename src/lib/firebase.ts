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

const STORAGE_KEY = 'dapur_nia_firebase_config'

export function getStoredFirebaseConfig(): FirebaseConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw) as FirebaseConfig
    }
  } catch (err) {
    console.error('Gagal membaca firebase config dari storage', err)
  }

  // Fallback ke Vite env jika tersedia
  if (import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    }
  }

  return null
}

export function saveFirebaseConfig(config: FirebaseConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  // Refresh page agar singleton app ter-reinisialisasi
  window.location.reload()
}

export function clearFirebaseConfig(): void {
  localStorage.removeItem(STORAGE_KEY)
  window.location.reload()
}

let appInstance: FirebaseApp | null = null
let dbInstance: Firestore | null = null

export function getFirebaseDb(): Firestore | null {
  if (dbInstance) return dbInstance

  const config = getStoredFirebaseConfig()
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
