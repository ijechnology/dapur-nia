import React, { useState, useEffect } from 'react'
import { Plus, ClipboardList } from 'lucide-react'
import { Pesanan, Menu, Pelanggan, OrderStatus } from '../../types'
import { subscribePesanan } from '../../services/pesananService'
import { subscribeMenus } from '../../services/menuService'
import { subscribePelanggan } from '../../services/pelangganService'
import { PesananCard } from './PesananCard'
import { PesananCreateModal } from './PesananCreateModal'
import { PesananDetailModal } from './PesananDetailModal'

export const PesananTab: React.FC = () => {
  const [pesananList, setPesananList] = useState<Pesanan[]>([])
  const [menuList, setMenuList] = useState<Menu[]>([])
  const [pelangganList, setPelangganList] = useState<Pelanggan[]>([])

  const [activeFilter, setActiveFilter] = useState<string>('semua')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedPesanan, setSelectedPesanan] = useState<Pesanan | null>(null)

  useEffect(() => {
    const unsubPesanan = subscribePesanan((data) => setPesananList(data))
    const unsubMenus = subscribeMenus((data) => setMenuList(data))
    const unsubPelanggan = subscribePelanggan((data) => setPelangganList(data))

    return () => {
      unsubPesanan()
      unsubMenus()
      unsubPelanggan()
    }
  }, [])

  const filterTabs = [
    { id: 'semua', label: 'Semua' },
    { id: 'menunggu_pembayaran', label: 'Menunggu Bayar' },
    { id: 'diproses', label: 'Dimasak' },
    { id: 'dikirim', label: 'Dikirim' },
    { id: 'selesai', label: 'Selesai' },
    { id: 'dibatalkan', label: 'Batal' },
  ]

  const filteredOrders = pesananList.filter((order) => {
    if (activeFilter === 'semua') return true
    return order.status === activeFilter
  })

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-neutral-900">Daftar Pesanan</h2>
          <p className="text-xs text-neutral-500">Kelola status pesanan & pengiriman katering</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#C85A32] hover:bg-[#b44b25] text-white text-xs font-semibold rounded-lg shadow-xs transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Pesanan Baru
        </button>
      </div>

      {/* Filter status tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-3 py-1.5 rounded-full font-medium transition whitespace-nowrap ${
              activeFilter === tab.id
                ? 'bg-[#1C1E1B] text-white'
                : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List / Empty State */}
      {filteredOrders.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border border-neutral-200 border-dashed">
          <ClipboardList className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
          <p className="text-sm font-semibold text-neutral-700">Tidak ada pesanan</p>
          <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
            {activeFilter === 'semua'
              ? 'Belum ada pesanan katering yang tercatat. Klik tombol Pesanan Baru untuk membuat order.'
              : `Tidak ada pesanan dengan status filter "${activeFilter}".`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredOrders.map((order) => (
            <PesananCard
              key={order.id}
              pesanan={order}
              onClick={(p) => setSelectedPesanan(p)}
            />
          ))}
        </div>
      )}

      {/* Create Order Modal */}
      <PesananCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        menuList={menuList}
        pelangganList={pelangganList}
      />

      {/* Detail / State Transition Modal */}
      <PesananDetailModal
        isOpen={!!selectedPesanan}
        onClose={() => setSelectedPesanan(null)}
        pesanan={selectedPesanan}
      />
    </div>
  )
}
