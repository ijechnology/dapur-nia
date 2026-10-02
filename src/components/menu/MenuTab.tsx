import React, { useState, useEffect } from 'react'
import { Plus, UtensilsCrossed } from 'lucide-react'
import { Menu } from '../../types'
import { subscribeMenus } from '../../services/menuService'
import { MenuCard } from './MenuCard'
import { MenuFormModal } from './MenuFormModal'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'

export const MenuTab: React.FC = () => {
  const [menus, setMenus] = useState<Menu[]>([])
  const [activeKategori, setActiveKategori] = useState('Semua')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [menuToEdit, setMenuToEdit] = useState<Menu | null>(null)

  useEffect(() => {
    const unsub = subscribeMenus((data) => {
      setMenus(data)
    })
    return () => unsub()
  }, [])

  const categories = ['Semua', ...Array.from(new Set(menus.map((m) => m.kategori)))]

  const filteredMenus = activeKategori === 'Semua'
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
      {/* Action Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-foreground">Daftar Menu Katering</h2>
          <p className="text-xs text-muted-foreground">Kelola stok porsi dan status ketersediaan</p>
        </div>
        <Button onClick={handleOpenAdd} size="sm" className="gap-1.5 font-semibold">
          <Plus className="w-4 h-4" />
          Tambah Menu
        </Button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveKategori(cat)}
            className="cursor-pointer"
          >
            <Badge
              variant={activeKategori === cat ? 'default' : 'outline'}
              className="px-3 py-1 cursor-pointer transition text-xs"
            >
              {cat}
            </Badge>
          </button>
        ))}
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
            <MenuCard key={menu.id} menu={menu} onEdit={handleOpenEdit} />
          ))}
        </div>
      )}

      <MenuFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        menuToEdit={menuToEdit}
      />
    </div>
  )
}
