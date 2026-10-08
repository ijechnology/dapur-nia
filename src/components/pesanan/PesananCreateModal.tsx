import React, { useState, useEffect } from 'react'
import { Plus, Minus, ShoppingBag, Check, X, AlertCircle, User } from 'lucide-react'
import { Menu, Pelanggan, OrderItem } from '../../types'
import { createPesanan } from '../../services/pesananService'
import { upsertPelangganForUser } from '../../services/pelangganService'
import { validatePesananInput, normalizeWhatsApp } from '../../lib/validation'
import { useAlert } from '../../context/AlertContext'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../ui/button'
import { AriakitSelect } from '../ui/AriakitSelect'

interface Props {
  isOpen: boolean
  onClose: () => void
  menuList: Menu[]
  pelangganList: Pelanggan[]
  initialCart?: Record<string, number>
  onOrderSuccess?: () => void
}

export const PesananCreateModal: React.FC<Props> = ({
  isOpen,
  onClose,
  menuList,
  pelangganList,
  initialCart,
  onOrderSuccess,
}) => {
  const { user } = useAuth()
  const isPelanggan = user?.role === 'pelanggan'

  // Form states
  const [selectedPelangganId, setSelectedPelangganId] = useState('')
  const [namaPenerima, setNamaPenerima] = useState('')
  const [waPenerima, setWaPenerima] = useState('')
  const [alamatKirim, setAlamatKirim] = useState('')
  const [cart, setCart] = useState<Record<string, number>>({})
  const [catatan, setCatatan] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)

  // Ongkos kirim tetap Rp 10.000 sesuai MoM Aturan Operasional 2
  const ONGKIR_TETAP = 10000

  const { showAlert } = useAlert()

  // Inisialisasi cart dan profil pelanggan saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setErrorMsg('')
      if (initialCart && Object.keys(initialCart).length > 0) {
        setCart({ ...initialCart })
      } else {
        setCart({})
      }
      setCatatan('')

      // Jika login sebagai pelanggan: otomatis isi nama, WA, dan cari alamat
      if (isPelanggan && user) {
        const uWA = user.nomorWhatsapp || user.noWhatsapp || ''
        const uNama = (user.displayName && !user.displayName.includes('@')) ? user.displayName : ''

        // Cari data pelanggan di buku pelanggan Dapur Nia (prioritas email/UID terlebih dahulu)
        const matched = pelangganList.find(
          (p) =>
            (user.email && p.email?.toLowerCase() === user.email.toLowerCase()) ||
            (user.uid && p.uid === user.uid) ||
            (uWA && (normalizeWhatsApp(p.nomorWhatsapp || p.no_whatsapp || '') === normalizeWhatsApp(uWA))) ||
            (uNama && p.nama.toLowerCase() === uNama.toLowerCase())
        )

        const finalNama = uNama || matched?.nama || ''
        const finalWA = uWA || matched?.nomorWhatsapp || matched?.no_whatsapp || ''
        const userAlamat = user.alamat || (matched?.alamat && matched.alamat !== 'Bandung' ? matched.alamat : '') || matched?.alamat || ''

        setNamaPenerima(finalNama)
        setWaPenerima(finalWA)
        setAlamatKirim(userAlamat)
        setSelectedPelangganId(matched?.id || finalWA || `cust-${user.uid}`)
      } else {
        setSelectedPelangganId('')
        setNamaPenerima('')
        setWaPenerima('')
        setAlamatKirim('')
      }
    }
  }, [isOpen, initialCart, user, isPelanggan, pelangganList])

  if (!isOpen) return null

  const handleQtyChange = (menuId: string, delta: number, maxStok: number) => {
    const current = cart[menuId] || 0
    const next = current + delta
    if (next < 0) return
    if (next > maxStok) {
      showAlert(
        'Stok Terbatas',
        `Stok ${menuList.find((m) => m.id === menuId)?.nama || ''} hanya tersisa ${maxStok} porsi!`,
        'destructive'
      )
      return
    }
    setCart((prev) => {
      const updated = { ...prev }
      if (next === 0) {
        delete updated[menuId]
      } else {
        updated[menuId] = next
      }
      return updated
    })
  }

  const items: OrderItem[] = Object.entries(cart)
    .filter(([_, qty]) => qty > 0)
    .map(([menuId, qty]) => {
      const menu = menuList.find((m) => m.id === menuId)
      return {
        menu_id: menuId,
        menuId,
        nama_menu: menu?.nama || '',
        namaMenu: menu?.nama || '',
        harga_satuan: menu?.harga || 0,
        hargaSaatPesan: menu?.harga || 0,
        jumlah_porsi: qty,
        jumlahPorsi: qty,
        subtotal: (menu?.harga || 0) * qty,
      }
    })

  const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0)
  const totalTagihan = subtotal > 0 ? subtotal + ONGKIR_TETAP : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (items.length === 0) {
      setErrorMsg('Pilih minimal 1 porsi menu katering')
      return
    }

    let finalPelangganId = selectedPelangganId
    let finalNama = namaPenerima.trim()
    let finalWA = waPenerima.trim()
    let finalAlamat = alamatKirim.trim()

    // Jika pengelola memilih dari dropdown
    if (!isPelanggan) {
      const p = pelangganList.find((item) => item.id === selectedPelangganId)
      if (!p) {
        setErrorMsg('Pilih pelanggan terlebih dahulu')
        return
      }
      finalPelangganId = p.id
      finalNama = p.nama
      finalWA = p.no_whatsapp || p.nomorWhatsapp || p.id
      finalAlamat = p.alamat
    } else {
      // Jika pelanggan memesan sendiri, validasi input identitas
      if (!finalNama) {
        setErrorMsg('Nama penerima wajib diisi')
        return
      }
      if (!finalWA) {
        setErrorMsg('Nomor WhatsApp wajib diisi')
        return
      }
      if (!finalAlamat) {
        setErrorMsg('Alamat lengkap pengiriman wajib diisi')
        return
      }
      finalPelangganId = normalizeWhatsApp(finalWA)
    }

    // Validasi aturan ongkir min 10k dan data pesanan
    const validation = validatePesananInput({
      pelangganId: finalPelangganId,
      items,
      ongkosKirim: ONGKIR_TETAP,
    })

    if (!validation.isValid) {
      setErrorMsg(validation.error || 'Data pesanan tidak valid')
      return
    }

    setLoading(true)
    try {
      await createPesanan({
        pelangganId: finalPelangganId,
        pelangganSnapshot: {
          nama: finalNama,
          nomorWhatsapp: finalWA,
          alamat: finalAlamat,
        },
        items,
        ongkosKirim: ONGKIR_TETAP,
        catatanPesanan: catatan.trim(),
        user_id: user?.uid,
        user_email: user?.email || undefined,
      })

      // Sinkronkan data pelanggan ke koleksi 'pelanggan' di Firestore agar profil tersimpan permanen
      if (user && isPelanggan && user.email) {
        try {
          await upsertPelangganForUser({
            nama: finalNama,
            email: user.email,
            uid: user.uid,
            no_whatsapp: finalWA,
            alamat: finalAlamat,
          })
        } catch (syncErr) {
          console.warn('Sinkronisasi profil pesanan pelanggan:', syncErr)
        }
      }

      setCart({})
      setCatatan('')
      showAlert(
        'Pesanan Dibuat',
        `Pesanan untuk ${finalNama} berhasil disimpan dengan status Menunggu Bayar.`
      )
      if (onOrderSuccess) onOrderSuccess()
      onClose()
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal membuat pesanan')
      showAlert('Gagal Membuat Pesanan', err.message || 'Terjadi kesalahan', 'destructive')
    } finally {
      setLoading(false)
    }
  }

  // Opsi dropdown pelanggan untuk pengelola
  const pelangganOptions = pelangganList.map((p) => ({
    value: p.id,
    label: `${p.nama} (${p.nomorWhatsapp || p.no_whatsapp || '-'}) - ${(p.alamat || '').slice(0, 30)}`,
  }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] relative z-50">
        {/* Header Sticky (Shrink-0) */}
        <div className="shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-border bg-neutral-50 dark:bg-neutral-900/40">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h2 className="font-heading font-bold text-foreground text-sm">
              {isPelanggan ? 'Konfirmasi Pemesanan Katering' : 'Buat Pesanan Katering Baru'}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onClose}
            className="text-neutral-500 hover:text-foreground cursor-pointer rounded-lg"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Form Body Scrollable (Anti-Overbig) */}
        <form
          id="pesanan-create-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-5 space-y-4 text-sm bg-white dark:bg-card overscroll-contain"
        >
          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-xs font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Bagian Informasi Pelanggan */}
          {isPelanggan ? (
            /* Tampilan Pelanggan yang Memesan Sendiri */
            <div className="p-3.5 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-border space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary" /> Penerima & Pengiriman
                </span>
                <span className="text-[11px] text-neutral-500">Akun Anda</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-0.5">Nama Penerima</label>
                  <input
                    type="text"
                    required
                    value={namaPenerima}
                    onChange={(e) => setNamaPenerima(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-input rounded-lg text-xs bg-white dark:bg-card text-foreground focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-0.5">Nomor WhatsApp</label>
                  <input
                    type="tel"
                    required
                    value={waPenerima}
                    onChange={(e) => setWaPenerima(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-input rounded-lg text-xs font-mono bg-white dark:bg-card text-foreground focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground block mb-0.5">
                  Alamat Lengkap Pengiriman <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Nama jalan, nomor rumah, RT/RW dalam kompleks..."
                  value={alamatKirim}
                  onChange={(e) => setAlamatKirim(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-input rounded-lg text-xs bg-white dark:bg-card text-foreground focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          ) : (
            /* Tampilan untuk Pengelola (Dina / Rani) */
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Pilih Pelanggan <span className="text-red-500">*</span>
              </label>
              {pelangganList.length === 0 ? (
                <p className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  Belum ada data pelanggan. Tambahkan pelanggan terlebih dahulu di tab Pelanggan.
                </p>
              ) : (
                <AriakitSelect
                  value={selectedPelangganId}
                  onChange={setSelectedPelangganId}
                  options={pelangganOptions}
                  placeholder="-- Pilih Nama Pelanggan --"
                />
              )}
            </div>
          )}

          {/* 2. Menu Dipesan (Multi-Menu Otomatis Masuk) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-foreground">
                Rincian Porsi Menu <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-muted-foreground font-medium">
                {items.length} menu dipilih
              </span>
            </div>
            <div className="border border-border rounded-xl divide-y divide-border max-h-48 overflow-y-auto bg-neutral-50/50 dark:bg-neutral-900/20">
              {menuList.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  Belum ada menu yang tersedia.
                </div>
              ) : (
                menuList.map((menu) => {
                  const qty = cart[menu.id] || 0
                  const stock = menu.sisa_porsi ?? menu.sisaPorsi ?? 0
                  const isHabis = stock <= 0

                  return (
                    <div
                      key={menu.id}
                      className={`p-2.5 flex items-center justify-between gap-2 transition rounded-lg ${
                        qty > 0 ? 'bg-primary/5 border border-primary/20' : 'hover:bg-muted/40'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {menu.nama}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-primary font-bold tabular-nums">
                            Rp {menu.harga.toLocaleString('id-ID')}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {isHabis ? 'Habis' : `Sisa ${stock}`}
                          </span>
                        </div>
                      </div>

                      {/* Counter */}
                      <div className="flex items-center gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-xs"
                          onClick={() => handleQtyChange(menu.id, -1, stock)}
                          disabled={qty <= 0}
                          className="h-6 w-6 rounded-md bg-white dark:bg-card cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-5 text-center text-xs font-bold tabular-nums">
                          {qty}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-xs"
                          onClick={() => handleQtyChange(menu.id, 1, stock)}
                          disabled={isHabis || qty >= stock}
                          className="h-6 w-6 rounded-md bg-white dark:bg-card cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* 3. Ongkos Kirim Tetap & Catatan Pesanan */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Ongkos Kirim
              </label>
              <div className="px-3 py-2 border border-border rounded-xl bg-neutral-100 dark:bg-neutral-800 text-foreground text-xs font-mono flex items-center justify-between">
                <span>Rp {ONGKIR_TETAP.toLocaleString('id-ID')}</span>
                <span className="text-[10px] text-muted-foreground font-sans">Tetap</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Catatan (Opsional)
              </label>
              <input
                type="text"
                placeholder="Tanpa pedas, jam 12, dll."
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-xl bg-white dark:bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs shadow-2xs"
              />
            </div>
          </div>

          {/* Ringkasan Total Tagihan */}
          <div className="p-3.5 bg-neutral-50 dark:bg-neutral-900/40 rounded-xl space-y-1.5 text-xs border border-border">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal Makanan ({items.reduce((s, i) => s + (i.jumlah_porsi || 0), 0)} porsi):</span>
              <span className="font-semibold tabular-nums text-foreground">
                Rp {subtotal.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Ongkos Kirim Kompleks:</span>
              <span className="font-semibold tabular-nums text-foreground">
                Rp {ONGKIR_TETAP.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="pt-2 border-t border-border flex justify-between font-bold text-sm text-foreground">
              <span>Total Tagihan:</span>
              <span className="text-primary font-bold tabular-nums">
                Rp {totalTagihan.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </form>

        {/* Footer Sticky (Shrink-0) - Tombol Selalu Terlihat & Responsif */}
        <div className="shrink-0 p-4 border-t border-border bg-neutral-50/90 dark:bg-card/90 flex items-center justify-end gap-2 backdrop-blur-xs">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="cursor-pointer rounded-lg text-xs"
          >
            Batal
          </Button>
          <Button
            type="submit"
            form="pesanan-create-form"
            size="sm"
            disabled={loading || items.length === 0}
            className="gap-1.5 font-bold cursor-pointer shadow-xs bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs"
          >
            <Check className="w-4 h-4" />
            {isPelanggan ? 'Kirim Pesanan' : 'Simpan Pesanan'}
          </Button>
        </div>
      </div>
    </div>
  )
}
