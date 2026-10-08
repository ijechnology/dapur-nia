import { UserProfile, UserRole } from '../types'
import {
  findPelangganByEmailOrUid,
  findPelangganByName,
  upsertPelangganForUser
} from './pelangganService'

const LOCAL_USERS_KEY = 'dapur_nia_local_users'
const EMAIL_PROFILE_PREFIX = 'dapur_nia_profile_email_'

export function getLocalProfileByEmail(email: string): UserProfile | null {
  try {
    const clean = email.toLowerCase().trim()
    const raw = localStorage.getItem(`${EMAIL_PROFILE_PREFIX}${clean}`)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error(e)
  }
  return null
}

export function saveLocalProfileByEmail(email: string, profile: UserProfile) {
  try {
    const clean = email.toLowerCase().trim()
    localStorage.setItem(`${EMAIL_PROFILE_PREFIX}${clean}`, JSON.stringify(profile))
  } catch (e) {
    console.error(e)
  }
}

function getLocalUsers(): Record<string, UserProfile> {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error(e)
  }
  return {
    'owner-dina': {
      uid: 'owner-dina',
      email: 'pemilik@dapurnia.com',
      nama: 'Dina (Pemilik)',
      peran: 'pemilik',
      no_whatsapp: '081234567890',
    },
    'staff-rani': {
      uid: 'staff-rani',
      email: 'staf@dapurnia.com',
      nama: 'Rani (Staf Dapur)',
      peran: 'staf',
      no_whatsapp: '082345678901',
    },
  }
}

function saveLocalUsers(users: Record<string, UserProfile>) {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users))
  } catch (e) {
    console.error(e)
  }
}

export async function getUserProfile(
  uid: string,
  email?: string | null,
  displayName?: string | null
): Promise<UserProfile | null> {
  const cleanEmail = email?.toLowerCase().trim()

  // 1. Cek peran pemilik atau staf berdasarkan email resmi Dapur Nia
  if (cleanEmail) {
    if (cleanEmail.includes('pemilik') || cleanEmail.includes('dina')) {
      return {
        uid,
        email: cleanEmail,
        nama: 'Dina (Pemilik)',
        peran: 'pemilik',
        no_whatsapp: '081234567890',
      }
    }
    if (cleanEmail.includes('staf') || cleanEmail.includes('rani')) {
      return {
        uid,
        email: cleanEmail,
        nama: 'Rani (Staf Dapur)',
        peran: 'staf',
        no_whatsapp: '082345678901',
      }
    }
  }

  // 2. Prioritas UTAMA: Cari dari koleksi 'pelanggan' di Firestore
  try {
    const matchedPelanggan =
      (await findPelangganByEmailOrUid(cleanEmail, uid)) ||
      (await findPelangganByName(displayName))
    if (matchedPelanggan) {
      const userProfile: UserProfile = {
        uid,
        email: matchedPelanggan.email || cleanEmail || '',
        nama: matchedPelanggan.nama,
        peran: 'pelanggan',
        no_whatsapp: matchedPelanggan.no_whatsapp || matchedPelanggan.id,
        alamat: matchedPelanggan.alamat,
        dibuat_pada: matchedPelanggan.dibuat_pada,
      }
      if (cleanEmail) {
        saveLocalProfileByEmail(cleanEmail, userProfile)
      }
      return userProfile
    }
  } catch (e) {
    console.warn('Pencarian data pelanggan di Firestore:', e)
  }

  // 3. Cek cache persisten per-email (zero-delay)
  if (cleanEmail) {
    const cachedByEmail = getLocalProfileByEmail(cleanEmail)
    if (cachedByEmail && cachedByEmail.nama) {
      return cachedByEmail
    }
  }

  // 5. Cek cache lokal umum
  const local = getLocalUsers()
  if (local[uid]) return local[uid]
  if (cleanEmail) {
    const byEmail = Object.values(local).find((u) => u.email === cleanEmail)
    if (byEmail) return byEmail
  }

  // 6. Jika displayName tersedia dari Firebase Auth dan bukan awalan email
  if (displayName && !displayName.includes('@') && cleanEmail) {
    const fallbackProfile: UserProfile = {
      uid,
      email: cleanEmail,
      nama: displayName,
      peran: 'pelanggan',
    }
    saveLocalProfileByEmail(cleanEmail, fallbackProfile)
    return fallbackProfile
  }

  return null
}

export async function saveUserProfile(
  uid: string,
  profile: {
    email: string
    nama: string
    peran: UserRole
    no_whatsapp?: string
    alamat?: string
  }
): Promise<UserProfile> {
  const cleanEmail = profile.email.toLowerCase().trim()
  const cleanNama = profile.nama.trim()
  const cleanAlamat = profile.alamat?.trim() || ''
  const cleanWA = profile.no_whatsapp?.trim() || ''

  const dataToSave: UserProfile = {
    uid,
    email: cleanEmail,
    nama: cleanNama,
    peran: profile.peran,
    no_whatsapp: cleanWA,
    alamat: cleanAlamat,
    dibuat_pada: new Date().toISOString(),
  }

  // 1. Simpan ke cache per-email & local mock
  saveLocalProfileByEmail(cleanEmail, dataToSave)
  const local = getLocalUsers()
  local[uid] = dataToSave
  saveLocalUsers(local)

  // 2. Sinkronkan dokumen ke koleksi resmi 'pelanggan' di Firestore
  if (profile.peran === 'pelanggan') {
    try {
      await upsertPelangganForUser({
        nama: cleanNama,
        email: cleanEmail,
        uid,
        no_whatsapp: cleanWA,
        alamat: cleanAlamat,
      })
    } catch (e) {
      console.warn('Sinkronisasi dokumen pelanggan:', e)
    }
  }

  return dataToSave
}

