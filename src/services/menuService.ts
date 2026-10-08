import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore'
import { getFirebaseDb } from '../lib/firebase'
import { Menu } from '../types'
import { validateMenuInput } from '../lib/validation'

// Sesuai Skema-Firestore-Dapur-Nia: Koleksi huruf kecil tunggal 'menu'
const COLLECTION_NAME = 'menu'

// Local mock storage key saat Firebase belum terhubung
const LOCAL_MOCK_MENUS = 'dapur_nia_local_mock_menu'

function getLocalMenus(): Menu[] {
  try {
    const raw = localStorage.getItem(LOCAL_MOCK_MENUS)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error(e)
  }
  // Data inisial default untuk Dapur Nia
  const defaults: Menu[] = [
    {
      id: 'menu-1',
      nama: 'Nasi Ayam Bakar',
      harga: 25000,
      sisa_porsi: 30,
      sisaPorsi: 30,
      tersedia: true,
      kategori: 'Lauk',
      deskripsi: 'Nasi ayam bakar madu sambal terasi',
    },
    {
      id: 'menu-2',
      nama: 'Mie Ayam',
      harga: 18000,
      sisa_porsi: 15,
      sisaPorsi: 15,
      tersedia: true,
      kategori: 'Lauk',
      deskripsi: 'Mie ayam jamur gurih',
    },
    {
      id: 'menu-3',
      nama: 'Nasi Goreng',
      harga: 20000,
      sisa_porsi: 20,
      sisaPorsi: 20,
      tersedia: true,
      kategori: 'Lauk',
      deskripsi: 'Nasi goreng spesial telur',
    },
    {
      id: 'menu-4',
      nama: 'Soto Ayam',
      harga: 18000,
      sisa_porsi: 0,
      sisaPorsi: 0,
      tersedia: false,
      kategori: 'Sayur',
      deskripsi: 'Soto ayam kuah bening segar',
    },
  ]
  localStorage.setItem(LOCAL_MOCK_MENUS, JSON.stringify(defaults))
  return defaults
}

function saveLocalMenus(menus: Menu[]) {
  localStorage.setItem(LOCAL_MOCK_MENUS, JSON.stringify(menus))
}

export function normalizeMenuKategori(kategori?: string | null, namaMenu?: string): string {
  const cleanKat = (kategori || '').trim()
  if (cleanKat && cleanKat.toLowerCase() !== 'umum' && cleanKat.toLowerCase() !== 'makanan utama') {
    return cleanKat
  }

  const nameLower = (namaMenu || '').toLowerCase()
  if (/es|teh|jeruk|kopi|jus|air|minum|sirup|lemon/.test(nameLower)) {
    return 'Minuman'
  }
  if (/sayur|soto|sop|lodeh|capcay|gado|kangkung|bayam|asem/.test(nameLower)) {
    return 'Sayur'
  }
  if (/paket|bento|box|lengkap|hemat/.test(nameLower)) {
    return 'Paket'
  }
  if (/sambal|kerupuk|emping|lalap|tempe mendoan|tahu goreng/.test(nameLower)) {
    return 'Sambal & Pelengkap'
  }
  return 'Lauk'
}

export function subscribeMenus(callback: (menus: Menu[]) => void): () => void {
  const db = getFirebaseDb()
  if (!db) {
    callback(getLocalMenus())
    const interval = setInterval(() => {
      callback(getLocalMenus())
    }, 1000)
    return () => clearInterval(interval)
  }

  const q = query(collection(db, COLLECTION_NAME), orderBy('nama', 'asc'))
  return onSnapshot(q, (snapshot) => {
    const menus: Menu[] = []
    snapshot.forEach((d) => {
      const data = d.data()
      const sisaPorsiRaw = Number(data.sisa_porsi ?? data.sisaPorsi ?? 0)
      const sisa_porsi = isNaN(sisaPorsiRaw) ? 0 : sisaPorsiRaw
      const hargaRaw = Number(data.harga ?? 0)
      const harga = isNaN(hargaRaw) ? 0 : hargaRaw
      const kategori = normalizeMenuKategori(data.kategori, data.nama)

      menus.push({
        id: d.id,
        nama: data.nama || 'Menu Tanpa Nama',
        harga,
        sisa_porsi,
        sisaPorsi: sisa_porsi,
        tersedia: Boolean(data.tersedia),
        deskripsi: data.deskripsi || '',
        kategori,
        dibuat_pada: data.dibuat_pada,
      })
    })
    callback(menus)
  }, (err) => {
    console.error('Error subscribe menus Firestore:', err)
    callback(getLocalMenus())
  })
}

