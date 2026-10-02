import { Menu, OrderItem, OrderStatus, Pesanan, DailyReportSummary } from '../types'

/**
 * Validasi form data menu sesuai invarian PRD
 */
export function validateMenuInput(data: Partial<Menu>): { isValid: boolean; error?: string } {
  if (!data.nama || data.nama.trim().length < 3) {
    return { isValid: false, error: 'Nama menu minimal 3 karakter' }
  }
  if (data.harga === undefined || data.harga <= 0) {
    return { isValid: false, error: 'Harga harus lebih besar dari 0 (tidak boleh minus atau gratis)' }
  }
  if (data.sisaPorsi === undefined || data.sisaPorsi < 0) {
    return { isValid: false, error: 'Sisa Porsi tidak boleh negatif' }
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
 * Validasi nomor WhatsApp
 */
export function isValidWhatsApp(phone: string): boolean {
  const normalized = normalizeWhatsApp(phone)
  return /^08[0-9]{8,13}$/.test(normalized)
}

/**
 * Finite State Machine untuk transisi status pesanan
 */
export function canTransitionStatus(current: OrderStatus, next: OrderStatus): boolean {
  if (current === next) return true

  const transitions: Record<OrderStatus, OrderStatus[]> = {
    menunggu_pembayaran: ['dikonfirmasi', 'dibatalkan'],
    dikonfirmasi: ['diproses', 'dibatalkan'],
    diproses: ['dikirim'],
    dikirim: ['selesai'],
    selesai: [],
    dibatalkan: [],
  }

  return transitions[current]?.includes(next) ?? false
}

/**
 * Menghitung total tagihan pesanan (invarian: selalu positif jika ada item)
 */
export function calculateOrderTotal(items: OrderItem[], ongkosKirim: number): number {
  if (!items || items.length === 0) return 0
  const subtotal = items.reduce((sum, item) => sum + (item.hargaSaatPesan * item.jumlahPorsi), 0)
  return subtotal + Math.max(0, ongkosKirim)
}

/**
 * Agregasi laporan harian (mengecualikan pesanan dibatalkan)
 */
export function calculateDailyReport(orders: Pesanan[], targetDate: string = ''): DailyReportSummary {
  const activeOrders = orders.filter(o => o.status !== 'dibatalkan')

  let totalOmset = 0
  let totalPorsiTerjual = 0
  const itemSales: Record<string, { namaMenu: string; porsi: number; nominal: number }> = {}

  for (const order of activeOrders) {
    totalOmset += order.totalTagihan

    for (const item of order.items) {
      totalPorsiTerjual += item.jumlahPorsi
      if (!itemSales[item.menuId]) {
        itemSales[item.menuId] = {
          namaMenu: item.namaMenu,
          porsi: 0,
          nominal: 0,
        }
      }
      itemSales[item.menuId].porsi += item.jumlahPorsi
      itemSales[item.menuId].nominal += item.subtotal
    }
  }

  return {
    tanggal: targetDate,
    totalOmset,
    totalPorsiTerjual,
    totalPesananSukses: activeOrders.length,
    itemSales,
  }
}
