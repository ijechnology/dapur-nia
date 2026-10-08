import React, { useState, useEffect } from 'react'
import { X, Check } from 'lucide-react'
import { Menu } from '../../types'
import { createMenu, updateMenu } from '../../services/menuService'
import { useAlert } from '../../context/AlertContext'
import { Button } from '../ui/button'
import { AriakitSelect } from '../ui/AriakitSelect'

interface Props {
  isOpen: boolean
  onClose: () => void
  menuToEdit?: Menu | null
}

const KATEGORI_OPTIONS = [
  { value: 'Lauk', label: 'Lauk Utama' },
  { value: 'Sayur', label: 'Sayur & Kuah' },
  { value: 'Paket', label: 'Paket Lengkap' },
  { value: 'Minuman', label: 'Minuman Segar' },
  { value: 'Sambal & Pelengkap', label: 'Sambal & Pelengkap' },
]

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
      setSisaPorsi(menuToEdit.sisa_porsi ?? menuToEdit.sisaPorsi ?? 0)
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
          sisa_porsi: porsiNum,
          sisaPorsi: porsiNum,
          kategori,
        })
        showAlert('Menu Diperbarui', `Menu "${nama}" berhasil diupdate.`)
      } else {
        await createMenu({
          nama: nama.trim(),
          deskripsi: deskripsi.trim(),
          harga: hargaNum,
          sisa_porsi: porsiNum,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[88vh] relative z-50">
        {/* Header (Sticky / Shrink-0) */}
        <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-border bg-slate-50/80 dark:bg-muted/30">
          <h2 className="font-heading font-semibold text-foreground text-sm">
            {menuToEdit ? 'Ubah Menu Katering' : 'Tambah Menu Baru'}
          </h2>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Form Body (Scrollable) */}
        <form id="menu-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-sm bg-white dark:bg-card overscroll-contain">
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
              className="w-full px-3 py-2 border border-input rounded-xl bg-white dark:bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Kategori</label>
            <AriakitSelect
              value={kategori}
              onChange={setKategori}
              options={KATEGORI_OPTIONS}
              placeholder="Pilih Kategori Menu"
            />
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
                className="w-full px-3 py-2 border border-input rounded-xl bg-white dark:bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm shadow-2xs font-mono"
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
                className="w-full px-3 py-2 border border-input rounded-xl bg-white dark:bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm shadow-2xs font-mono"
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
              className="w-full px-3 py-2 border border-input rounded-xl bg-white dark:bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm shadow-2xs"
            />
          </div>
        </form>

        {/* Footer (Sticky / Shrink-0) */}
        <div className="shrink-0 p-4 border-t border-border bg-slate-50/90 dark:bg-card/90 flex items-center justify-end gap-2 backdrop-blur-xs">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="cursor-pointer"
          >
            Batal
          </Button>
          <Button
            type="submit"
            form="menu-form"
            size="sm"
            disabled={loading}
            className="gap-1.5 font-semibold cursor-pointer"
          >
            <Check className="w-4 h-4" />
            {menuToEdit ? 'Simpan Perubahan' : 'Simpan Menu'}
          </Button>
        </div>
      </div>
    </div>
  )
}
