import { Menu, OrderItem, OrderStatus, Pesanan, DailyReportSummary } from '../types'

/**
 * Validasi form data menu sesuai invarian PRD & Skema Firestore
 */
export function validateMenuInput(data: Partial<Menu>): { isValid: boolean; error?: string } {
  if (!data.nama || data.nama.trim().length < 3 || data.nama.trim().length > 60) {
    return { isValid: false, error: 'Nama menu minimal 3 karakter (maksimal 60 karakter)' }
  }
  const harga = data.harga
  if (harga === undefined || harga <= 0) {
    return { isValid: false, error: 'Harga harus lebih besar dari 0 (tidak boleh minus atau gratis)' }
  }
  const sisa = data.sisa_porsi ?? data.sisaPorsi
  if (sisa === undefined || sisa < 0) {
    return { isValid: false, error: 'Sisa Porsi tidak boleh negatif' }
  }
  return { isValid: true }
}

/**
 * Validasi form pesanan sesuai PRD Dapur Nia:
 * 1. Ongkos kirim minimal Rp 10.000 (tidak boleh Rp 0)
 * 2. Minimal 1 menu katering terpilih
 * 3. Pelanggan harus diisi
 */
export function validatePesananInput(data: {
  pelangganId?: string
  items?: OrderItem[]
  ongkosKirim: number
}): { isValid: boolean; error?: string } {
  if (!data.pelangganId || !data.pelangganId.trim()) {
    return { isValid: false, error: 'Pilih pelanggan terlebih dahulu' }
  }
  if (!data.items || data.items.length === 0) {
    return { isValid: false, error: 'Pilih minimal 1 menu katering' }
  }
  if (data.ongkosKirim < 10000) {
    return { isValid: false, error: 'Ongkos kirim minimal Rp 10.000 sesuai ketentuan pengantaran katering' }
  }
  return { isValid: true }
}

/**
 * Normalisasi format nomor WhatsApp ke angka bersih (08xxx)
 */
export function normalizeWhatsApp(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, '')
  if (cleaned.startsWith('62')) {
    cleaned = '0' + cleaned.slice(2)
  }
  return cleaned
}

/**
 * Validasi nomor WhatsApp sesuai Skema: Diawali 08, total 10 sampai 13 angka
 */
export function isValidWhatsApp(phone: string): boolean {
  const normalized = normalizeWhatsApp(phone)
  return /^08[0-9]{8,11}$/.test(normalized)
}

/**
 * Finite State Machine untuk transisi status pesanan sesuai Skema:
 * menunggu_bayar -> dibayar atau dibatalkan
 * dibayar -> diproses atau dibatalkan
 * diproses -> selesai
 * selesai / dibatalkan -> terminal
 */
export function canTransitionStatus(current: OrderStatus | string, next: OrderStatus | string): boolean {
  if (current === next) return true

  // Normalisasi alias status lama
  const normCurrent =
    current === 'menunggu' || current === 'menunggu_pembayaran'
      ? 'menunggu_bayar'
      : current === 'dikonfirmasi'
      ? 'dibayar'
      : current

  const normNext =
    next === 'menunggu_pembayaran' || next === 'menunggu'
      ? 'menunggu_bayar'
      : next === 'dikonfirmasi'
      ? 'dibayar'
      : next

  const transitions: Record<string, string[]> = {
    menunggu_bayar: ['dibayar', 'dibatalkan'],
    dibayar: ['diproses', 'dibatalkan'],
    diproses: ['selesai'],
    selesai: [],
    dibatalkan: [],
  }

  return transitions[normCurrent]?.includes(normNext) ?? false
}

/**
 * Menghitung total tagihan pesanan (invarian: harga_satuan * jumlah_porsi + ongkir)
 */
export function calculateOrderTotal(
  itemsOrSingle: OrderItem[] | { harga_satuan: number; jumlah_porsi: number },
  ongkosKirim: number
): number {
  if (Array.isArray(itemsOrSingle)) {
    if (!itemsOrSingle || itemsOrSingle.length === 0) return 0
    const subtotal = itemsOrSingle.reduce((sum, item) => {
      const h = Number(item.harga_satuan ?? item.hargaSaatPesan ?? 0)
      const p = Number(item.jumlah_porsi ?? item.jumlahPorsi ?? 0)
      return sum + (item.subtotal ?? (h * p))
    }, 0)
    return subtotal + Math.max(0, ongkosKirim)
  }
  return (itemsOrSingle.harga_satuan * itemsOrSingle.jumlah_porsi) + Math.max(0, ongkosKirim)
}

/**
 * Agregasi laporan harian sesuai Skema:
 * Dihitung dari koleksi pesanan, abaikan status dibatalkan
 */
export function calculateDailyReport(orders: Pesanan[], targetDate: string = ''): DailyReportSummary {
  let totalOmset = 0
  let totalPorsiTerjual = 0
  const itemSales: Record<string, { namaMenu: string; porsi: number; nominal: number }> = {}

  for (const order of orders) {
    if (order.status === 'dibatalkan') continue

    const orderTotal = Number(order.total ?? order.totalTagihan ?? 0)
    totalOmset += orderTotal

    // Prioritaskan order.items untuk multi-menu
    if (Array.isArray(order.items) && order.items.length > 0) {
      for (const item of order.items) {
        const id = item.menu_id || item.menuId || ''
        const nama = item.nama_menu || item.namaMenu || 'Menu'
        const porsi = Number(item.jumlah_porsi ?? item.jumlahPorsi ?? 0)
        const h = Number(item.harga_satuan ?? item.hargaSaatPesan ?? 0)
        const sub = Number(item.subtotal ?? (h * porsi))

        totalPorsiTerjual += porsi
        if (!itemSales[id]) {
          itemSales[id] = {
            namaMenu: nama,
            porsi: 0,
            nominal: 0,
          }
        }
        itemSales[id].porsi += porsi
        itemSales[id].nominal += sub
      }
    } else if (order.menu_id) {
      // Fallback single-item legacy
      const porsi = Number(order.jumlah_porsi || 0)
      const harga = Number(order.harga_satuan || 0)
      const nominal = harga * porsi
      totalPorsiTerjual += porsi

      if (!itemSales[order.menu_id]) {
        itemSales[order.menu_id] = {
          namaMenu: order.nama_menu || 'Menu',
          porsi: 0,
          nominal: 0,
        }
      }
      itemSales[order.menu_id].porsi += porsi
      itemSales[order.menu_id].nominal += nominal
    }
  }

  const validOrders = orders.filter(o => o.status !== 'dibatalkan')
  return {
    tanggal: targetDate,
    totalOmset,
    totalPorsiTerjual,
    totalPesananSukses: validOrders.length,
    itemSales,
  }
}
