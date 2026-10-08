import React, { useState, useEffect } from 'react'
import { Plus, ClipboardList } from 'lucide-react'
import { Pesanan, Menu, Pelanggan } from '../../types'
import { subscribePesanan } from '../../services/pesananService'
import { subscribeMenus } from '../../services/menuService'
import { subscribePelanggan } from '../../services/pelangganService'
import { normalizeWhatsApp } from '../../lib/validation'
import { useAuth } from '../../context/AuthContext'
import { PesananCard } from './PesananCard'
import { PesananCreateModal } from './PesananCreateModal'
import { PesananDetailModal } from './PesananDetailModal'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'

export const PesananTab: React.FC = () => {
  const { user } = useAuth()
  const isPelanggan = user?.role === 'pelanggan'

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

  // 5 Status resmi sesuai Skema: menunggu_bayar, dibayar, diproses, selesai, dibatalkan
  const filterTabs = [
    { id: 'semua', label: 'Semua' },
    { id: 'menunggu_bayar', label: 'Menunggu Bayar' },
    { id: 'dibayar', label: 'Dibayar' },
    { id: 'diproses', label: 'Diproses' },
    { id: 'selesai', label: 'Selesai' },
    { id: 'dibatalkan', label: 'Dibatalkan' },
  ]

  // Filter berbasis role: jika pembeli, MUTLAK HANYA tampilkan pesanannya sendiri
  const userEmail = (user?.email || '').toLowerCase().trim()
  const userUid = user?.uid || ''
  const userWA = user?.nomorWhatsapp ? normalizeWhatsApp(user.nomorWhatsapp) : ''

  const roleFilteredOrders = pesananList.filter((order) => {
    if (!isPelanggan) return true // Pengelola (Dina & Rani) melihat semua pesanan

    // 1. Jika pesanan memiliki user_email: HANYA cocokkan jika emailnya sama persis!
    // Jika ada user_email pada order tapi berbeda dengan user login, MUTLAK return false!
    if (order.user_email) {
      return userEmail ? order.user_email.toLowerCase().trim() === userEmail : false
    }

    // 2. Jika pesanan memiliki user_id: HANYA cocokkan jika UID-nya sama persis!
    // Jika ada user_id pada order tapi berbeda dengan user login, MUTLAK return false!
    if (order.user_id) {
      return userUid ? order.user_id === userUid : false
    }

    // 3. Fallback pesanan legacy (hanya untuk data lama yang sama sekali tidak memiliki user_email dan user_id):
    // Cocokkan nomor WhatsApp dan nama pelanggan agar nomor testing dummy tidak tertukar antar-akun!
    const orderWA = normalizeWhatsApp(
      order.pelanggan_id || order.pelangganSnapshot?.nomorWhatsapp || ''
    )
    if (userWA && orderWA && userWA === orderWA) {
      const userNama = (user?.displayName || '').toLowerCase().trim()
      const orderNama = (order.nama_pelanggan || order.pelangganSnapshot?.nama || '').toLowerCase().trim()
      if (userNama && !userNama.includes('@') && orderNama) {
        return orderNama.includes(userNama) || userNama.includes(orderNama)
      }
      return false
    }

    return false
  })

  // Filter berdasarkan tab status
  const filteredOrders = roleFilteredOrders.filter((order) => {
    if (activeFilter === 'semua') return true
    if (activeFilter === 'menunggu_bayar') {
      return (
        order.status === 'menunggu_bayar' ||
        (order.status as any) === 'menunggu' ||
        (order.status as any) === 'menunggu_pembayaran'
      )
    }
    if (activeFilter === 'dibayar') {
      return order.status === 'dibayar' || (order.status as any) === 'dikonfirmasi'
    }
    return order.status === activeFilter
  })

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <h2 className="text-base font-bold text-foreground">
            {isPelanggan ? 'Pesanan Saya' : 'Daftar Pesanan Katering'}
          </h2>
          <p className="text-xs text-muted-foreground">
            {isPelanggan
              ? 'Pantau proses memasak & status pengantaran katering Anda'
              : 'Kelola alur pembayaran dan proses dapur'}
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          size="sm"
          className="gap-1.5 font-bold cursor-pointer shadow-xs bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
        >
          <Plus className="w-4 h-4" />
          Pesanan Baru
        </Button>
      </div>

      {/* Filter status tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {filterTabs.map((tab) => {
          const isSelected = activeFilter === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className="cursor-pointer shrink-0"
            >
              <Badge
                variant={isSelected ? 'default' : 'outline'}
                className={`px-3 py-1 cursor-pointer transition text-xs font-semibold rounded-full ${
                  isSelected
                    ? 'bg-primary text-primary-foreground border-transparent'
                    : 'bg-muted/30 text-muted-foreground border-border hover:bg-muted/60'
                }`}
              >
                {tab.label}
              </Badge>
            </button>
          )
        })}
      </div>

      {/* Orders List / Empty State */}
      {filteredOrders.length === 0 ? (
        <div className="p-8 text-center bg-card rounded-2xl border border-dashed border-border shadow-xs">
          <ClipboardList className="w-8 h-8 mx-auto text-neutral-400 mb-2" />
          <p className="text-sm font-semibold text-foreground">
            {isPelanggan ? 'Belum ada riwayat pesanan Anda' : 'Tidak ada pesanan'}
          </p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
            {isPelanggan
              ? 'Pesan menu katering favorit Anda dari tab Menu Katering atau klik tombol Pesanan Baru di atas.'
              : activeFilter === 'semua'
              ? 'Belum ada pesanan katering yang tercatat.'
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