async function getNextMenuId(db: any): Promise<string> {
  try {
    const snapshot = await getDocs(collection(db, COLLECTION_NAME))
    let maxNum = 0
    snapshot.forEach((docSnap) => {
      const match = docSnap.id.match(/^menu-(\d+)$/)
      if (match) {
        const num = parseInt(match[1], 10)
        if (num > maxNum) maxNum = num
      }
    })
    return `menu-${maxNum + 1}`
  } catch (err) {
    return `menu-${Date.now()}`
  }
}

export async function createMenu(payload: Omit<Menu, 'id'>): Promise<string> {
  const validation = validateMenuInput(payload)
  if (!validation.isValid) {
    throw new Error(validation.error || 'Input menu tidak valid')
  }

  const sisa = Math.max(0, Math.floor(Number(payload.sisa_porsi ?? payload.sisaPorsi ?? 0)))
  const db = getFirebaseDb()
  const kategori = normalizeMenuKategori(payload.kategori, payload.nama)

  // Sesuai Skema-Firestore-Dapur-Nia: nama, harga, sisa_porsi, tersedia, dibuat_pada + kategori, deskripsi
  const dataToSave = {
    nama: payload.nama.trim(),
    harga: Number(payload.harga),
    sisa_porsi: sisa,
    tersedia: payload.tersedia !== undefined ? Boolean(payload.tersedia) : sisa > 0,
    kategori,
    deskripsi: payload.deskripsi?.trim() || '',
    dibuat_pada: serverTimestamp(),
  }

  if (!db) {
    const local = getLocalMenus()
    let maxNum = 0
    local.forEach((m) => {
      const match = m.id.match(/^menu-(\d+)$/)
      if (match) {
        const num = parseInt(match[1], 10)
        if (num > maxNum) maxNum = num
      }
    })
    const newId = `menu-${maxNum + 1}`
    const newMenu: Menu = {
      ...dataToSave,
      sisaPorsi: sisa,
      id: newId,
    }
    local.push(newMenu)
    saveLocalMenus(local)
    return newMenu.id
  }

  const nextId = await getNextMenuId(db)
  const docRef = doc(db, COLLECTION_NAME, nextId)
  await setDoc(docRef, dataToSave)
  return nextId
}

export async function updateMenu(id: string, updates: Partial<Menu>): Promise<void> {
  if (updates.harga !== undefined && updates.harga < 0) {
    throw new Error('Harga tidak boleh negatif')
  }
  const rawPorsi = updates.sisa_porsi ?? updates.sisaPorsi
  if (rawPorsi !== undefined && rawPorsi < 0) {
    throw new Error('Sisa porsi tidak boleh negatif')
  }

  const db = getFirebaseDb()
  if (!db) {
    const local = getLocalMenus()
    const idx = local.findIndex((m) => m.id === id)
    if (idx !== -1) {
      const sisa = rawPorsi !== undefined ? Math.max(0, rawPorsi) : (local[idx].sisa_porsi ?? local[idx].sisaPorsi ?? 0)
      local[idx] = {
        ...local[idx],
        ...updates,
        sisa_porsi: sisa,
        sisaPorsi: sisa,
        tersedia: updates.tersedia !== undefined ? Boolean(updates.tersedia) : sisa > 0,
      }
      saveLocalMenus(local)
    }
    return
  }

  const docRef = doc(db, COLLECTION_NAME, id)
  const cleanUpdates: any = {}
  if (updates.nama !== undefined) cleanUpdates.nama = updates.nama.trim()
  if (updates.harga !== undefined) cleanUpdates.harga = Number(updates.harga)
  if (rawPorsi !== undefined) {
    const sisa = Math.max(0, Math.floor(Number(rawPorsi)))
    cleanUpdates.sisa_porsi = sisa
    if (updates.tersedia === undefined) {
      cleanUpdates.tersedia = sisa > 0
    }
  }
  if (updates.tersedia !== undefined) {
    cleanUpdates.tersedia = Boolean(updates.tersedia)
  }
  if (updates.kategori !== undefined) {
    cleanUpdates.kategori = normalizeMenuKategori(updates.kategori, updates.nama)
  }
  if (updates.deskripsi !== undefined) {
    cleanUpdates.deskripsi = updates.deskripsi.trim()
  }

  await updateDoc(docRef, cleanUpdates)
}

export async function deleteMenu(id: string): Promise<void> {
  const db = getFirebaseDb()
  if (!db) {
    const local = getLocalMenus()
    const filtered = local.filter((m) => m.id !== id)
    saveLocalMenus(filtered)
    return
  }

  await deleteDoc(doc(db, COLLECTION_NAME, id))
}
