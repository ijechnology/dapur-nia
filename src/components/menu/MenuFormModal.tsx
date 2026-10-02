import React, { useState, useEffect } from 'react'
import { X, Check } from 'lucide-react'
import { Menu } from '../../types'
import { createMenu, updateMenu } from '../../services/menuService'

interface Props {
  isOpen: boolean
  onClose: () => void
  menuToEdit?: Menu | null
}

const KATEGORI_OPTIONS = ['Lauk', 'Sayur', 'Paket', 'Minuman', 'Sambal & Pelengkap']

export const MenuFormModal: React.FC<Props> = ({ isOpen, onClose, menuToEdit }) => {
  const [nama, setNama] = useState('')
  const [deskripsi, setDeskripsi] = useState('')
  const [harga, setHarga] = useState<number | ''>('')
  const [sisaPorsi, setSisaPorsi] = useState<number | ''>('')
  const [kategori, setKategori] = useState('Lauk')
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (menuToEdit) {
      setNama(menuToEdit.nama)
      setDeskripsi(menuToEdit.deskripsi || '')
      setHarga(menuToEdit.harga)
      setSisaPorsi(menuToEdit.sisaPorsi)
      setKategori(menuToEdit.kategori || 'Lauk')
    } else {
      setNama('')
      setDeskripsi('')
      setHarga('')
      setSisaPorsi('')
      setKategori('Lauk')
    }
    setErrorMsg('')
  }, [menuToEdit, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!nama.trim() || nama.trim().length < 3) {
      setErrorMsg('Nama menu minimal 3 karakter')
      return
    }

    const hargaNum = Number(harga)
    if (isNaN(hargaNum) || hargaNum <= 0) {
      setErrorMsg('Harga harus lebih besar dari 0 (tidak boleh negatif atau nol)')
      return
    }

    const porsiNum = Number(sisaPorsi)
    if (isNaN(porsiNum) || porsiNum < 0) {
      setErrorMsg('Sisa porsi tidak boleh negatif')
      return
    }

    setLoading(true)
    try {
      if (menuToEdit) {
        await updateMenu(menuToEdit.id, {
          nama: nama.trim(),
          deskripsi: deskripsi.trim(),
          harga: hargaNum,
          sisaPorsi: porsiNum,
          kategori,
        })
      } else {
        await createMenu({
          nama: nama.trim(),
          deskripsi: deskripsi.trim(),
          harga: hargaNum,
          sisaPorsi: porsiNum,
          kategori,
          tersedia: porsiNum > 0,
        })
      }
      onClose()
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan menu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-xl border border-neutral-200 shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 bg-neutral-50/50">
          <h2 className="font-semibold text-neutral-800 text-sm">
            {menuToEdit ? 'Ubah Menu Katering' : 'Tambah Menu Baru'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Nama Menu <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="contoh: Ayam Bakar Madu"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85A32] text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Kategori</label>
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85A32] text-sm bg-white"
            >
              {KATEGORI_OPTIONS.map((kat) => (
                <option key={kat} value={kat}>
                  {kat}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Harga (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1000"
                step="500"
                placeholder="20000"
                value={harga}
                onChange={(e) => setHarga(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85A32] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Sisa Porsi <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                placeholder="10"
                value={sisaPorsi}
                onChange={(e) => setSisaPorsi(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85A32] text-sm"
              />
              <p className="text-[10px] text-neutral-500 mt-0.5">Isi 0 jika porsi habis</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Deskripsi Porsi</label>
            <textarea
              rows={2}
              placeholder="Lauk + lalapan, sambal dipisah..."
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85A32] text-sm"
            />
          </div>

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
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#C85A32] hover:bg-[#b44b25] rounded-lg shadow-sm transition active:scale-98 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {menuToEdit ? 'Simpan Perubahan' : 'Simpan Menu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
