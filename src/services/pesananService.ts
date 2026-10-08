import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore'
import { getFirebaseDb } from '../lib/firebase'
import { Pesanan, OrderStatus, OrderItem } from '../types'
import { canTransitionStatus } from '../lib/validation'

// Sesuai Skema-Firestore-Dapur-Nia: Koleksi huruf kecil tunggal 'pesanan'
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
      id: 'order-1',
      pelanggan_id: '08123456789',
      nama_pelanggan: 'Budi Santoso',
      alamat_kirim: 'Jl. Mawar No. 12, Bandung',
      menu_id: 'menu-1',
      nama_menu: 'Nasi Ayam Bakar',
      harga_satuan: 25000,
      jumlah_porsi: 2,
      ongkir: 5000,
      total: 55000,
      status: 'menunggu_bayar',
      bukti_bayar: '',
      tanggal: today,
      dibuat_pada: new Date().toISOString(),

      // Aliases
      nomorPesanan: 'order-1',
      pelangganId: '08123456789',
      pelangganSnapshot: {
        nama: 'Budi Santoso',
        nomorWhatsapp: '08123456789',
        alamat: 'Jl. Mawar No. 12, Bandung',
      },
      items: [
        {
          menuId: 'menu-1',
          namaMenu: 'Nasi Ayam Bakar',
          hargaSaatPesan: 25000,
          jumlahPorsi: 2,
          subtotal: 50000,
        },
      ],
      ongkosKirim: 5000,
      totalTagihan: 55000,
      tanggalPesanan: today,
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

  const q = query(collection(db, COLLECTION_NAME), orderBy('tanggal', 'desc'))
  return onSnapshot(q, (snapshot) => {
    const list: Pesanan[] = []
    snapshot.forEach((d) => {
      const data = d.data()

      // Normalisasi status (menunggu -> menunggu_bayar)
      let status: OrderStatus = data.status || 'menunggu_bayar'
      if (status === 'menunggu' as any || status === 'menunggu_pembayaran' as any) {
        status = 'menunggu_bayar'
      } else if (status === 'dikonfirmasi' as any) {
        status = 'dibayar'
      }

      const pId = data.pelanggan_id || data.pelangganId || ''
      const pNama = data.nama_pelanggan || data.pelangganSnapshot?.nama || 'Pelanggan'
      const pAlamat = data.alamat_kirim || data.pelangganSnapshot?.alamat || ''
      const pWA = data.pelanggan_id || data.pelangganSnapshot?.nomorWhatsapp || ''

      const mId = data.menu_id || data.items?.[0]?.menuId || ''
      const mNama = data.nama_menu || data.items?.[0]?.namaMenu || 'Menu'
      const hSatuan = Number(data.harga_satuan || data.items?.[0]?.hargaSaatPesan || 0)
      const jPorsi = Number(data.jumlah_porsi || data.items?.[0]?.jumlahPorsi || 1)
      const ongkir = Number(data.ongkir || data.ongkosKirim || 0)
      const total = Number(data.total || data.totalTagihan || (hSatuan * jPorsi + ongkir))
      const tanggal = (data.tanggal || data.tanggalPesanan || new Date().toISOString().split('T')[0]).split('T')[0]
      const buktiBayar = data.bukti_bayar || data.buktiBayarUrl || ''

      const parsedItems: OrderItem[] = Array.isArray(data.items) && data.items.length > 0
        ? data.items.map((it: any) => {
            const itemId = it.menu_id || it.menuId || ''
            const itemNama = it.nama_menu || it.namaMenu || ''
            const itemHarga = Number(it.harga_satuan ?? it.hargaSaatPesan ?? 0)
            const itemPorsi = Number(it.jumlah_porsi ?? it.jumlahPorsi ?? 0)
            const subtotal = Number(it.subtotal ?? (itemHarga * itemPorsi))
            return {
              menu_id: itemId,
              nama_menu: itemNama,
              harga_satuan: itemHarga,
              jumlah_porsi: itemPorsi,
              subtotal,
              menuId: itemId,
              namaMenu: itemNama,
              hargaSaatPesan: itemHarga,
              jumlahPorsi: itemPorsi,
            }
          })
        : [
            {
              menu_id: mId,
              nama_menu: mNama,
              harga_satuan: hSatuan,
              jumlah_porsi: jPorsi,
              subtotal: hSatuan * jPorsi,
              menuId: mId,
              namaMenu: mNama,
              hargaSaatPesan: hSatuan,
              jumlahPorsi: jPorsi,
            },
          ]

      list.push({
        id: d.id,
        user_id: data.user_id || '',
        user_email: data.user_email || '',
        // Official fields
        pelanggan_id: pId,
        nama_pelanggan: pNama,
        alamat_kirim: pAlamat,
        menu_id: mId,
        nama_menu: mNama,
        harga_satuan: hSatuan,
        jumlah_porsi: jPorsi,
        items: parsedItems,
        ongkir,
        total,
        status,
        bukti_bayar: buktiBayar,
        tanggal,
        dibuat_pada: data.dibuat_pada,

        // UI aliases
        nomorPesanan: data.nomorPesanan || d.id,
        pelangganId: pId,
        pelangganSnapshot: {
          nama: pNama,
          nomorWhatsapp: pWA,
          alamat: pAlamat,
        },
        ongkosKirim: ongkir,
        totalTagihan: total,
        tanggalPesanan: tanggal,
        waktuPesan: data.dibuat_pada?.toDate?.() || new Date(data.dibuat_pada || Date.now()),
        buktiBayarUrl: buktiBayar,
        catatanPesanan: data.catatanPesanan || '',
      })
    })
    callback(list)
  }, (err) => {
    console.error('Error subscribe pesanan:', err)
    callback(getLocalPesanan())
  })
}

