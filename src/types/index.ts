export type UserRole = 'pemilik' | 'staf' | 'pelanggan'

export interface UserProfile {
  uid: string
  email: string
  nama: string
  no_whatsapp?: string
  alamat?: string
  peran: UserRole
  dibuat_pada?: any
}

export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  role: UserRole
  noWhatsapp?: string
  nomorWhatsapp?: string
  alamat?: string
}

export interface Menu {
  id: string
  nama: string
  harga: number
  sisa_porsi?: number
  tersedia: boolean
  dibuat_pada?: any

  // UI convenience properties
  sisaPorsi?: number
  kategori?: string
  deskripsi?: string
  gambar?: string
}

export interface Pelanggan {
  id: string // Nomor WhatsApp pelanggan
  nama: string
  no_whatsapp?: string
  alamat: string
  dibuat_pada?: any

  // Relasi akun autentikasi
  email?: string
  uid?: string

  // UI convenience properties
  nomorWhatsapp?: string
  catatan?: string
}

export type OrderStatus =
  | 'menunggu_bayar'
  | 'dibayar'
  | 'diproses'
  | 'selesai'
  | 'dibatalkan'
  // Kompatibilitas alias data seed / transisi
  | 'menunggu'
  | 'menunggu_pembayaran'
  | 'dikonfirmasi'

export interface OrderItem {
  menu_id?: string
  nama_menu?: string
  harga_satuan?: number
  jumlah_porsi?: number
  subtotal: number

  // Aliases for convenience
  menuId?: string
  namaMenu?: string
  hargaSaatPesan?: number
  jumlahPorsi?: number
}

export interface Pesanan {
  id: string
  pelanggan_id: string
  nama_pelanggan: string
  alamat_kirim: string
  items?: OrderItem[]
  ongkir: number
  total: number
  status: OrderStatus
  bukti_bayar?: string
  tanggal: string // Format YYYY-MM-DD
  dibuat_pada?: any

  // Relasi akun autentikasi pembeli
  user_id?: string
  user_email?: string

  // Fallback single-item fields (kompatibilitas data lama)
  menu_id?: string
  nama_menu?: string
  harga_satuan?: number
  jumlah_porsi?: number

  // UI convenience properties
  nomorPesanan?: string
  pelangganId?: string
  pelangganSnapshot?: {
    nama: string
    nomorWhatsapp: string
    alamat: string
  }
  ongkosKirim?: number
  totalTagihan?: number
  tanggalPesanan?: string
  waktuPesan?: any
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
