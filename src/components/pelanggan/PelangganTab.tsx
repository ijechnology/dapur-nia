import React, { useState, useEffect } from 'react'
import { Plus, Users, Search } from 'lucide-react'
import { Pelanggan } from '../../types'
import { subscribePelanggan } from '../../services/pelangganService'
import { PelangganCard } from './PelangganCard'
import { PelangganFormModal } from './PelangganFormModal'
import { Button } from '../ui/button'

export const PelangganTab: React.FC = () => {
  const [pelangganList, setPelangganList] = useState<Pelanggan[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pelangganToEdit, setPelangganToEdit] = useState<Pelanggan | null>(null)

  useEffect(() => {
    const unsub = subscribePelanggan((data) => {
      setPelangganList(data)
    })
    return () => unsub()
  }, [])

  const filteredList = pelangganList.filter((p) => {
    const q = (searchQuery || '').toLowerCase()
    const nama = (p.nama || '').toLowerCase()
    const wa = (p.nomorWhatsapp || '').toLowerCase()
    const alamat = (p.alamat || '').toLowerCase()
    return nama.includes(q) || wa.includes(q) || alamat.includes(q)
  })

  const handleOpenAdd = () => {
    setPelangganToEdit(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (p: Pelanggan) => {
    setPelangganToEdit(p)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-foreground">Buku Pelanggan</h2>
          <p className="text-xs text-muted-foreground">Kelola kontak penerima & alamat pengiriman katering</p>
        </div>
        <Button
          onClick={handleOpenAdd}
          size="sm"
          className="gap-1.5 font-semibold"
        >
          <Plus className="w-4 h-4" />
          Pelanggan Baru
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Cari nama, WhatsApp, atau alamat..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-input rounded-xl text-xs bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs placeholder:text-muted-foreground"
        />
      </div>

      {/* Customer List / Empty State */}
      {filteredList.length === 0 ? (
        <div className="p-8 text-center bg-card rounded-2xl border border-border border-dashed">
          <Users className="w-8 h-8 mx-auto text-muted-foreground/60 mb-2" />
          <p className="text-sm font-semibold text-foreground">
            {searchQuery ? 'Tidak ada pelanggan yang cocok' : 'Belum ada data pelanggan'}
          </p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
            {searchQuery
              ? 'Coba gunakan kata kunci pencarian yang lain.'
              : 'Tambahkan data pelanggan pertama agar pesanan memiliki alamat pengiriman yang jelas.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredList.map((pelanggan) => (
            <PelangganCard
              key={pelanggan.id}
              pelanggan={pelanggan}
              onEdit={handleOpenEdit}
            />
          ))}
        </div>
      )}

      <PelangganFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        pelangganToEdit={pelangganToEdit}
      />
    </div>
  )
}