export interface NewOrderPayload {
  pelanggan_id?: string
  nama_pelanggan?: string
  alamat_kirim?: string
  items?: Array<{
    menu_id?: string
    menuId?: string
    nama_menu?: string
    namaMenu?: string
    harga_satuan?: number
    hargaSaatPesan?: number
    jumlah_porsi?: number
    jumlahPorsi?: number
    subtotal?: number
  }>
  ongkir?: number
  bukti_bayar?: string
  tanggal?: string

  // Legacy single-item fields
  menu_id?: string
  nama_menu?: string
  harga_satuan?: number
  jumlah_porsi?: number

  // UI convenience aliases
  pelangganId?: string
  pelangganSnapshot?: {
    nama: string
    nomorWhatsapp: string
    alamat: string
  }
  ongkosKirim?: number
  catatanPesanan?: string

  // Relasi akun autentikasi pembeli
  user_id?: string
  user_email?: string
}

async function getNextOrderId(db: any): Promise<string> {
  try {
    const snapshot = await getDocs(collection(db, COLLECTION_NAME))
    let maxNum = 0
    snapshot.forEach((docSnap) => {
      const match = docSnap.id.match(/^order-(\d+)$/)
      if (match) {
        const num = parseInt(match[1], 10)
        if (num > maxNum) maxNum = num
      }
    })
    return `order-${maxNum + 1}`
  } catch (err) {
    return `order-${Date.now()}`
  }
}

