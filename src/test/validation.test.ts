import { describe, it, expect } from 'vitest'
import {
  validateMenuInput,
  validatePesananInput,
  normalizeWhatsApp,
  isValidWhatsApp,
  canTransitionStatus,
  calculateOrderTotal,
  calculateDailyReport
} from '../lib/validation'
import { Pesanan, OrderItem } from '../types'

describe('Task 2: Logika Bisnis & Validasi Invarian Dapur Nia', () => {
  describe('Invarian Menu', () => {
    it('menolak harga menu jika bernilai <= 0', () => {
      const invalidMenu1 = { nama: 'Ayam Goreng', harga: 0, sisaPorsi: 10, kategori: 'Lauk' }
      const invalidMenu2 = { nama: 'Ayam Goreng', harga: -5000, sisaPorsi: 10, kategori: 'Lauk' }
      const validMenu = { nama: 'Ayam Goreng', harga: 15000, sisaPorsi: 10, kategori: 'Lauk' }

      expect(validateMenuInput(invalidMenu1).isValid).toBe(false)
      expect(validateMenuInput(invalidMenu1).error).toContain('Harga')

      expect(validateMenuInput(invalidMenu2).isValid).toBe(false)
      expect(validateMenuInput(validMenu).isValid).toBe(true)
    })

    it('menolak sisa porsi jika bernilai negatif', () => {
      const invalidPorsi = { nama: 'Sayur Asem', harga: 8000, sisaPorsi: -1, kategori: 'Sayur' }
      const zeroPorsi = { nama: 'Sayur Asem', harga: 8000, sisaPorsi: 0, kategori: 'Sayur' }

      expect(validateMenuInput(invalidPorsi).isValid).toBe(false)
      expect(validateMenuInput(invalidPorsi).error).toContain('Porsi')
      expect(validateMenuInput(zeroPorsi).isValid).toBe(true)
    })

    it('menolak nama menu kosong atau kurang dari 3 karakter', () => {
      const emptyName = { nama: '  ', harga: 10000, sisaPorsi: 5, kategori: 'Lauk' }
      const shortName = { nama: 'Ab', harga: 10000, sisaPorsi: 5, kategori: 'Lauk' }

      expect(validateMenuInput(emptyName).isValid).toBe(false)
      expect(validateMenuInput(shortName).isValid).toBe(false)
    })
  })

  describe('Invarian WhatsApp Pelanggan', () => {
    it('menormalisasi format nomor WhatsApp', () => {
      expect(normalizeWhatsApp('0812-3456-7890')).toBe('081234567890')
      expect(normalizeWhatsApp('+62 812 3456 7890')).toBe('081234567890')
      expect(normalizeWhatsApp('6281234567890')).toBe('081234567890')
    })

    it('memvalidasi nomor WhatsApp yang sah', () => {
      expect(isValidWhatsApp('081234567890')).toBe(true)
      expect(isValidWhatsApp('123')).toBe(false)
      expect(isValidWhatsApp('abc')).toBe(false)
    })
  })

  describe('Invarian & Mesin Transisi Status Pesanan (4 Tahap)', () => {
    it('mengizinkan transisi maju yang sah', () => {
      expect(canTransitionStatus('menunggu_pembayaran', 'dikonfirmasi')).toBe(true)
      expect(canTransitionStatus('dikonfirmasi', 'diproses')).toBe(true)
      expect(canTransitionStatus('diproses', 'selesai')).toBe(true)
    })

    it('menolak transisi melompat atau mundur', () => {
      expect(canTransitionStatus('menunggu_pembayaran', 'selesai')).toBe(false)
      expect(canTransitionStatus('menunggu_pembayaran', 'diproses')).toBe(false)
      expect(canTransitionStatus('diproses', 'dikonfirmasi')).toBe(false)
      expect(canTransitionStatus('selesai', 'diproses')).toBe(false)
    })
  })

  describe('Kalkulasi Total Tagihan Pesanan', () => {
    it('menghitung total tagihan dengan benar dan tidak boleh negatif', () => {
      const items: OrderItem[] = [
        { menuId: 'm1', namaMenu: 'Ayam Bakar', hargaSaatPesan: 20000, jumlahPorsi: 2, subtotal: 40000 },
        { menuId: 'm2', namaMenu: 'Es Teh Manis', hargaSaatPesan: 5000, jumlahPorsi: 2, subtotal: 10000 },
      ]
      const total = calculateOrderTotal(items, 10000)
      expect(total).toBe(60000)
    })

    it('mengembalikan 0 jika tidak ada item', () => {
      expect(calculateOrderTotal([], 10000)).toBe(0)
    })
  })

  describe('Agregasi Modul Laporan Harian', () => {
    it('mengakumulasi omset dan porsi terjual', () => {
      const orders: Pesanan[] = [
        {
          id: '1',
          pelanggan_id: '08123',
          nama_pelanggan: 'Budi',
          alamat_kirim: 'Jl Mawar',
          menu_id: 'm1',
          nama_menu: 'Ayam Bakar',
          harga_satuan: 20000,
          jumlah_porsi: 2,
          ongkir: 5000,
          total: 45000,
          nomorPesanan: 'DN-001',
          pelangganId: 'p1',
          pelangganSnapshot: { nama: 'Budi', nomorWhatsapp: '08123', alamat: 'Jl Mawar' },
          items: [
            { menu_id: 'm1', nama_menu: 'Ayam Bakar', menuId: 'm1', namaMenu: 'Ayam Bakar', harga_satuan: 20000, hargaSaatPesan: 20000, jumlah_porsi: 2, jumlahPorsi: 2, subtotal: 40000 }
          ],
          ongkosKirim: 5000,
          totalTagihan: 45000,
          tanggalPesanan: '2026-10-02',
          tanggal: '2026-10-02',
          waktuPesan: new Date(),
          status: 'selesai'
        },
        {
          id: '2',
          pelanggan_id: '08124',
          nama_pelanggan: 'Siti',
          alamat_kirim: 'Jl Melati',
          menu_id: 'm1',
          nama_menu: 'Ayam Bakar',
          harga_satuan: 20000,
          jumlah_porsi: 3,
          ongkir: 5000,
          total: 65000,
          nomorPesanan: 'DN-002',
          pelangganId: 'p2',
          pelangganSnapshot: { nama: 'Siti', nomorWhatsapp: '08124', alamat: 'Jl Melati' },
          items: [
            { menu_id: 'm1', nama_menu: 'Ayam Bakar', menuId: 'm1', namaMenu: 'Ayam Bakar', harga_satuan: 20000, hargaSaatPesan: 20000, jumlah_porsi: 3, jumlahPorsi: 3, subtotal: 60000 }
          ],
          ongkosKirim: 5000,
          totalTagihan: 65000,
          tanggalPesanan: '2026-10-02',
          tanggal: '2026-10-02',
          waktuPesan: new Date(),
          status: 'diproses'
        }
      ]

      const report = calculateDailyReport(orders)
      expect(report.totalOmset).toBe(110000)
      expect(report.totalPorsiTerjual).toBe(5)
      expect(report.totalPesananSukses).toBe(2)
      expect(report.itemSales['m1'].porsi).toBe(5)
      expect(report.itemSales['m1'].nominal).toBe(100000)
    })
  })

  describe('Invarian Form Pesanan (Ongkir Min 10k & Multi-Item)', () => {
    it('menolak pesanan jika ongkir kurang dari Rp 10.000', () => {
      const mockItems: OrderItem[] = [
        { menuId: 'm1', namaMenu: 'Ayam Bakar', hargaSaatPesan: 20000, jumlahPorsi: 1, subtotal: 20000 }
      ]
      const resultZero = validatePesananInput({ pelangganId: 'p1', items: mockItems, ongkosKirim: 0 })
      const resultUnder = validatePesananInput({ pelangganId: 'p1', items: mockItems, ongkosKirim: 5000 })
      const resultValid = validatePesananInput({ pelangganId: 'p1', items: mockItems, ongkosKirim: 10000 })

      expect(resultZero.isValid).toBe(false)
      expect(resultZero.error).toContain('10.000')

      expect(resultUnder.isValid).toBe(false)
      expect(resultUnder.error).toContain('10.000')

      expect(resultValid.isValid).toBe(true)
    })

    it('menolak pesanan tanpa pelanggan atau tanpa item menu', () => {
      const mockItems: OrderItem[] = [
        { menuId: 'm1', namaMenu: 'Ayam Bakar', hargaSaatPesan: 20000, jumlahPorsi: 1, subtotal: 20000 }
      ]
      const noPelanggan = validatePesananInput({ pelangganId: '', items: mockItems, ongkosKirim: 10000 })
      const noItems = validatePesananInput({ pelangganId: 'p1', items: [], ongkosKirim: 10000 })

      expect(noPelanggan.isValid).toBe(false)
      expect(noPelanggan.error).toContain('pelanggan')

      expect(noItems.isValid).toBe(false)
      expect(noItems.error).toContain('minimal 1 menu')
    })
  })
})
