import React, { useState, useEffect } from 'react'
import { X, Check } from 'lucide-react'
import { Pelanggan } from '../../types'
import { createPelanggan, updatePelanggan } from '../../services/pelangganService'

interface Props {
  isOpen: boolean
  onClose: () => void
  pelangganToEdit?: Pelanggan | null
}

export const PelangganFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  pelangganToEdit,
}) => {
  const [nama, setNama] = useState('')
  const [nomorWhatsapp, setNomorWhatsapp] = useState('')
  const [alamat, setAlamat] = useState('')
  const [catatan, setCatatan] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (pelangganToEdit) {
      setNama(pelangganToEdit.nama)
      setNomorWhatsapp(pelangganToEdit.nomorWhatsapp)
      setAlamat(pelangganToEdit.alamat)
      setCatatan(pelangganToEdit.catatan || '')
    } else {
      setNama('')
      setNomorWhatsapp('')
      setAlamat('')
      setCatatan('')
    }
    setErrorMsg('')
  }, [pelangganToEdit, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!nama.trim()) {
      setErrorMsg('Nama pelanggan wajib diisi')
      return
    }
    if (!alamat.trim()) {
      setErrorMsg('Alamat pengiriman wajib diisi')
      return
    }

    setLoading(true)
    try {
      if (pelangganToEdit) {
        await updatePelanggan(pelangganToEdit.id, {
          nama: nama.trim(),
          nomorWhatsapp: nomorWhatsapp.trim(),
          alamat: alamat.trim(),
          catatan: catatan.trim(),
        })
      } else {
        await createPelanggan({
          nama: nama.trim(),
          nomorWhatsapp: nomorWhatsapp.trim(),
          alamat: alamat.trim(),
          catatan: catatan.trim(),
        })
      }
      onClose()
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan data pelanggan')
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
            {pelangganToEdit ? 'Ubah Data Pelanggan' : 'Tambah Pelanggan Baru'}
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
              Nama Pelanggan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="contoh: Ibu Maya"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85A32] text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Nomor WhatsApp <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              placeholder="081234567890"
              value={nomorWhatsapp}
              onChange={(e) => setNomorWhatsapp(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85A32] text-sm font-mono"
            />
            <p className="text-[10px] text-neutral-500 mt-0.5">Nomor harus unik & aktif di WhatsApp</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Alamat Lengkap Pengiriman <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan..."
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85A32] text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Catatan Pengantaran (Opsional)
            </label>
            <input
              type="text"
              placeholder="Patokan rumah, titip sekuriti, dll."
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
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
              {pelangganToEdit ? 'Simpan Perubahan' : 'Simpan Pelanggan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
