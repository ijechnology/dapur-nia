import React from 'react'
import { Plus, Minus, Edit2, Trash2 } from 'lucide-react'
import { Menu } from '../../types'
import { updatePorsiQuick, deleteMenu } from '../../services/menuService'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'

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
    <Card size="sm" className={isHabis ? 'opacity-80 bg-neutral-50/50' : ''}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant="outline">{menu.kategori}</Badge>
              {isHabis ? (
                <Badge variant="destructive">Habis</Badge>
              ) : (
                <Badge variant="secondary">Ready {menu.sisaPorsi} porsi</Badge>
              )}
            </div>
            <CardTitle className="text-base font-semibold text-neutral-900 mt-1">
              {menu.nama}
            </CardTitle>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onEdit(menu)}
              title="Ubah Menu"
            >
              <Edit2 className="w-3.5 h-3.5 text-neutral-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleDelete}
              title="Hapus Menu"
              className="hover:text-destructive"
            >
              <Trash2 className="w-3.5 h-3.5 text-neutral-500 hover:text-red-600" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="py-1">
        {menu.deskripsi && (
          <CardDescription className="text-xs text-neutral-500 line-clamp-2">
            {menu.deskripsi}
          </CardDescription>
        )}
        <div className="mt-2 text-base font-bold text-primary tabular-nums">
          Rp {menu.harga.toLocaleString('id-ID')}
        </div>
      </CardContent>

      <CardFooter className="pt-2 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium">Sisa Porsi:</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-xs"
            onClick={() => handlePorsiDelta(-1)}
            disabled={menu.sisaPorsi <= 0}
          >
            <Minus className="w-3 h-3" />
          </Button>
          <span className="w-8 text-center text-xs font-bold text-foreground tabular-nums">
            {menu.sisaPorsi}
          </span>
          <Button
            variant="outline"
            size="icon-xs"
            onClick={() => handlePorsiDelta(1)}
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
