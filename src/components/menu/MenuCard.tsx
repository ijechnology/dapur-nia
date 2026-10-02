import React from 'react'
import { Plus, Minus, Edit2, Trash2 } from 'lucide-react'
import { Menu } from '../../types'
import { updatePorsiQuick, deleteMenu } from '../../services/menuService'

interface Props {
  menu: Menu
  onEdit: (menu: Menu) => void
}

export const MenuCard: React.FC<Props> = ({ menu, onEdit }) => {
  const isHabis = menu.sisaPorsi <= 0

  const handlePorsiDelta = async (delta: number) => {
    try {
      await updatePorsiQuick(menu.id, delta)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async () => {
    if (confirm(`Yakin ingin menghapus menu "${menu.nama}"?`)) {
      try {
        await deleteMenu(menu.id)
      } catch (err) {
        console.error(err)
      }
    }
  }

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        isHabis
          ? 'bg-neutral-50/80 border-neutral-200 opacity-80'
          : 'bg-white border-neutral-200 shadow-2xs hover:border-neutral-300'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600 border border-neutral-200/60">
              {menu.kategori}
            </span>
            {isHabis ? (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-neutral-200 text-neutral-700">
                Habis
              </span>
            ) : (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                Tersedia ({menu.sisaPorsi} porsi)
              </span>
            )}
          </div>

          <h3 className="font-semibold text-neutral-900 text-sm mt-1.5 leading-snug">
            {menu.nama}
          </h3>

          {menu.deskripsi && (
            <p className="text-xs text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
              {menu.deskripsi}
            </p>
          )}

          <div className="mt-2.5 font-bold text-sm text-[#C85A32] tabular-nums">
            Rp {menu.harga.toLocaleString('id-ID')}
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(menu)}
            title="Ubah Menu"
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            title="Hapus Menu"
            className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Stock adjustment bar */}
      <div className="mt-3.5 pt-3 border-t border-neutral-100 flex items-center justify-between">
        <span className="text-xs text-neutral-500 font-medium">Sisa Porsi:</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePorsiDelta(-1)}
            disabled={menu.sisaPorsi <= 0}
            className="w-7 h-7 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 disabled:hover:bg-transparent active:scale-95 transition"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-8 text-center text-xs font-bold text-neutral-800 tabular-nums">
            {menu.sisaPorsi}
          </span>
          <button
            onClick={() => handlePorsiDelta(1)}
            className="w-7 h-7 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 active:scale-95 transition"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
