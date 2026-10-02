import React, { useState, useEffect } from 'react'
import { X, Check } from 'lucide-react'
import { Menu } from '../../types'
import { createMenu, updateMenu } from '../../services/menuService'
import { useAlert } from '../../context/AlertContext'
import { Button } from '../ui/button'

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

  const { showAlert } = useAlert()

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
        showAlert('Menu Diperbarui', `Menu "${nama}" berhasil diupdate.`)
      } else {
        await createMenu({
          nama: nama.trim(),
          deskripsi: deskripsi.trim(),
          harga: hargaNum,
          sisaPorsi: porsiNum,
          kategori,
          tersedia: porsiNum > 0,
        })
        showAlert('Menu Ditambahkan', `Menu "${nama}" berhasil disimpan.`)
      }
      onClose()
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan menu')
      showAlert('Gagal Menyimpan Menu', err.message || 'Terjadi kesalahan', 'destructive')
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
            {menuToEdit ? 'Ubah Menu Katering' : 'Tambah Menu Baru'}
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
              Nama Menu <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="contoh: Ayam Bakar Madu"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Kategori</label>
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
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
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Harga (Rp) <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                required
                min="1000"
                step="500"
                placeholder="20000"
                value={harga}
                onChange={(e) => setHarga(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Sisa Porsi <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                placeholder="10"
                value={sisaPorsi}
                onChange={(e) => setSisaPorsi(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              />
              <p className="text-[10px] text-muted-foreground mt-1">Isi 0 jika porsi habis</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Deskripsi Porsi</label>
            <textarea
              rows={2}
              placeholder="Lauk + lalapan, sambal dipisah..."
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
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
              {menuToEdit ? 'Simpan Perubahan' : 'Simpan Menu'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
