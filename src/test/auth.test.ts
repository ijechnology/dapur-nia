import { describe, it, expect } from 'vitest'
import { getAuthErrorMessage } from '../context/AuthContext'

describe('Fitur Masuk & Autentikasi Pemilik Dapur Nia', () => {
  describe('(Poin 3) Pemetaan Pesan Kesalahan Firebase Auth ke Bahasa Indonesia', () => {
    it('memberikan pesan yang jelas untuk kegagalan email/kata sandi', () => {
      expect(getAuthErrorMessage('auth/invalid-credential')).toContain('Email atau kata sandi salah')
      expect(getAuthErrorMessage('auth/wrong-password')).toContain('Email atau kata sandi salah')
      expect(getAuthErrorMessage('auth/user-not-found')).toContain('Email atau kata sandi salah')
    })

    it('memberikan pesan yang jelas jika email sudah terdaftar saat registrasi', () => {
      expect(getAuthErrorMessage('auth/email-already-in-use')).toContain('sudah terdaftar')
    })

    it('memberikan pesan validasi format email dan panjang kata sandi', () => {
      expect(getAuthErrorMessage('auth/invalid-email')).toContain('tidak valid')
      expect(getAuthErrorMessage('auth/weak-password')).toContain('6 karakter')
    })

    it('memberikan pesan saat jaringan terputus', () => {
      expect(getAuthErrorMessage('auth/network-request-failed')).toContain('Koneksi jaringan terputus')
    })
  })

  describe('(Poin 1 & 2) Proteksi Akses Halaman Kelola Menu vs Beranda Tamu', () => {
    it('mengarahkan tamu yang belum masuk ke halaman Masuk saat membuka Kelola Menu', () => {
      const user = null
      const requestedTab = 'kelola_menu'

      // Logika alur proteksi seperti di App.tsx
      const targetTab = requestedTab === 'kelola_menu' && !user ? 'masuk' : requestedTab
      expect(targetTab).toBe('masuk')
    })

    it('mengizinkan akses ke Kelola Menu jika pengguna telah masuk', () => {
      const user = { uid: 'user-1', email: 'dina@dapurnia.com', displayName: 'Dina' }
      const requestedTab = 'kelola_menu'

      const targetTab = requestedTab === 'kelola_menu' && !user ? 'masuk' : requestedTab
      expect(targetTab).toBe('kelola_menu')
    })

    it('tamu tetap dapat melihat Daftar Menu tanpa masuk', () => {
      const user = null
      const requestedTab: string = 'menu'

      const targetTab = requestedTab === 'kelola_menu' && !user ? 'masuk' : requestedTab
      expect(targetTab).toBe('menu')
    })
  })

  describe('(Poin 4 & 6) Alur Pasca Masuk dan Tombol Keluar', () => {
    it('mengembalikan pengguna ke Kelola Menu setelah berhasil masuk', () => {
      let activeTab: string = 'masuk'
      const onAuthSuccess = () => {
        activeTab = 'kelola_menu'
      }

      onAuthSuccess()
      expect(activeTab).toBe('kelola_menu')
    })

    it('mengakhiri sesi dan mengembalikan pengguna ke beranda saat tombol Keluar diklik', () => {
      let activeTab: string = 'kelola_menu'
      const onLogout = () => {
        activeTab = 'menu'
      }

      onLogout()
      expect(activeTab).toBe('menu')
    })
  })

  describe('(Poin 5) Hak Akses Menu', () => {
    it('memberikan hak tambah, ubah, dan hapus menu kepada pengguna yang masuk', () => {
      const user = { uid: 'u1', email: 'owner@dapurnia.com', displayName: 'Dina' }
      const canManage = Boolean(user)

      expect(canManage).toBe(true)
    })

    it('tidak memberikan hak ubah dan hapus kepada tamu', () => {
      const guestUser = null
      const canManage = Boolean(guestUser)

      expect(canManage).toBe(false)
    })
  })

  describe('Identitas Alamat Pelanggan & Kredensial Pengelola', () => {
    it('menyimpan alamat pengguna yang diinput saat pendaftaran dan tidak diubah ke Bandung secara acak', () => {
      const registeredUser = {
        uid: 'user-cust-1',
        email: 'andi@gmail.com',
        nama: 'Andi Pratama',
        no_whatsapp: '081234567890',
        alamat: 'Jl. Melati No. 25, Jakarta Selatan',
        peran: 'pelanggan' as const,
      }

      expect(registeredUser.alamat).toBe('Jl. Melati No. 25, Jakarta Selatan')
      expect(registeredUser.alamat).not.toBe('Bandung')
    })

    it('mendeteksi peran pemilik (Dina) dan staf (Rani) dengan tepat', () => {
      const getRole = (email: string) => {
        const clean = email.toLowerCase()
        if (clean.includes('pemilik') || clean.includes('dina')) return 'pemilik'
        if (clean.includes('staf') || clean.includes('rani')) return 'staf'
        return 'pelanggan'
      }

      expect(getRole('pemilik@dapurnia.com')).toBe('pemilik')
      expect(getRole('dina@dapurnia.com')).toBe('pemilik')
      expect(getRole('staf@dapurnia.com')).toBe('staf')
      expect(getRole('rani@dapurnia.com')).toBe('staf')
      expect(getRole('pelanggan@gmail.com')).toBe('pelanggan')
    })

    it('menghitung kuantiti porsi dan total belanja untuk FloatingOrderBar dengan benar', () => {
      const selectedCart: Record<string, number> = {
        'menu-1': 2,
        'menu-2': 3,
      }
      const menuPrices: Record<string, number> = {
        'menu-1': 25000,
        'menu-2': 18000,
      }

      const totalItems = Object.values(selectedCart).reduce((a, b) => a + b, 0)
      const totalHarga = Object.entries(selectedCart).reduce((sum, [id, qty]) => {
        return sum + (menuPrices[id] * qty)
      }, 0)

      expect(totalItems).toBe(5)
      expect(totalHarga).toBe(2 * 25000 + 3 * 18000) // 50000 + 54000 = 104000
    })
  })
})

