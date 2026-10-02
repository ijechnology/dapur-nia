import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp
} from 'firebase/firestore'
import { getFirebaseDb } from '../lib/firebase'
import { Pelanggan } from '../types'
import { normalizeWhatsApp, isValidWhatsApp } from '../lib/validation'

const COLLECTION_NAME = 'pelanggan'
const LOCAL_MOCK_PELANGGAN = 'dapur_nia_local_mock_pelanggan'

function getLocalPelanggan(): Pelanggan[] {
  try {
    const raw = localStorage.getItem(LOCAL_MOCK_PELANGGAN)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error(e)
  }
  const defaults: Pelanggan[] = [
    {
      id: 'cust-1',
      nama: 'Ibu Ratna',
      nomorWhatsapp: '081234567890',
      alamat: 'Jl. Melati No. 12, RT 02/05, Kebayoran Baru',
      catatan: 'Pagar warna hitam, antar sebelum jam 11:30',
    },
    {
      id: 'cust-2',
      nama: 'Pak Hendra (Kantor Pajak)',
      nomorWhatsapp: '085712345678',
      alamat: 'Gedung KPP Lt. 3, Jl. Sudirman',
      catatan: 'Titip di pos sekuriti',
    },
  ]
  localStorage.setItem(LOCAL_MOCK_PELANGGAN, JSON.stringify(defaults))
  return defaults
}

function saveLocalPelanggan(list: Pelanggan[]) {
  localStorage.setItem(LOCAL_MOCK_PELANGGAN, JSON.stringify(list))
}

export function subscribePelanggan(callback: (list: Pelanggan[]) => void): () => void {
  const db = getFirebaseDb()
  if (!db) {
    callback(getLocalPelanggan())
    const interval = setInterval(() => callback(getLocalPelanggan()), 1000)
    return () => clearInterval(interval)
  }

  const q = query(collection(db, COLLECTION_NAME), orderBy('nama', 'asc'))
  return onSnapshot(q, (snapshot) => {
    const list: Pelanggan[] = []
    snapshot.forEach((d) => {
      const data = d.data()
      list.push({
        id: d.id,
        nama: data.nama,
        nomorWhatsapp: data.nomorWhatsapp,
        alamat: data.alamat,
        catatan: data.catatan || '',
      })
    })
    callback(list)
  }, (err) => {
    console.error('Error subscribe pelanggan:', err)
    callback(getLocalPelanggan())
  })
}

/**
 * Cek duplikasi nomor WhatsApp pada koleksi pelanggan
 */
export async function checkWhatsAppUnique(phone: string, excludeId?: string): Promise<boolean> {
  const normalized = normalizeWhatsApp(phone)
  const db = getFirebaseDb()

  if (!db) {
    const local = getLocalPelanggan()
    const duplicate = local.find(
      (p) => normalizeWhatsApp(p.nomorWhatsapp) === normalized && p.id !== excludeId
    )
    return !duplicate
  }

  const q = query(collection(db, COLLECTION_NAME), where('nomorWhatsapp', '==', normalized))
  const snapshot = await getDocs(q)
  if (snapshot.empty) return true

  // Jika ada doc yang ditemukan, periksa apakah itu doc yang sedang diedit
  let isUnique = true
  snapshot.forEach((d) => {
    if (d.id !== excludeId) {
      isUnique = false
    }
  })
  return isUnique
}

export async function createPelanggan(payload: Omit<Pelanggan, 'id'>): Promise<string> {
  if (!payload.nama || payload.nama.trim().length < 2) {
    throw new Error('Nama pelanggan wajib diisi minimal 2 karakter')
  }
  if (!payload.alamat || payload.alamat.trim().length < 5) {
    throw new Error('Alamat pengiriman wajib diisi dengan jelas')
  }

  const normalizedWA = normalizeWhatsApp(payload.nomorWhatsapp)
  if (!isValidWhatsApp(normalizedWA)) {
    throw new Error('Nomor WhatsApp tidak valid (contoh: 081234567890)')
  }

  const isUnique = await checkWhatsAppUnique(normalizedWA)
  if (!isUnique) {
    throw new Error(`Nomor WhatsApp (${normalizedWA}) sudah terdaftar pada pelanggan lain!`)
  }

  const db = getFirebaseDb()
  const dataToSave = {
    nama: payload.nama.trim(),
    nomorWhatsapp: normalizedWA,
    alamat: payload.alamat.trim(),
    catatan: payload.catatan?.trim() || '',
    createdAt: serverTimestamp(),
  }

  if (!db) {
    const local = getLocalPelanggan()
    const newCust: Pelanggan = {
      ...dataToSave,
      id: 'cust-' + Date.now(),
    }
    local.push(newCust)
    saveLocalPelanggan(local)
    return newCust.id
  }

  const docRef = await addDoc(collection(db, COLLECTION_NAME), dataToSave)
  return docRef.id
}

export async function updatePelanggan(id: string, updates: Partial<Pelanggan>): Promise<void> {
  if (updates.nama !== undefined && updates.nama.trim().length < 2) {
    throw new Error('Nama pelanggan tidak boleh kosong')
  }
  if (updates.alamat !== undefined && updates.alamat.trim().length < 5) {
    throw new Error('Alamat pengiriman tidak boleh kosong')
  }

  let normalizedWA: string | undefined = undefined
  if (updates.nomorWhatsapp) {
    normalizedWA = normalizeWhatsApp(updates.nomorWhatsapp)
    if (!isValidWhatsApp(normalizedWA)) {
      throw new Error('Nomor WhatsApp tidak valid')
    }
    const isUnique = await checkWhatsAppUnique(normalizedWA, id)
    if (!isUnique) {
      throw new Error(`Nomor WhatsApp (${normalizedWA}) sudah digunakan oleh pelanggan lain!`)
    }
  }

  const db = getFirebaseDb()
  if (!db) {
    const local = getLocalPelanggan()
    const idx = local.findIndex((p) => p.id === id)
    if (idx !== -1) {
      local[idx] = {
        ...local[idx],
        ...updates,
        nomorWhatsapp: normalizedWA || local[idx].nomorWhatsapp,
      }
      saveLocalPelanggan(local)
    }
    return
  }

  const cleanUpdates: any = { ...updates }
  if (normalizedWA) {
    cleanUpdates.nomorWhatsapp = normalizedWA
  }

  await updateDoc(doc(db, COLLECTION_NAME, id), cleanUpdates)
}

export async function deletePelanggan(id: string): Promise<void> {
  const db = getFirebaseDb()
  if (!db) {
    const local = getLocalPelanggan()
    saveLocalPelanggan(local.filter((p) => p.id !== id))
    return
  }

  await deleteDoc(doc(db, COLLECTION_NAME, id))
}
