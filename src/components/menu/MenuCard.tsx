import React from 'react'
import { Edit2, Trash2, Plus, Minus } from 'lucide-react'
import { Menu } from '../../types'
import { deleteMenu } from '../../services/menuService'
import { useAlert } from '../../context/AlertContext'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'

export const DEFAULT_MENU_IMAGES: Record<string, string> = {
  'nasi ayam bakar': 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80',
  'mie ayam': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80',
  'nasi goreng': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80',
  'soto ayam': 'https://images.unsplash.com/photo-1572656631137-7935297eff55?w=600&auto=format&fit=crop&q=80',
  'rendang sapi': 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=600&auto=format&fit=crop&q=80',
  'gado-gado': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
  'es teh manis': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop&q=80',
  'es jeruk segar': 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=80',
  'bandeng presto': 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80',
  default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
}

export function getMenuImageUrl(menu: Menu): string {
  if (menu.gambar) return menu.gambar
  const key = menu.nama.toLowerCase().trim()
  for (const [namaKey, url] of Object.entries(DEFAULT_MENU_IMAGES)) {
    if (key.includes(namaKey)) return url
  }
  return DEFAULT_MENU_IMAGES.default
}

interface Props {
  menu: Menu
  onEdit?: (menu: Menu) => void
  canManage?: boolean
  selectedQty?: number
  onQtyChange?: (menuId: string, delta: number) => void
  onDirectOrder?: (menu: Menu) => void
}

export const MenuCard: React.FC<Props> = ({
  menu,
  onEdit,
  canManage = false,
  selectedQty = 0,
  onQtyChange,
  onDirectOrder,
}) => {
  const currentSisa = menu.sisa_porsi ?? menu.sisaPorsi ?? 0
  const isHabis = currentSisa <= 0
  const { showAlert } = useAlert()
  const imageUrl = getMenuImageUrl(menu)

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
      className={`rounded-2xl border bg-card overflow-hidden transition-all duration-200 shadow-xs hover:shadow-md ${
        isHabis
          ? 'opacity-70 bg-muted/30 border-dashed border-border'
          : selectedQty > 0
          ? 'border-primary ring-1 ring-primary/40 bg-primary/2'
          : 'border-border hover:border-primary/30'
      }`}
    >
      <div className="p-3.5 flex gap-3.5 items-start">
        {/* Gambar Makanan ala Shopee Food */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 bg-muted border border-border/60">
          <img
            src={imageUrl}
            alt={menu.nama}
            loading="lazy"
            className={`w-full h-full object-cover transition-transform duration-300 ${
              isHabis ? 'grayscale contrast-75' : 'hover:scale-105'
            }`}
          />
          {isHabis ? (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-[10px] font-bold text-white uppercase tracking-wider bg-destructive px-2 py-0.5 rounded-full shadow-sm">
                Habis
              </span>
            </div>
          ) : currentSisa <= 5 ? (
            <span className="absolute bottom-1 left-1 bg-amber-500/90 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
              Sisa {currentSisa}
            </span>
          ) : null}
        </div>

        {/* Informasi Menu */}
        <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge
                variant="outline"
                className="text-[10px] font-semibold px-2 py-0.5 rounded-md border-primary/20 bg-primary/10 text-primary"
              >
                {(() => {
                  const kat = (menu.kategori || '').toLowerCase()
                  if (kat.includes('sayur') || kat.includes('kuah')) return 'Sayur & Kuah'
                  if (kat.includes('minum')) return 'Minuman'
                  if (kat.includes('paket')) return 'Paket'
                  if (kat.includes('sambal')) return 'Sambal & Pelengkap'
                  return 'Lauk'
                })()}
              </Badge>
              {!isHabis && currentSisa > 0 && (
                <span className="text-[10px] text-muted-foreground font-medium">
                  Sisa {currentSisa} porsi
                </span>
              )}
            </div>

            <h3 className="font-heading text-sm sm:text-base font-bold text-foreground tracking-tight leading-snug line-clamp-1">
              {menu.nama}
            </h3>

            {menu.deskripsi ? (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {menu.deskripsi}
              </p>
            ) : null}
          </div>

          {/* Harga & Tombol Pesan ala Shopee Food */}
          <div className="flex items-center justify-between gap-2 pt-2 mt-auto">
            <div className="text-sm sm:text-base font-extrabold text-primary tabular-nums">
              Rp {menu.harga.toLocaleString('id-ID')}
            </div>

            {/* Aksi untuk Pengelola (Owner) */}
            {canManage ? (
              <div className="flex items-center gap-1">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onEdit(menu)}
                    title="Ubah Menu"
                    className="text-muted-foreground hover:text-foreground h-7 w-7"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={handleDelete}
                  title="Hapus Menu"
                  className="text-muted-foreground hover:text-destructive h-7 w-7"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ) : (
              /* Aksi untuk Pelanggan / Tamu */
              <div>
                {isHabis ? (
                  <Button size="xs" disabled variant="outline" className="text-[11px] h-7 px-2.5 rounded-lg">
                    Habis
                  </Button>
                ) : selectedQty > 0 && onQtyChange ? (
                  <div className="flex items-center gap-1 bg-primary/10 border border-primary/30 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => onQtyChange(menu.id, -1)}
                      className="w-6 h-6 rounded flex items-center justify-center bg-white dark:bg-card text-foreground hover:bg-muted text-xs font-bold transition shadow-2xs cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center text-xs font-bold tabular-nums text-primary">
                      {selectedQty}
                    </span>
                    <button
                      type="button"
                      onClick={() => onQtyChange(menu.id, 1)}
                      disabled={selectedQty >= currentSisa}
                      className="w-6 h-6 rounded flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold transition shadow-2xs cursor-pointer disabled:opacity-40"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <Button
                    variant="default"
                    size="xs"
                    onClick={() => {
                      if (onQtyChange) onQtyChange(menu.id, 1)
                      else if (onDirectOrder) onDirectOrder(menu)
                    }}
                    className="font-bold text-xs h-7 px-3 rounded-lg shadow-xs gap-1 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Pesan
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
