import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp
} from 'firebase/firestore'
import { getFirebaseDb } from '../lib/firebase'
import { Pelanggan } from '../types'
import { normalizeWhatsApp, isValidWhatsApp } from '../lib/validation'

// Sesuai Skema-Firestore-Dapur-Nia: Koleksi huruf kecil tunggal 'pelanggan'
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
      id: '08123456789',
      nama: 'Budi Santoso',
      no_whatsapp: '08123456789',
      nomorWhatsapp: '08123456789',
      alamat: 'Jl. Mawar No. 12, Bandung',
    },
    {
      id: '08234567890',
      nama: 'Siti Rahayu',
      no_whatsapp: '08234567890',
      nomorWhatsapp: '08234567890',
      alamat: 'Jl. Melati No. 5, Bandung',
    },
    {
      id: '083456789012',
      nama: 'Rasya Andrean',
      no_whatsapp: '083456789012',
      nomorWhatsapp: '083456789012',
      alamat: 'Jl. Merdeka No. 45, Bandung',
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
      const wa = data.no_whatsapp || data.nomorWhatsapp || d.id
      list.push({
        id: d.id, // ID dokumen adalah nomor WhatsApp
        nama: data.nama || '',
        no_whatsapp: wa,
        nomorWhatsapp: wa,
        alamat: data.alamat || '',
        catatan: data.catatan || '',
        dibuat_pada: data.dibuat_pada,
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
      (p) => normalizeWhatsApp(p.no_whatsapp || p.nomorWhatsapp || p.id) === normalized && p.id !== excludeId
    )
    return !duplicate
  }

  // Karena ID dokumen adalah nomor WhatsApp langsung, kita cukup getDoc
  if (normalized === excludeId) return true

  const docRef = doc(db, COLLECTION_NAME, normalized)
  const docSnap = await getDoc(docRef)
  return !docSnap.exists()
}

export async function createPelanggan(payload: {
  nama: string
  no_whatsapp?: string
  nomorWhatsapp?: string
  alamat: string
  catatan?: string
  email?: string
  uid?: string
}): Promise<string> {
  if (!payload.nama || payload.nama.trim().length < 1 || payload.nama.trim().length > 60) {
    throw new Error('Nama pelanggan wajib diisi (1 sampai 60 karakter)')
  }
  if (!payload.alamat || payload.alamat.trim().length < 1 || payload.alamat.trim().length > 200) {
    throw new Error('Alamat pengiriman wajib diisi (1 sampai 200 karakter)')
  }

  const rawWA = payload.no_whatsapp || payload.nomorWhatsapp || ''
  const normalizedWA = normalizeWhatsApp(rawWA)
  if (!isValidWhatsApp(normalizedWA)) {
    throw new Error('Nomor WhatsApp harus diawali 08 dan memiliki total 10 sampai 13 angka')
  }

  const isUnique = await checkWhatsAppUnique(normalizedWA)
  if (!isUnique) {
    throw new Error(`Nomor WhatsApp (${normalizedWA}) sudah terdaftar pada pelanggan lain!`)
  }

  // Sesuai Skema: nama, no_whatsapp, alamat, dibuat_pada + relasi email & uid
  const dataToSave: any = {
    nama: payload.nama.trim(),
    no_whatsapp: normalizedWA,
    alamat: payload.alamat.trim(),
    dibuat_pada: serverTimestamp(),
  }
  if (payload.email) dataToSave.email = payload.email.toLowerCase().trim()
  if (payload.uid) dataToSave.uid = payload.uid

  const db = getFirebaseDb()
  if (!db) {
    const local = getLocalPelanggan()
    const newCust: Pelanggan = {
      ...dataToSave,
      id: normalizedWA,
      nomorWhatsapp: normalizedWA,
    }
    local.push(newCust)
    saveLocalPelanggan(local)
    return normalizedWA
  }

  // ID dokumen = nomor WhatsApp
  await setDoc(doc(db, COLLECTION_NAME, normalizedWA), dataToSave)
  return normalizedWA
}

