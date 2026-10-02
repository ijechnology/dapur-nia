import React, { useState, useEffect } from 'react'
import { Plus, Users, Search } from 'lucide-react'
import { Pelanggan } from '../../types'
import { subscribePelanggan } from '../../services/pelangganService'
import { PelangganCard } from './PelangganCard'
import { PelangganFormModal } from './PelangganFormModal'

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
    const q = searchQuery.toLowerCase()
    return (
      p.nama.toLowerCase().includes(q) ||
      p.nomorWhatsapp.includes(q) ||
      p.alamat.toLowerCase().includes(q)
    )
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
          <h2 className="text-base font-bold text-neutral-900">Buku Pelanggan</h2>
          <p className="text-xs text-neutral-500">Kelola kontak penerima & alamat pengiriman katering</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#C85A32] hover:bg-[#b44b25] text-white text-xs font-semibold rounded-lg shadow-xs transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Pelanggan Baru
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          placeholder="Cari nama, WhatsApp, atau alamat..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
        />
      </div>

      {/* Customer List / Empty State */}
      {filteredList.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border border-neutral-200 border-dashed">
          <Users className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
          <p className="text-sm font-semibold text-neutral-700">
            {searchQuery ? 'Tidak ada pelanggan yang cocok' : 'Belum ada data pelanggan'}
          </p>
          <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
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
