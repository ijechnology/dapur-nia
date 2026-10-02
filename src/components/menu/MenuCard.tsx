import React from 'react'
import { Edit2, Trash2 } from 'lucide-react'
import { Menu } from '../../types'
import { deleteMenu } from '../../services/menuService'
import { useAlert } from '../../context/AlertContext'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'

interface Props {
  menu: Menu
  onEdit: (menu: Menu) => void
}

export const MenuCard: React.FC<Props> = ({ menu, onEdit }) => {
  const isHabis = menu.sisaPorsi <= 0
  const { showAlert } = useAlert()

  const handleDelete = async () => {
    if (confirm(`Yakin ingin menghapus menu "${menu.nama}"?`)) {
      try {
        await deleteMenu(menu.id)
        showAlert('Menu Dihapus', `Menu "${menu.nama}" berhasil dihapus.`)
      } catch (err: any) {
        showAlert('Gagal Menghapus', err.message, 'destructive')
      }
    }
  }

  return (
    <div
      className={`rounded-2xl border bg-card p-4 transition-all shadow-sm ${
        isHabis ? 'opacity-75 bg-muted/30 border-dashed' : 'border-border hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="outline" className="text-[11px] font-medium px-2.5 py-0.5">
              {menu.kategori}
            </Badge>
            {isHabis ? (
              <Badge variant="destructive" className="text-[11px] font-medium px-2.5 py-0.5">
                Habis
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-[11px] font-medium px-2.5 py-0.5">
                Ready {menu.sisaPorsi} porsi
              </Badge>
            )}
          </div>

          <h3 className="font-heading text-base font-semibold text-foreground tracking-tight pt-0.5">
            {menu.nama}
          </h3>

          {menu.deskripsi && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {menu.deskripsi}
            </p>
          )}

          <div className="pt-1 text-base font-bold text-primary tabular-nums">
            Rp {menu.harga.toLocaleString('id-ID')}
          </div>
        </div>

        {/* Tombol Aksi Edit & Hapus */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onEdit(menu)}
            title="Ubah Menu"
            className="text-muted-foreground hover:text-foreground"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleDelete}
            title="Hapus Menu"
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Bagian Bawah: Informasi Sisa Porsi (Tanpa Button +/- sesuai permintaan poin 3) */}
      <div className="mt-3.5 pt-3 border-t border-border flex items-center justify-between text-xs">
        <span className="text-muted-foreground font-medium">Sisa Porsi Tersedia:</span>
        <span className="font-bold text-foreground tabular-nums text-sm">
          {menu.sisaPorsi} porsi
        </span>
      </div>
    </div>
  )
}
