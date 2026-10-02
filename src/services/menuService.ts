import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Firestore
} from 'firebase/firestore'
import { getFirebaseDb } from '../lib/firebase'
import { Menu } from '../types'
import { validateMenuInput } from '../lib/validation'

const COLLECTION_NAME = 'menus'

// Local mock storage key saat Firebase belum terhubung
const LOCAL_MOCK_MENUS = 'dapur_nia_local_mock_menus'

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
      id: 'default-1',
      nama: 'Ayam Goreng Lengkuas',
      deskripsi: 'Ayam goreng bumbu rempah lengkuas renyah + sambal terasi',
      harga: 22000,
      sisaPorsi: 15,
      kategori: 'Lauk',
      tersedia: true,
    },
    {
      id: 'default-2',
      nama: 'Sayur Asem Jakarta',
      deskripsi: 'Sayur asem kuah segar dengan jagung manis & labu siam',
      harga: 10000,
      sisaPorsi: 10,
      kategori: 'Sayur',
      tersedia: true,
    },
    {
      id: 'default-3',
      nama: 'Paket Nasi Kotak Komplit',
      deskripsi: 'Nasi putih, ayam bakar madu, tahu tempe, lalap sambal',
      harga: 28000,
      sisaPorsi: 0, // Invarian test: status habis
      kategori: 'Paket',
      tersedia: false,
    },
  ]
  localStorage.setItem(LOCAL_MOCK_MENUS, JSON.stringify(defaults))
  return defaults
}

function saveLocalMenus(menus: Menu[]) {
  localStorage.setItem(LOCAL_MOCK_MENUS, JSON.stringify(menus))
}

export function subscribeMenus(callback: (menus: Menu[]) => void): () => void {
  const db = getFirebaseDb()
  if (!db) {
    // Mode demo offline local storage jika DB belum disetup
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
      menus.push({
        id: d.id,
        nama: data.nama,
        deskripsi: data.deskripsi || '',
        harga: Number(data.harga),
        sisaPorsi: Number(data.sisaPorsi),
        kategori: data.kategori || 'Umum',
        tersedia: Number(data.sisaPorsi) > 0 && (data.tersedia !== false),
      })
    })
    callback(menus)
  }, (err) => {
    console.error('Error subscribe menus Firestore:', err)
    callback(getLocalMenus())
  })
}

export async function createMenu(payload: Omit<Menu, 'id'>): Promise<string> {
  const validation = validateMenuInput(payload)
  if (!validation.isValid) {
    throw new Error(validation.error || 'Input menu tidak valid')
  }

  const db = getFirebaseDb()
  const dataToSave = {
    nama: payload.nama.trim(),
    deskripsi: payload.deskripsi?.trim() || '',
    harga: Number(payload.harga),
    sisaPorsi: Math.max(0, Math.floor(Number(payload.sisaPorsi))),
    kategori: payload.kategori || 'Lauk',
    tersedia: Number(payload.sisaPorsi) > 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  if (!db) {
    const local = getLocalMenus()
    const newMenu: Menu = {
      ...dataToSave,
      id: 'local-' + Date.now(),
    }
    local.push(newMenu)
    saveLocalMenus(local)
    return newMenu.id
  }

  const docRef = await addDoc(collection(db, COLLECTION_NAME), dataToSave)
  return docRef.id
}

export async function updateMenu(id: string, updates: Partial<Menu>): Promise<void> {
  if (updates.harga !== undefined && updates.harga <= 0) {
    throw new Error('Harga harus lebih besar dari 0')
  }
  if (updates.sisaPorsi !== undefined && updates.sisaPorsi < 0) {
    throw new Error('Sisa porsi tidak boleh negatif')
  }

  const db = getFirebaseDb()
  if (!db) {
    const local = getLocalMenus()
    const idx = local.findIndex((m) => m.id === id)
    if (idx !== -1) {
      const sisa = updates.sisaPorsi !== undefined ? Math.max(0, updates.sisaPorsi) : local[idx].sisaPorsi
      local[idx] = {
        ...local[idx],
        ...updates,
        sisaPorsi: sisa,
        tersedia: sisa > 0,
      }
      saveLocalMenus(local)
    }
    return
  }

  const docRef = doc(db, COLLECTION_NAME, id)
  const cleanUpdates: any = {
    ...updates,
    updatedAt: serverTimestamp(),
  }
  if (updates.sisaPorsi !== undefined) {
    cleanUpdates.sisaPorsi = Math.max(0, Math.floor(Number(updates.sisaPorsi)))
    cleanUpdates.tersedia = cleanUpdates.sisaPorsi > 0
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

export async function updatePorsiQuick(id: string, delta: number): Promise<void> {
  const db = getFirebaseDb()
  if (!db) {
    const local = getLocalMenus()
    const idx = local.findIndex((m) => m.id === id)
    if (idx !== -1) {
      const nextPorsi = Math.max(0, local[idx].sisaPorsi + delta)
      local[idx].sisaPorsi = nextPorsi
      local[idx].tersedia = nextPorsi > 0
      saveLocalMenus(local)
    }
    return
  }

  const docRef = doc(db, COLLECTION_NAME, id)
  // Baca state saat ini
  const local = getLocalMenus()
  const current = local.find(m => m.id === id)
  const nextVal = Math.max(0, (current?.sisaPorsi || 0) + delta)

  await updateDoc(docRef, {
    sisaPorsi: nextVal,
    tersedia: nextVal > 0,
    updatedAt: serverTimestamp(),
  })
}
