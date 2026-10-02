import React, { useState, useEffect } from 'react'
import { X, Check } from 'lucide-react'
import { Pelanggan } from '../../types'
import { createPelanggan, updatePelanggan } from '../../services/pelangganService'
import { useAlert } from '../../context/AlertContext'
import { Button } from '../ui/button'

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

  const { showAlert } = useAlert()

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
        showAlert('Pelanggan Diperbarui', `Data "${nama}" berhasil diupdate.`)
      } else {
        await createPelanggan({
          nama: nama.trim(),
          nomorWhatsapp: nomorWhatsapp.trim(),
          alamat: alamat.trim(),
          catatan: catatan.trim(),
        })
        showAlert('Pelanggan Ditambahkan', `Pelanggan "${nama}" berhasil didaftarkan.`)
      }
      onClose()
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan data pelanggan')
      showAlert('Gagal Menyimpan', err.message || 'Terjadi kesalahan', 'destructive')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
          <h2 className="font-heading font-semibold text-foreground text-sm">
            {pelangganToEdit ? 'Ubah Data Pelanggan' : 'Tambah Pelanggan Baru'}
          </h2>
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm">
          {errorMsg && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-xl text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Nama Pelanggan <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="contoh: Ibu Maya"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Nomor WhatsApp <span className="text-destructive">*</span>
            </label>
            <input
              type="tel"
              required
              placeholder="081234567890"
              value={nomorWhatsapp}
              onChange={(e) => setNomorWhatsapp(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm font-mono"
            />
            <p className="text-[10px] text-muted-foreground mt-1">Nomor harus unik & aktif di WhatsApp</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Alamat Lengkap Pengiriman <span className="text-destructive">*</span>
            </label>
            <textarea
              rows={2}
              required
              placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan..."
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Catatan Pengantaran (Opsional)
            </label>
            <input
              type="text"
              placeholder="Patokan rumah, titip sekuriti, dll."
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </div>

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
              disabled={loading}
              className="gap-1.5 font-semibold"
            >
              <Check className="w-4 h-4" />
              {pelangganToEdit ? 'Simpan Perubahan' : 'Simpan Pelanggan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
