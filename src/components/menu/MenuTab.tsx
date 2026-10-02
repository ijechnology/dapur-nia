import React, { useState, useEffect } from 'react'
import { Plus, UtensilsCrossed } from 'lucide-react'
import { Menu } from '../../types'
import { subscribeMenus } from '../../services/menuService'
import { MenuCard } from './MenuCard'
import { MenuFormModal } from './MenuFormModal'

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
          <h2 className="text-base font-bold text-neutral-900">Daftar Menu Katering</h2>
          <p className="text-xs text-neutral-500">Kelola stok porsi dan status ketersediaan</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#C85A32] hover:bg-[#b44b25] text-white text-xs font-semibold rounded-lg shadow-xs transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Tambah Menu
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveKategori(cat)}
            className={`px-3 py-1.5 rounded-full font-medium transition whitespace-nowrap ${
              activeKategori === cat
                ? 'bg-[#1C1E1B] text-white'
                : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu List / Empty State */}
      {filteredMenus.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border border-neutral-200 border-dashed">
          <UtensilsCrossed className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
          <p className="text-sm font-semibold text-neutral-700">Belum ada menu</p>
          <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
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