export async function updatePelanggan(
  id: string,
  updates: Partial<Pelanggan>
): Promise<void> {
  if (updates.nama !== undefined && (updates.nama.trim().length < 1 || updates.nama.trim().length > 60)) {
    throw new Error('Nama pelanggan wajib diisi (1 sampai 60 karakter)')
  }
  if (updates.alamat !== undefined && (updates.alamat.trim().length < 1 || updates.alamat.trim().length > 200)) {
    throw new Error('Alamat pengiriman wajib diisi (1 sampai 200 karakter)')
  }

  const targetWA = updates.no_whatsapp || updates.nomorWhatsapp
  let normalizedWA: string | undefined = undefined

  if (targetWA) {
    normalizedWA = normalizeWhatsApp(targetWA)
    if (!isValidWhatsApp(normalizedWA)) {
      throw new Error('Nomor WhatsApp harus diawali 08 dan memiliki total 10 sampai 13 angka')
    }
    if (normalizedWA !== id) {
      const isUnique = await checkWhatsAppUnique(normalizedWA, id)
      if (!isUnique) {
        throw new Error(`Nomor WhatsApp (${normalizedWA}) sudah digunakan oleh pelanggan lain!`)
      }
    }
  }

  const db = getFirebaseDb()
  if (!db) {
    const local = getLocalPelanggan()
    const idx = local.findIndex((p) => p.id === id)
    if (idx !== -1) {
      const newWA = normalizedWA || local[idx].no_whatsapp || id
      local[idx] = {
        ...local[idx],
        ...updates,
        id: newWA,
        no_whatsapp: newWA,
        nomorWhatsapp: newWA,
      }
      saveLocalPelanggan(local)
    }
    return
  }

  // Jika nomor WhatsApp berubah, buat dokumen baru dengan ID baru dan hapus dokumen lama
  if (normalizedWA && normalizedWA !== id) {
    const oldDocRef = doc(db, COLLECTION_NAME, id)
    const oldSnap = await getDoc(oldDocRef)
    const oldData = oldSnap.exists() ? oldSnap.data() : {}

    const newData: any = {
      ...oldData,
      nama: updates.nama !== undefined ? updates.nama.trim() : oldData.nama,
      no_whatsapp: normalizedWA,
      alamat: updates.alamat !== undefined ? updates.alamat.trim() : oldData.alamat,
      dibuat_pada: oldData.dibuat_pada || serverTimestamp(),
    }
    if (updates.email) newData.email = updates.email.toLowerCase().trim()
    if (updates.uid) newData.uid = updates.uid

    await setDoc(doc(db, COLLECTION_NAME, normalizedWA), newData)
    await deleteDoc(oldDocRef)
  } else {
    const docRef = doc(db, COLLECTION_NAME, id)
    const cleanUpdates: any = {}
    if (updates.nama !== undefined) cleanUpdates.nama = updates.nama.trim()
    if (updates.alamat !== undefined) cleanUpdates.alamat = updates.alamat.trim()
    if (normalizedWA) cleanUpdates.no_whatsapp = normalizedWA
    if (updates.email) cleanUpdates.email = updates.email.toLowerCase().trim()
    if (updates.uid) cleanUpdates.uid = updates.uid

    await updateDoc(docRef, cleanUpdates)
  }
}

/**
 * Mencari data pelanggan di koleksi 'pelanggan' berdasarkan email atau UID akun autentikasi
 */
export async function findPelangganByEmailOrUid(
  email?: string | null,
  uid?: string | null
): Promise<Pelanggan | null> {
  const cleanEmail = email?.toLowerCase().trim()
  const db = getFirebaseDb()

  if (db) {
    try {
      // 1. Coba cari berdasarkan email
      if (cleanEmail) {
        const qEmail = query(collection(db, COLLECTION_NAME), where('email', '==', cleanEmail))
        const snapEmail = await getDocs(qEmail)
        if (!snapEmail.empty) {
          const docSnap = snapEmail.docs[0]
          const d = docSnap.data()
          return {
            id: docSnap.id,
            nama: d.nama || '',
            no_whatsapp: d.no_whatsapp || docSnap.id,
            nomorWhatsapp: d.no_whatsapp || docSnap.id,
            alamat: d.alamat || '',
            email: d.email,
            uid: d.uid,
            dibuat_pada: d.dibuat_pada,
          }
        }
      }

      // 2. Coba cari berdasarkan UID
      if (uid) {
        const qUid = query(collection(db, COLLECTION_NAME), where('uid', '==', uid))
        const snapUid = await getDocs(qUid)
        if (!snapUid.empty) {
          const docSnap = snapUid.docs[0]
          const d = docSnap.data()
          return {
            id: docSnap.id,
            nama: d.nama || '',
            no_whatsapp: d.no_whatsapp || docSnap.id,
            nomorWhatsapp: d.no_whatsapp || docSnap.id,
            alamat: d.alamat || '',
            email: d.email,
            uid: d.uid,
            dibuat_pada: d.dibuat_pada,
          }
        }
      }

      // 3. Fallback scan jika index belum terbuat
      const allDocs = await getDocs(collection(db, COLLECTION_NAME))
      for (const docSnap of allDocs.docs) {
        const d = docSnap.data()
        if (
          (cleanEmail && d.email?.toLowerCase().trim() === cleanEmail) ||
          (uid && d.uid === uid)
        ) {
          return {
            id: docSnap.id,
            nama: d.nama || '',
            no_whatsapp: d.no_whatsapp || docSnap.id,
            nomorWhatsapp: d.no_whatsapp || docSnap.id,
            alamat: d.alamat || '',
            email: d.email,
            uid: d.uid,
            dibuat_pada: d.dibuat_pada,
          }
        }
      }
    } catch (e) {
      console.warn('Gagal query pelanggan via Firestore:', e)
    }
  }

  // 4. Periksa cache lokal
  const local = getLocalPelanggan()
  const found = local.find(
    (p) =>
      (cleanEmail && p.email?.toLowerCase().trim() === cleanEmail) ||
      (uid && p.uid === uid)
  )
  return found || null
}

