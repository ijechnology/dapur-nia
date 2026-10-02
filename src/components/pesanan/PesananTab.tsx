import React, { useState, useEffect } from 'react'
import { Plus, ClipboardList } from 'lucide-react'
import { Pesanan, Menu, Pelanggan } from '../../types'
import { subscribePesanan } from '../../services/pesananService'
import { subscribeMenus } from '../../services/menuService'
import { subscribePelanggan } from '../../services/pelangganService'
import { PesananCard } from './PesananCard'
import { PesananCreateModal } from './PesananCreateModal'
import { PesananDetailModal } from './PesananDetailModal'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'

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
          <h2 className="text-base font-bold text-foreground">Daftar Pesanan</h2>
          <p className="text-xs text-muted-foreground">Kelola status pesanan & pengiriman katering</p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          size="sm"
          className="gap-1.5 font-semibold"
        >
          <Plus className="w-4 h-4" />
          Pesanan Baru
        </Button>
      </div>

      {/* Filter status tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className="cursor-pointer"
          >
            <Badge
              variant={activeFilter === tab.id ? 'default' : 'outline'}
              className="px-3 py-1 cursor-pointer transition text-xs"
            >
              {tab.label}
            </Badge>
          </button>
        ))}
      </div>

      {/* Orders List / Empty State */}
      {filteredOrders.length === 0 ? (
        <div className="p-8 text-center bg-card rounded-2xl border border-dashed border-border">
          <ClipboardList className="w-8 h-8 mx-auto text-muted-foreground/60 mb-2" />
          <p className="text-sm font-semibold text-foreground">Tidak ada pesanan</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
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
