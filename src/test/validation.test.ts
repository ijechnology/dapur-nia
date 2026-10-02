import { describe, it, expect } from 'vitest'
import {
  validateMenuInput,
  normalizeWhatsApp,
  isValidWhatsApp,
  canTransitionStatus,
  calculateOrderTotal,
  calculateDailyReport
} from '../lib/validation'
import { Menu, Pesanan, OrderItem } from '../types'

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
      // Porsi 0 sah (status habis)
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

  describe('Invarian & Mesin Transisi Status Pesanan', () => {
    it('mengizinkan transisi maju yang sah', () => {
      expect(canTransitionStatus('menunggu_pembayaran', 'dikonfirmasi')).toBe(true)
      expect(canTransitionStatus('dikonfirmasi', 'diproses')).toBe(true)
      expect(canTransitionStatus('diproses', 'dikirim')).toBe(true)
      expect(canTransitionStatus('dikirim', 'selesai')).toBe(true)
    })

    it('mengizinkan pembatalan hanya dari status awal', () => {
      expect(canTransitionStatus('menunggu_pembayaran', 'dibatalkan')).toBe(true)
      expect(canTransitionStatus('dikonfirmasi', 'dibatalkan')).toBe(true)
      // Tidak boleh membatalkan pesanan yang sudah dikirim atau selesai
      expect(canTransitionStatus('dikirim', 'dibatalkan')).toBe(false)
      expect(canTransitionStatus('selesai', 'dibatalkan')).toBe(false)
    })

    it('menolak transisi melompat atau mundur', () => {
      // Melompat
      expect(canTransitionStatus('menunggu_pembayaran', 'selesai')).toBe(false)
      expect(canTransitionStatus('dikonfirmasi', 'dikirim')).toBe(false)
      // Mundur
      expect(canTransitionStatus('diproses', 'dikonfirmasi')).toBe(false)
      expect(canTransitionStatus('selesai', 'dikirim')).toBe(false)
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

    it('mengembalikan 0 atau error jika tidak ada item', () => {
      expect(calculateOrderTotal([], 10000)).toBe(0)
    })
  })

  describe('Agregasi Modul Laporan Harian', () => {
    it('mengakumulasi omset dan porsi terjual, serta mengabaikan pesanan dibatalkan', () => {
      const orders: Pesanan[] = [
        {
          id: '1',
          nomorPesanan: 'DN-001',
          pelangganId: 'p1',
          pelangganSnapshot: { nama: 'Budi', nomorWhatsapp: '08123', alamat: 'Jl Mawar' },
          items: [
            { menuId: 'm1', namaMenu: 'Ayam Bakar', hargaSaatPesan: 20000, jumlahPorsi: 2, subtotal: 40000 }
          ],
          ongkosKirim: 5000,
          totalTagihan: 45000,
          tanggalPesanan: '2026-10-02',
          waktuPesan: new Date(),
          status: 'selesai'
        },
        {
          id: '2',
          nomorPesanan: 'DN-002',
          pelangganId: 'p2',
          pelangganSnapshot: { nama: 'Siti', nomorWhatsapp: '08124', alamat: 'Jl Melati' },
          items: [
            { menuId: 'm1', namaMenu: 'Ayam Bakar', hargaSaatPesan: 20000, jumlahPorsi: 3, subtotal: 60000 }
          ],
          ongkosKirim: 5000,
          totalTagihan: 65000,
          tanggalPesanan: '2026-10-02',
          waktuPesan: new Date(),
          status: 'dibatalkan' // HARUS DIABAIKAN
        }
      ]

      const report = calculateDailyReport(orders)
      expect(report.totalOmset).toBe(45000)
      expect(report.totalPorsiTerjual).toBe(2)
      expect(report.totalPesananSukses).toBe(1)
      expect(report.itemSales['m1'].porsi).toBe(2)
      expect(report.itemSales['m1'].nominal).toBe(40000)
    })
  })
})