/**
 * Mencari pelanggan berdasarkan nama lengkap
 */
export async function findPelangganByName(nama?: string | null): Promise<Pelanggan | null> {
  if (!nama || !nama.trim()) return null
  const cleanNama = nama.trim().toLowerCase()
  const db = getFirebaseDb()

  if (db) {
    try {
      const allDocs = await getDocs(collection(db, COLLECTION_NAME))
      for (const docSnap of allDocs.docs) {
        const d = docSnap.data()
        if (d.nama?.trim().toLowerCase() === cleanNama) {
          return {
            id: docSnap.id,
            nama: d.nama || '',
            no_whatsapp: d.no_whatsapp || docSnap.id,
            nomorWhatsapp: d.no_whatsapp || docSnap.id,
            alamat: d.alamat || '',
            email: d.email,
            uid: d.uid,
            dibuat_pada: d.dibuat_pada,
          }
        }
      }
    } catch (e) {
      console.warn('Gagal cari pelanggan by name:', e)
    }
  }

  const local = getLocalPelanggan()
  return local.find((p) => p.nama.trim().toLowerCase() === cleanNama) || null
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

/**
 * Menyimpan / memperbarui dokumen pelanggan untuk user akun Dapur Nia secara aman
 * Menjamin nama, alamat, no whatsapp, email, dan UID tersimpan di koleksi 'pelanggan'
 */
export async function upsertPelangganForUser(params: {
  nama: string
  email: string
  uid: string
  no_whatsapp?: string
  alamat?: string
}): Promise<Pelanggan> {
  const cleanEmail = params.email.toLowerCase().trim()
  const cleanNama = params.nama.trim()
  const rawWA = params.no_whatsapp || ''
  const normalizedWA = rawWA ? normalizeWhatsApp(rawWA) : ''
  const cleanAlamat = params.alamat?.trim() || ''
  const db = getFirebaseDb()

  // 1. Cek apakah sudah ada dokumen pelanggan dengan email atau uid ini
  const existing =
    (await findPelangganByEmailOrUid(cleanEmail, params.uid)) ||
    (await findPelangganByName(cleanNama))

  if (existing) {
    const updateData: Partial<Pelanggan> = {
      nama: cleanNama || existing.nama,
      email: cleanEmail,
      uid: params.uid,
    }
    if (cleanAlamat) updateData.alamat = cleanAlamat
    if (normalizedWA && isValidWhatsApp(normalizedWA)) {
      updateData.no_whatsapp = normalizedWA
      updateData.nomorWhatsapp = normalizedWA
    }

    try {
      await updatePelanggan(existing.id, updateData)
    } catch (e) {
      console.warn('Gagal update pelanggan via updatePelanggan:', e)
      // Fallback update langsung ke Firestore
      if (db) {
        try {
          await setDoc(doc(db, COLLECTION_NAME, existing.id), updateData, { merge: true })
        } catch {}
      }
    }

    return {
      ...existing,
      ...updateData,
    }
  }

  // 2. Jika belum ada dokumen, tentukan ID dokumen
  // Sesuai skema Firestore: gunakan nomor WhatsApp jika valid, atau 'cust-' + uid jika belum ada no WA
  const targetDocId = (normalizedWA && isValidWhatsApp(normalizedWA))
    ? normalizedWA
    : `cust-${params.uid}`

  const dataToSave: any = {
    nama: cleanNama,
    no_whatsapp: (normalizedWA && isValidWhatsApp(normalizedWA)) ? normalizedWA : '',
    alamat: cleanAlamat || 'Alamat belum diatur',
    email: cleanEmail,
    uid: params.uid,
    dibuat_pada: serverTimestamp(),
  }

  if (db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, targetDocId)
      await setDoc(docRef, dataToSave, { merge: true })
    } catch (err) {
      console.warn('Gagal setDoc koleksi pelanggan di Firestore:', err)
    }
  }

  // Simpan ke local mock juga
  const local = getLocalPelanggan()
  const existingIdx = local.findIndex((p) => p.email === cleanEmail || p.id === targetDocId)
  const custObj: Pelanggan = {
    ...dataToSave,
    id: targetDocId,
    nomorWhatsapp: dataToSave.no_whatsapp,
    dibuat_pada: new Date().toISOString(),
  }
  if (existingIdx !== -1) {
    local[existingIdx] = { ...local[existingIdx], ...custObj }
  } else {
    local.push(custObj)
  }
  saveLocalPelanggan(local)

  return custObj
}

