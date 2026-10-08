import React, { useState, useEffect } from 'react'
import { Plus, UtensilsCrossed, ShieldAlert } from 'lucide-react'
import { Menu } from '../../types'
import { subscribeMenus } from '../../services/menuService'
import { MenuCard } from './MenuCard'
import { MenuFormModal } from './MenuFormModal'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { useAuth } from '../../context/AuthContext'

interface Props {
  onRedirectToLogin: () => void
}

export const KelolaMenuTab: React.FC<Props> = ({ onRedirectToLogin }) => {
  const { user, loading } = useAuth()
  const [menus, setMenus] = useState<Menu[]>([])
  const [activeKategori, setActiveKategori] = useState('Semua')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [menuToEdit, setMenuToEdit] = useState<Menu | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      onRedirectToLogin()
    }
  }, [user, loading, onRedirectToLogin])

  useEffect(() => {
    const unsub = subscribeMenus((data) => {
      setMenus(data)
    })
    return () => unsub()
  }, [])

  if (loading) {
    return (
      <div className="p-12 text-center text-neutral-500 text-xs">
        Memeriksa hak akses pemilik...
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Sesuai MoM Bagian 2: Rani (Staf) TIDAK BISA mengubah harga/menambah menu! HANYA Dina (Pemilik).
  if (user.role !== 'pemilik') {
    return (
      <div className="p-6 bg-card border border-border rounded-2xl text-center space-y-3">
        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-sm text-foreground">
            Akses Khusus Pemilik (Dina)
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
            Sesuai aturan operasional Dapur Nia, pengelolaan stok dan harga menu hanya dapat dilakukan oleh Pemilik (Dina). Staf dapur bertugas mengonfirmasi pembayaran dan memproses pesanan.
          </p>
        </div>
      </div>
    )
  }

  // Ekstrak kategori dinamis murni dari menu aktual
  const rawKategoris = Array.from(
    new Set(
      menus
        .map((m) => m.kategori?.trim())
        .filter((k): k is string => Boolean(k && k !== 'Umum'))
    )
  )
  const categories = ['Semua', ...rawKategoris]

  const filteredMenus =
    activeKategori === 'Semua'
      ? menus
      : menus.filter((m) => m.kategori === activeKategori)

  const handleOpenAdd = () => {
    setMenuToEdit(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (menu: Menu) => {
    setMenuToEdit(menu)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-4">
      {/* Header Aksi Pemilik */}
      <div className="border-b border-border pb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-foreground">Kelola Menu Katering</h2>
          <p className="text-xs text-muted-foreground">
            Atur stok porsi harian, harga, dan ketersediaan menu
          </p>
        </div>
        <Button onClick={handleOpenAdd} size="sm" className="gap-1.5 font-bold shadow-xs cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg">
          <Plus className="w-4 h-4" />
          Tambah Menu
        </Button>
      </div>

      {/* Category Pills Dinamis */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {categories.map((cat) => {
          const isSelected = activeKategori === cat
          return (
            <button
              key={cat}
              onClick={() => setActiveKategori(cat)}
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
                {cat}
              </Badge>
            </button>
          )
        })}
      </div>

      {/* Menu List / Empty State */}
      {filteredMenus.length === 0 ? (
        <div className="p-8 text-center bg-card rounded-2xl border border-dashed border-border">
          <UtensilsCrossed className="w-8 h-8 mx-auto text-muted-foreground/60 mb-2" />
          <p className="text-sm font-semibold text-foreground">Belum ada menu</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
            Klik tombol Tambah Menu di atas untuk mencatatkan menu katering hari ini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredMenus.map((menu) => (
            <MenuCard
              key={menu.id}
              menu={menu}
              onEdit={handleOpenEdit}
              canManage={true}
            />
          ))}
        </div>
      )}

      {/* Modal Form Tambah/Ubah Menu */}
      <MenuFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        menuToEdit={menuToEdit}
      />
    </div>
  )
}
