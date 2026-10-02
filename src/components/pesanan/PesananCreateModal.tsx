import React, { useState } from 'react'
import { Plus, Minus, ShoppingBag, Check, X } from 'lucide-react'
import { Menu, Pelanggan, OrderItem } from '../../types'
import { createPesanan } from '../../services/pesananService'
import { useAlert } from '../../context/AlertContext'
import { Button } from '../ui/button'

interface Props {
  isOpen: boolean
  onClose: () => void
  menuList: Menu[]
  pelangganList: Pelanggan[]
}

export const PesananCreateModal: React.FC<Props> = ({
  isOpen,
  onClose,
  menuList,
  pelangganList,
}) => {
  const [selectedPelangganId, setSelectedPelangganId] = useState('')
  const [cart, setCart] = useState<Record<string, number>>({})
  const [ongkir, setOngkir] = useState<number>(10000)
  const [catatan, setCatatan] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const { showAlert } = useAlert()

  if (!isOpen) return null

  const handleQtyChange = (menuId: string, delta: number, maxStok: number) => {
    const current = cart[menuId] || 0
    const next = current + delta
    if (next < 0) return
    if (next > maxStok) {
      showAlert('Stok Terbatas', `Stok ${menuList.find(m => m.id === menuId)?.nama || ''} hanya tersisa ${maxStok} porsi!`, 'destructive')
      return
    }
    if (next === 0) {
      const copy = { ...cart }
      delete copy[menuId]
      setCart(copy)
    } else {
      setCart({ ...cart, [menuId]: next })
    }
  }

  // Hitung subtotal & total
  const items: OrderItem[] = Object.entries(cart).map(([menuId, qty]) => {
    const menu = menuList.find((m) => m.id === menuId)!
    return {
      menuId,
      namaMenu: menu.nama,
      hargaSaatPesan: menu.harga,
      jumlahPorsi: qty,
      subtotal: menu.harga * qty,
    }
  })

  const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0)
  const totalTagihan = subtotal > 0 ? subtotal + (ongkir || 0) : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!selectedPelangganId) {
      setErrorMsg('Pilih pelanggan terlebih dahulu')
      return
    }
    if (items.length === 0) {
      setErrorMsg('Pilih minimal 1 menu katering')
      return
    }

    const pelanggan = pelangganList.find((p) => p.id === selectedPelangganId)
    if (!pelanggan) return

    setLoading(true)
    try {
      await createPesanan({
        pelangganId: pelanggan.id,
        pelangganSnapshot: {
          nama: pelanggan.nama,
          nomorWhatsapp: pelanggan.nomorWhatsapp,
          alamat: pelanggan.alamat,
        },
        items,
        ongkosKirim: ongkir || 0,
        catatanPesanan: catatan,
      })
      // Reset form & pemicu Alert Berhasil + Tutup Modal (Poin 5 & 6)
      setCart({})
      setSelectedPelangganId('')
      setCatatan('')
      showAlert('Pesanan Dibuat', `Pesanan untuk ${pelanggan.nama} berhasil disimpan dengan status Menunggu Pembayaran.`)
      onClose()
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal membuat pesanan')
      showAlert('Gagal Membuat Pesanan', err.message || 'Terjadi kesalahan', 'destructive')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h2 className="font-heading font-semibold text-foreground text-sm">Buat Pesanan Katering Baru</h2>
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-sm">
          {errorMsg && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-xl text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* 1. Pilih Pelanggan */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Pilih Pelanggan <span className="text-destructive">*</span>
            </label>
            {pelangganList.length === 0 ? (
              <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                Belum ada data pelanggan. Tambahkan pelanggan terlebih dahulu di tab Pelanggan.
              </p>
            ) : (
              <select
                required
                value={selectedPelangganId}
                onChange={(e) => setSelectedPelangganId(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-xs"
              >
                <option value="">-- Pilih Nama Pelanggan --</option>
                {pelangganList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama} ({p.nomorWhatsapp}) - {p.alamat.slice(0, 30)}...
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 2. Pilih Menu & Porsi */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Pilih Menu & Jumlah Porsi <span className="text-destructive">*</span>
            </label>
            <div className="border border-border rounded-xl divide-y divide-border max-h-56 overflow-y-auto bg-muted/20">
              {menuList.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  Belum ada menu yang tersedia.
                </div>
              ) : (
                menuList.map((menu) => {
                  const qty = cart[menu.id] || 0
                  const isHabis = menu.sisaPorsi <= 0

                  return (
                    <div
                      key={menu.id}
                      className="p-3 flex items-center justify-between gap-2 hover:bg-muted/40 transition"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {menu.nama}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-primary font-semibold tabular-nums">
                            Rp {menu.harga.toLocaleString('id-ID')}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                              isHabis
                                ? 'bg-muted text-muted-foreground'
                                : 'bg-secondary text-secondary-foreground'
                            }`}
                          >
                            Stok: {menu.sisaPorsi}
                          </span>
                        </div>
                      </div>

                      {/* Counter */}
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-xs"
                          onClick={() => handleQtyChange(menu.id, -1, menu.sisaPorsi)}
                          disabled={qty <= 0}
                          className="rounded-lg"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-6 text-center text-xs font-bold tabular-nums">
                          {qty}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-xs"
                          onClick={() => handleQtyChange(menu.id, 1, menu.sisaPorsi)}
                          disabled={isHabis || qty >= menu.sisaPorsi}
                          className="rounded-lg"
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

          {/* 3. Ongkos Kirim & Catatan */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Ongkos Kirim (Rp)
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={ongkir}
                onChange={(e) => setOngkir(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Catatan Pesanan
              </label>
              <input
                type="text"
                placeholder="Tanpa pedas, jam 12, dll."
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-xs"
              />
            </div>
          </div>

          {/* Ringkasan Total */}
          <div className="p-3.5 bg-muted/40 rounded-xl space-y-1.5 text-xs border border-border">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal Makanan:</span>
              <span className="font-semibold tabular-nums text-foreground">
                Rp {subtotal.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Ongkos Kirim:</span>
              <span className="font-semibold tabular-nums text-foreground">
                Rp {(ongkir || 0).toLocaleString('id-ID')}
              </span>
            </div>
            <div className="pt-2 border-t border-border flex justify-between font-bold text-sm text-foreground">
              <span>Total Tagihan:</span>
              <span className="text-primary tabular-nums">
                Rp {totalTagihan.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading || items.length === 0 || !selectedPelangganId}
              className="gap-1.5 font-semibold"
            >
              <Check className="w-4 h-4" />
              Simpan Pesanan
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
