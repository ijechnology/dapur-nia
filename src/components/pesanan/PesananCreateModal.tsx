import React, { useState } from 'react'
import { X, Plus, Minus, ShoppingBag, Check } from 'lucide-react'
import { Menu, Pelanggan, OrderItem } from '../../types'
import { createPesanan } from '../../services/pesananService'

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

  if (!isOpen) return null

  const handleQtyChange = (menuId: string, delta: number, maxStok: number) => {
    const current = cart[menuId] || 0
    const next = current + delta
    if (next < 0) return
    if (next > maxStok) {
      alert(`Stok hanya tersisa ${maxStok} porsi!`)
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
      // Reset form
      setCart({})
      setSelectedPelangganId('')
      setCatatan('')
      onClose()
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal membuat pesanan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-xl border border-neutral-200 shadow-xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 bg-neutral-50/50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#C85A32]" />
            <h2 className="font-semibold text-neutral-800 text-sm">Buat Pesanan Katering Baru</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-sm">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* 1. Pilih Pelanggan */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Pilih Pelanggan <span className="text-red-500">*</span>
            </label>
            {pelangganList.length === 0 ? (
              <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                Belum ada data pelanggan. Tambahkan pelanggan terlebih dahulu di tab Pelanggan.
              </p>
            ) : (
              <select
                required
                value={selectedPelangganId}
                onChange={(e) => setSelectedPelangganId(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85A32] text-xs bg-white"
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
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Pilih Menu & Jumlah Porsi <span className="text-red-500">*</span>
            </label>
            <div className="border border-neutral-200 rounded-xl divide-y divide-neutral-100 max-h-56 overflow-y-auto bg-neutral-50/40">
              {menuList.length === 0 ? (
                <div className="p-4 text-center text-xs text-neutral-400">
                  Belum ada menu yang tersedia.
                </div>
              ) : (
                menuList.map((menu) => {
                  const qty = cart[menu.id] || 0
                  const isHabis = menu.sisaPorsi <= 0

                  return (
                    <div
                      key={menu.id}
                      className="p-3 flex items-center justify-between gap-2 hover:bg-neutral-100/50 transition"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-neutral-900 truncate">
                          {menu.nama}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-[#C85A32] font-semibold tabular-nums">
                            Rp {menu.harga.toLocaleString('id-ID')}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                              isHabis
                                ? 'bg-neutral-200 text-neutral-600'
                                : 'bg-emerald-50 text-emerald-800'
                            }`}
                          >
                            Stok: {menu.sisaPorsi}
                          </span>
                        </div>
                      </div>

                      {/* Counter */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleQtyChange(menu.id, -1, menu.sisaPorsi)}
                          disabled={qty <= 0}
                          className="w-6 h-6 rounded border border-neutral-300 flex items-center justify-center text-neutral-700 hover:bg-neutral-200 disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold tabular-nums">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQtyChange(menu.id, 1, menu.sisaPorsi)}
                          disabled={isHabis || qty >= menu.sisaPorsi}
                          className="w-6 h-6 rounded border border-neutral-300 flex items-center justify-center text-neutral-700 hover:bg-neutral-200 disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
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
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Ongkos Kirim (Rp)
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={ongkir}
                onChange={(e) => setOngkir(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85A32] text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Catatan Pesanan
              </label>
              <input
                type="text"
                placeholder="Tanpa pedas, jam 12, dll."
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85A32] text-xs"
              />
            </div>
          </div>

          {/* Ringkasan Total */}
          <div className="p-3.5 bg-neutral-100 rounded-xl space-y-1.5 text-xs">
            <div className="flex justify-between text-neutral-600">
              <span>Subtotal Makanan:</span>
              <span className="font-semibold tabular-nums">
                Rp {subtotal.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Ongkos Kirim:</span>
              <span className="font-semibold tabular-nums">
                Rp {(ongkir || 0).toLocaleString('id-ID')}
              </span>
            </div>
            <div className="pt-2 border-t border-neutral-200 flex justify-between font-bold text-sm text-neutral-900">
              <span>Total Tagihan:</span>
              <span className="text-[#C85A32] tabular-nums">
                Rp {totalTagihan.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || items.length === 0 || !selectedPelangganId}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#C85A32] hover:bg-[#b44b25] rounded-lg shadow-sm transition active:scale-98 disabled:opacity-40"
            >
              <Check className="w-4 h-4" />
              Simpan Pesanan
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
