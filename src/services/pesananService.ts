import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore'
import { getFirebaseDb } from '../lib/firebase'
import { Pesanan, OrderStatus, OrderItem } from '../types'
import { canTransitionStatus, calculateOrderTotal } from '../lib/validation'
import { updatePorsiQuick } from './menuService'

const COLLECTION_NAME = 'pesanan'
const LOCAL_MOCK_PESANAN = 'dapur_nia_local_mock_pesanan'

function getLocalPesanan(): Pesanan[] {
  try {
    const raw = localStorage.getItem(LOCAL_MOCK_PESANAN)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error(e)
  }

  const today = new Date().toISOString().split('T')[0]
  const defaults: Pesanan[] = [
    {
      id: 'ord-101',
      nomorPesanan: `DN-${today.replace(/-/g, '')}-001`,
      pelangganId: 'cust-1',
      pelangganSnapshot: {
        nama: 'Ibu Ratna',
        nomorWhatsapp: '081234567890',
        alamat: 'Jl. Melati No. 12, RT 02/05, Kebayoran Baru',
      },
      items: [
        {
          menuId: 'default-1',
          namaMenu: 'Ayam Goreng Lengkuas',
          hargaSaatPesan: 22000,
          jumlahPorsi: 2,
          subtotal: 44000,
        },
        {
          menuId: 'default-2',
          namaMenu: 'Sayur Asem Jakarta',
          hargaSaatPesan: 10000,
          jumlahPorsi: 1,
          subtotal: 10000,
        },
      ],
      ongkosKirim: 10000,
      totalTagihan: 64000,
      tanggalPesanan: today,
      waktuPesan: new Date().toISOString(),
      status: 'diproses',
      catatanPesanan: 'Tolong jangan terlalu pedas sambalnya',
    },
  ]
  localStorage.setItem(LOCAL_MOCK_PESANAN, JSON.stringify(defaults))
  return defaults
}

function saveLocalPesanan(list: Pesanan[]) {
  localStorage.setItem(LOCAL_MOCK_PESANAN, JSON.stringify(list))
}

export function subscribePesanan(callback: (list: Pesanan[]) => void): () => void {
  const db = getFirebaseDb()
  if (!db) {
    callback(getLocalPesanan())
    const interval = setInterval(() => callback(getLocalPesanan()), 1000)
    return () => clearInterval(interval)
  }

  const q = query(collection(db, COLLECTION_NAME), orderBy('tanggalPesanan', 'desc'))
  return onSnapshot(q, (snapshot) => {
    const list: Pesanan[] = []
    snapshot.forEach((d) => {
      const data = d.data()
      list.push({
        id: d.id,
        nomorPesanan: data.nomorPesanan,
        pelangganId: data.pelangganId,
        pelangganSnapshot: data.pelangganSnapshot,
        items: data.items || [],
        ongkosKirim: Number(data.ongkosKirim || 0),
        totalTagihan: Number(data.totalTagihan || 0),
        tanggalPesanan: data.tanggalPesanan,
        waktuPesan: data.waktuPesan?.toDate?.() || new Date(data.waktuPesan || Date.now()),
        status: data.status,
        buktiBayarUrl: data.buktiBayarUrl,
        catatanPesanan: data.catatanPesanan,
      })
    })
    callback(list)
  }, (err) => {
    console.error('Error subscribe pesanan:', err)
    callback(getLocalPesanan())
  })
}

export interface NewOrderPayload {
  pelangganId: string
  pelangganSnapshot: {
    nama: string
    nomorWhatsapp: string
    alamat: string
  }
  items: OrderItem[]
  ongkosKirim: number
  catatanPesanan?: string
}

export async function createPesanan(payload: NewOrderPayload): Promise<string> {
  if (!payload.items || payload.items.length === 0) {
    throw new Error('Pesanan minimal harus memilih 1 menu')
  }

  for (const item of payload.items) {
    if (item.jumlahPorsi <= 0) {
      throw new Error(`Porsi untuk ${item.namaMenu} harus lebih besar dari 0`)
    }
  }

  const total = calculateOrderTotal(payload.items, payload.ongkosKirim)
  if (total <= 0) {
    throw new Error('Total tagihan pesanan tidak boleh nol atau minus')
  }

  const todayStr = new Date().toISOString().split('T')[0]
  const randomSuffix = Math.floor(100 + Math.random() * 900)
  const nomorPesanan = `DN-${todayStr.replace(/-/g, '')}-${randomSuffix}`

  const db = getFirebaseDb()
  const dataToSave = {
    nomorPesanan,
    pelangganId: payload.pelangganId,
    pelangganSnapshot: payload.pelangganSnapshot,
    items: payload.items,
    ongkosKirim: payload.ongkosKirim,
    totalTagihan: total,
    tanggalPesanan: todayStr,
    waktuPesan: serverTimestamp(),
    status: 'menunggu_pembayaran' as OrderStatus,
    catatanPesanan: payload.catatanPesanan?.trim() || '',
  }

  // Kurangi stok menu masing-masing
  for (const item of payload.items) {
    await updatePorsiQuick(item.menuId, -item.jumlahPorsi)
  }

  if (!db) {
    const local = getLocalPesanan()
    const newOrder: Pesanan = {
      ...dataToSave,
      id: 'ord-' + Date.now(),
      waktuPesan: new Date().toISOString(),
    }
    local.unshift(newOrder)
    saveLocalPesanan(local)
    return newOrder.id
  }

  const docRef = await addDoc(collection(db, COLLECTION_NAME), dataToSave)
  return docRef.id
}

export async function updatePesananStatus(
  pesananId: string,
  currentStatus: OrderStatus,
  nextStatus: OrderStatus,
  itemsToRefundIfCancelled?: OrderItem[]
): Promise<void> {
  if (!canTransitionStatus(currentStatus, nextStatus)) {
    throw new Error(`Transisi status dari "${currentStatus}" ke "${nextStatus}" tidak diperbolehkan!`)
  }

  // Jika dibatalkan, kembalikan stok sisa porsi ke menu
  if (nextStatus === 'dibatalkan' && itemsToRefundIfCancelled) {
    for (const item of itemsToRefundIfCancelled) {
      await updatePorsiQuick(item.menuId, item.jumlahPorsi)
    }
  }

  const db = getFirebaseDb()
  if (!db) {
    const local = getLocalPesanan()
    const idx = local.findIndex((o) => o.id === pesananId)
    if (idx !== -1) {
      local[idx].status = nextStatus
      saveLocalPesanan(local)
    }
    return
  }

  const docRef = doc(db, COLLECTION_NAME, pesananId)
  await updateDoc(docRef, {
    status: nextStatus,
    updatedAt: serverTimestamp(),
  })
}
