export interface Menu {
  id: string
  nama: string
  deskripsi?: string
  harga: number
  sisaPorsi: number
  kategori: string
  tersedia: boolean
  createdAt?: any
  updatedAt?: any
}

export interface Pelanggan {
  id: string
  nama: string
  nomorWhatsapp: string
  alamat: string
  catatan?: string
  createdAt?: any
}

export type OrderStatus =
  | 'menunggu_pembayaran'
  | 'dikonfirmasi'
  | 'diproses'
  | 'selesai'

export interface OrderItem {
  menuId: string
  namaMenu: string
  hargaSaatPesan: number
  jumlahPorsi: number
  subtotal: number
}

export interface Pesanan {
  id: string
  nomorPesanan: string
  pelangganId: string
  pelangganSnapshot: {
    nama: string
    nomorWhatsapp: string
    alamat: string
  }
  items: OrderItem[]
  ongkosKirim: number
  totalTagihan: number
  tanggalPesanan: string // YYYY-MM-DD
  waktuPesan: any
  status: OrderStatus
  buktiBayarUrl?: string
  catatanPesanan?: string
}

export interface DailyReportSummary {
  tanggal: string
  totalOmset: number
  totalPorsiTerjual: number
  totalPesananSukses: number
  itemSales: Record<string, {
    namaMenu: string
    porsi: number
    nominal: number
  }>
}
