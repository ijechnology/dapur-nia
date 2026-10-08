import React, { useState } from 'react'
import { Lock, Mail, User as UserIcon, Phone, ArrowLeft, MapPin } from 'lucide-react'
import { useAuth, getAuthErrorMessage } from '../../context/AuthContext'
import { useAlert } from '../../context/AlertContext'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'

import { UserRole } from '../../types'

interface Props {
  onSuccess: (role?: UserRole) => void
  onCancel: () => void
  initialMode?: 'login' | 'register'
  hintMessage?: string
}

export const AuthPage: React.FC<Props> = ({
  onSuccess,
  onCancel,
  initialMode = 'login',
  hintMessage,
}) => {
  const { signIn, signUp } = useAuth()
  const { showAlert } = useAlert()

  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const [namaLengkap, setNamaLengkap] = useState('')
  const [email, setEmail] = useState('')
  const [noWhatsapp, setNoWhatsapp] = useState('')
  const [alamat, setAlamat] = useState('')
  const [kataSandi, setKataSandi] = useState('')
  const [konfirmasiSandi, setKonfirmasiSandi] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!email.trim() || !kataSandi.trim()) {
      setErrorMessage('Harap isi alamat email dan kata sandi.')
      return
    }

    if (mode === 'register') {
      if (!namaLengkap.trim()) {
        setErrorMessage('Nama lengkap wajib diisi.')
        return
      }
      if (!noWhatsapp.trim()) {
        setErrorMessage('Nomor WhatsApp aktif wajib diisi (diawali 08).')
        return
      }
      if (kataSandi.length < 6) {
        setErrorMessage('Kata sandi minimal 6 karakter.')
        return
      }
      if (kataSandi !== konfirmasiSandi) {
        setErrorMessage('Konfirmasi kata sandi tidak sesuai.')
        return
      }
    }

    try {
      setLoading(true)
      let loggedUser: any
      if (mode === 'login') {
        loggedUser = await signIn(email, kataSandi)
        showAlert('Berhasil Masuk', `Selamat datang kembali, ${loggedUser.displayName || 'di Dapur Nia'}!`)
      } else {
        // Pendaftaran dari portal publik otomatis sebagai akun pelanggan dengan alamat
        loggedUser = await signUp(namaLengkap, email, kataSandi, noWhatsapp, alamat, 'pelanggan')
        showAlert('Pendaftaran Berhasil', `Akun atas nama ${namaLengkap} berhasil didaftarkan.`)
      }
      onSuccess(loggedUser?.role || 'pelanggan')
    } catch (err: any) {
      console.error('Auth error:', err)
      const friendlyMsg = err?.code ? getAuthErrorMessage(err.code) : err.message || 'Terjadi kesalahan autentikasi'
      setErrorMessage(friendlyMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 py-2 max-w-md mx-auto">
      {/* Tombol kembali ke Beranda Menu */}
      <button
        onClick={onCancel}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Kembali ke Daftar Menu
      </button>

      {/* Card Autentikasi Siap Pakai */}
      <Card className="border-border shadow-xs overflow-hidden rounded-2xl">
        {/* Header Bersih */}
        <div className="p-5 border-b border-border bg-neutral-50 dark:bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
              DN
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground tracking-tight">
                Dapur Nia Katering
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {hintMessage || (mode === 'login' ? 'Masuk untuk mengelola pesanan katering Anda' : 'Daftar akun pelanggan untuk mulai memesan')}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher: Masuk vs Daftar */}
        <div className="p-1 mx-5 mt-4 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex border border-neutral-200 dark:border-neutral-700">
          <button
            type="button"
            onClick={() => {
              setMode('login')
              setErrorMessage(null)
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white dark:bg-card text-foreground shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Masuk Akun
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register')
              setErrorMessage(null)
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-white dark:bg-card text-foreground shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Daftar Pelanggan Baru
          </button>
        </div>

        <CardHeader className="px-5 pt-3 pb-1">
          <CardTitle className="text-sm font-bold">
            {mode === 'login' ? 'Masuk ke Akun Anda' : 'Registrasi Akun Pelanggan'}
          </CardTitle>
          <CardDescription className="text-xs">
            {mode === 'login'
              ? 'Masukkan email dan kata sandi yang telah terdaftar.'
              : 'Lengkapi identitas Anda untuk kemudahan pengantaran katering.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-5 pb-6">
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Field Nama Lengkap */}
            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Contoh: Ibu Rina"
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  disabled={loading}
                  required
                  className="text-xs"
                />
              </div>
            )}

            {/* Field WhatsApp untuk Pelanggan */}
            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                  Nomor WhatsApp <span className="text-red-500">*</span>
                </label>
                <Input
                  type="tel"
                  placeholder="081234567890"
                  value={noWhatsapp}
                  onChange={(e) => setNoWhatsapp(e.target.value.replace(/\D/g, ''))}
                  disabled={loading}
                  required
                  className="text-xs font-mono"
                />
                <p className="text-[10px] text-muted-foreground">Diawali 08 (10-13 digit angka)</p>
              </div>
            )}

            {/* Field Alamat Pengiriman Utama */}
            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                  Alamat Pengiriman Utama (Opsional)
                </label>
                <Input
                  type="text"
                  placeholder="Nama jalan, nomor rumah dalam kompleks"
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  disabled={loading}
                  className="text-xs"
                />
              </div>
            )}

            {/* Field Email */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                Alamat Email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                className="text-xs"
              />
            </div>

            {/* Field Kata Sandi */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                Kata Sandi <span className="text-red-500">*</span>
              </label>
              <Input
                type="password"
                placeholder="Minimal 6 karakter"
                value={kataSandi}
                onChange={(e) => setKataSandi(e.target.value)}
                disabled={loading}
                required
                className="text-xs"
              />
            </div>

            {/* Field Konfirmasi Kata Sandi */}
            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                  Ulangi Kata Sandi <span className="text-red-500">*</span>
                </label>
                <Input
                  type="password"
                  placeholder="Ulangi kata sandi"
                  value={konfirmasiSandi}
                  onChange={(e) => setKonfirmasiSandi(e.target.value)}
                  disabled={loading}
                  required
                  className="text-xs"
                />
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs rounded-xl font-medium">
                {errorMessage}
              </div>
            )}

            {/* Tombol Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full text-xs font-bold h-9 shadow-xs mt-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg cursor-pointer"
            >
              {loading ? 'Memproses...' : mode === 'login' ? 'Masuk Sekarang' : 'Daftar Akun Pelanggan'}
            </Button>
          </form>

          {/* Akses Tim Pengelola Katering (Dina & Rani) */}
          <div className="mt-5 pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Akses Internal Staf & Pemilik
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mb-2.5 leading-relaxed">
              Klik akun di bawah untuk mengisi kredensial masuk pengelola katering:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setEmail('pemilik@dapurnia.com')
                  setKataSandi('dina123')
                  setErrorMessage(null)
                }}
                className="p-2.5 text-left bg-neutral-50 dark:bg-neutral-900 border border-border hover:border-primary rounded-xl transition cursor-pointer"
              >
                <div className="font-bold text-xs text-foreground">Dina (Pemilik)</div>
                <div className="text-[10px] text-muted-foreground truncate mt-0.5">pemilik@dapurnia.com</div>
                <div className="text-[9px] text-primary font-semibold mt-1">Sandi: dina123</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setEmail('staf@dapurnia.com')
                  setKataSandi('rani123')
                  setErrorMessage(null)
                }}
                className="p-2.5 text-left bg-neutral-50 dark:bg-neutral-900 border border-border hover:border-primary rounded-xl transition cursor-pointer"
              >
                <div className="font-bold text-xs text-foreground">Rani (Staf Dapur)</div>
                <div className="text-[10px] text-muted-foreground truncate mt-0.5">staf@dapurnia.com</div>
                <div className="text-[9px] text-primary font-semibold mt-1">Sandi: rani123</div>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