export async function createPesanan(payload: NewOrderPayload): Promise<string> {
  const pelanggan_id = payload.pelanggan_id || payload.pelangganId || payload.pelangganSnapshot?.nomorWhatsapp || ''
  const nama_pelanggan = payload.nama_pelanggan || payload.pelangganSnapshot?.nama || ''
  const alamat_kirim = payload.alamat_kirim || payload.pelangganSnapshot?.alamat || ''

  if (!pelanggan_id) {
    throw new Error('Pelanggan wajib dipilih')
  }

  // Normalisasi multi-menu items
  let orderItems = (payload.items || []).map((it) => {
    const mId = it.menu_id || it.menuId || ''
    const mNama = it.nama_menu || it.namaMenu || ''
    const hSat = Number(it.harga_satuan ?? it.hargaSaatPesan ?? 0)
    const jPor = Number(it.jumlah_porsi ?? it.jumlahPorsi ?? 0)
    return {
      menu_id: mId,
      nama_menu: mNama,
      harga_satuan: hSat,
      jumlah_porsi: jPor,
      subtotal: Number(it.subtotal ?? (hSat * jPor)),
    }
  }).filter((it) => it.menu_id && it.jumlah_porsi > 0)

  // Fallback single-item legacy jika items kosong
  if (orderItems.length === 0 && payload.menu_id) {
    const hSat = Number(payload.harga_satuan || 0)
    const jPor = Number(payload.jumlah_porsi || 0)
    if (jPor > 0) {
      orderItems.push({
        menu_id: payload.menu_id,
        nama_menu: payload.nama_menu || '',
        harga_satuan: hSat,
        jumlah_porsi: jPor,
        subtotal: hSat * jPor,
      })
    }
  }

  if (orderItems.length === 0) {
    throw new Error('Pilih minimal 1 menu katering')
  }

  for (const it of orderItems) {
    if (it.jumlah_porsi <= 0) {
      throw new Error(`Jumlah porsi untuk ${it.nama_menu} minimal 1`)
    }
    if (it.harga_satuan < 0) {
      throw new Error(`Harga menu ${it.nama_menu} tidak boleh negatif`)
    }
  }

  const ongkir = Number(payload.ongkir ?? payload.ongkosKirim ?? 0)
  if (ongkir < 0) {
    throw new Error('Ongkos kirim tidak boleh negatif')
  }

  const totalHargaMenu = orderItems.reduce((sum, it) => sum + (it.harga_satuan * it.jumlah_porsi), 0)
  const total = totalHargaMenu + ongkir
  const todayStr = new Date().toISOString().split('T')[0]
  const db = getFirebaseDb()

  const dataToSave = {
    pelanggan_id,
    nama_pelanggan,
    alamat_kirim,
    items: orderItems,
    user_id: payload.user_id || '',
    user_email: (payload.user_email || '').toLowerCase().trim(),
    // Field ringkasan utama
    menu_id: orderItems[0]?.menu_id || '',
    nama_menu: orderItems.map((it) => `${it.nama_menu} (${it.jumlah_porsi})`).join(', '),
    harga_satuan: orderItems[0]?.harga_satuan || 0,
    jumlah_porsi: orderItems.reduce((sum, it) => sum + it.jumlah_porsi, 0),
    ongkir,
    total,
    status: 'menunggu_bayar' as OrderStatus,
    bukti_bayar: payload.bukti_bayar || '',
    tanggal: payload.tanggal || todayStr,
    dibuat_pada: serverTimestamp(),
  }

  if (db) {
    // 1. Cek stok semua menu sebelum pengurangan
    for (const it of orderItems) {
      const menuRef = doc(db, 'menu', it.menu_id)
      const menuSnap = await getDoc(menuRef)
      if (menuSnap.exists()) {
        const curPorsi = Number(menuSnap.data().sisa_porsi ?? menuSnap.data().sisaPorsi ?? 0)
        if (curPorsi < it.jumlah_porsi) {
          throw new Error(`Sisa porsi ${it.nama_menu} tidak mencukupi (tersedia: ${curPorsi} porsi)`)
        }
      }
    }

    // 2. Potong stok masing-masing menu di Firestore
    for (const it of orderItems) {
      try {
        const menuRef = doc(db, 'menu', it.menu_id)
        const menuSnap = await getDoc(menuRef)
        if (menuSnap.exists()) {
          const curPorsi = Number(menuSnap.data().sisa_porsi ?? menuSnap.data().sisaPorsi ?? 0)
          const newPorsi = Math.max(0, curPorsi - it.jumlah_porsi)
          await updateDoc(menuRef, {
            sisa_porsi: newPorsi,
            tersedia: newPorsi > 0,
          })
        }
      } catch (e: any) {
        console.warn(`Gagal memotong stok ${it.nama_menu}:`, e)
      }
    }

    const nextId = await getNextOrderId(db)
    const docRef = doc(db, COLLECTION_NAME, nextId)
    await setDoc(docRef, dataToSave)
    return nextId
  } else {
    const local = getLocalPesanan()
    let maxNum = 0
    local.forEach((o) => {
      const match = o.id.match(/^order-(\d+)$/)
      if (match) {
        const num = parseInt(match[1], 10)
        if (num > maxNum) maxNum = num
      }
    })
    const newId = `order-${maxNum + 1}`
    const newOrder: Pesanan = {
      ...dataToSave,
      id: newId,
      nomorPesanan: newId,
      waktuPesan: new Date().toISOString(),
    }
    local.unshift(newOrder)
    saveLocalPesanan(local)
    return newOrder.id
  }
}

export async function updatePesananStatus(
  pesananId: string,
  currentStatus: OrderStatus | string,
  nextStatus: OrderStatus | string,
  buktiBayar?: string
): Promise<void> {
  if (!canTransitionStatus(currentStatus, nextStatus)) {
    throw new Error(`Transisi status dari "${currentStatus}" ke "${nextStatus}" tidak diperbolehkan!`)
  }

  const db = getFirebaseDb()
  if (!db) {
    const local = getLocalPesanan()
    const idx = local.findIndex((o) => o.id === pesananId)
    if (idx !== -1) {
      local[idx].status = nextStatus as OrderStatus
      if (buktiBayar) local[idx].bukti_bayar = buktiBayar
      saveLocalPesanan(local)
    }
    return
  }

  const docRef = doc(db, COLLECTION_NAME, pesananId)

  // Jika pesanan dibatalkan, pulihkan stok menu terkait
  if (nextStatus === 'dibatalkan') {
    try {
      const orderSnap = await getDoc(docRef)
      if (orderSnap.exists()) {
        const oData = orderSnap.data()
        const cancelItems = Array.isArray(oData.items) && oData.items.length > 0
          ? oData.items
          : (oData.menu_id ? [{ menu_id: oData.menu_id, jumlah_porsi: oData.jumlah_porsi }] : [])

        for (const it of cancelItems) {
          if (!it.menu_id) continue
          const menuRef = doc(db, 'menu', it.menu_id)
          const menuSnap = await getDoc(menuRef)
          if (menuSnap.exists()) {
            const curPorsi = Number(menuSnap.data().sisa_porsi ?? menuSnap.data().sisaPorsi ?? 0)
            const restorePorsi = curPorsi + Number(it.jumlah_porsi || 0)
            await updateDoc(menuRef, {
              sisa_porsi: restorePorsi,
              tersedia: restorePorsi > 0,
            })
          }
        }
      }
    } catch (err) {
      console.warn('Gagal memulihkan stok pesanan batal:', err)
    }
  }

  const updates: any = {
    status: nextStatus,
  }
  if (buktiBayar !== undefined) {
    updates.bukti_bayar = buktiBayar
  }

  await updateDoc(docRef, updates)
}
