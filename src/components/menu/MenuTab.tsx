import React, { useState, useEffect } from 'react'
import { UtensilsCrossed, Settings, LogIn, AlertCircle } from 'lucide-react'
import { Menu, Pelanggan } from '../../types'
import { subscribeMenus } from '../../services/menuService'
import { subscribePelanggan } from '../../services/pelangganService'
import { MenuCard } from './MenuCard'
import { FloatingOrderBar } from './FloatingOrderBar'
import { PesananCreateModal } from '../pesanan/PesananCreateModal'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { useAuth } from '../../context/AuthContext'

interface Props {
  onOpenKelola?: () => void
  onNavigateToAuth?: () => void
}

export const MenuTab: React.FC<Props> = ({ onOpenKelola, onNavigateToAuth }) => {
  const { user } = useAuth()
  const isOwner = user?.role === 'pemilik'

  const [menus, setMenus] = useState<Menu[]>([])
  const [pelangganList, setPelangganList] = useState<Pelanggan[]>([])
  const [activeKategori, setActiveKategori] = useState('Semua')

  // State porsi terpilih di halaman menu
  const [selectedCart, setSelectedCart] = useState<Record<string, number>>({})
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)

  useEffect(() => {
    const unsubMenus = subscribeMenus((data) => {
      setMenus(data)
    })
    const unsubPelanggan = subscribePelanggan((data) => {
      setPelangganList(data)
    })
    return () => {
      unsubMenus()
      unsubPelanggan()
    }
  }, [])

  // Ekstrak kategori dinamis murni dari data menu aktual
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

  // Perubahan kuantiti oleh pengguna
  const handleQtyChange = (menuId: string, delta: number) => {
    // Jika tamu (belum login), wajib diarahkan login terlebih dahulu
    if (!user) {
      setShowAuthPrompt(true)
      return
    }

    const menu = menus.find((m) => m.id === menuId)
    const stock = menu?.sisa_porsi ?? menu?.sisaPorsi ?? 0
    setSelectedCart((prev) => {
      const current = prev[menuId] || 0
      const next = current + delta
      const updated = { ...prev }
      if (next <= 0) {
        delete updated[menuId]
      } else {
        updated[menuId] = Math.min(next, stock > 0 ? stock : next)
      }
      return updated
    })
  }

  // Pesan langsung 1 menu
  const handleDirectOrder = (menu: Menu) => {
    if (!user) {
      setShowAuthPrompt(true)
      return
    }
    setSelectedCart({ [menu.id]: 1 })
    setIsOrderModalOpen(true)
  }

  // Hitung total kuantiti & total harga pilihan
  const totalItems = Object.values(selectedCart).reduce((sum, qty) => sum + qty, 0)
  const totalHarga = Object.entries(selectedCart).reduce((sum, [menuId, qty]) => {
    const m = menus.find((item) => item.id === menuId)
    return sum + (m ? m.harga * qty : 0)
  }, 0)

  return (
    <div className="space-y-4 pb-20">
      {/* Header Menu Bersih & Kontras Tinggi (Tanpa AI Slop & Tanpa Gradient Rusak) */}
      <div className="border-b border-border pb-3.5 pt-1 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100 tracking-tight leading-tight">
            Menu Katering Hari Ini
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Masakan rumahan segar • Pemesanan ditutup pukul 12.00 WIB
          </p>
        </div>

        {/* Tombol Kelola Menu: HANYA Dina (Pemilik), Staf Rani dilarang sesuai MoM */}
        {isOwner && onOpenKelola && (
          <Button
            onClick={onOpenKelola}
            variant="outline"
            size="sm"
            className="gap-1.5 font-semibold text-xs shrink-0 cursor-pointer rounded-lg border-border"
          >
            <Settings className="w-3.5 h-3.5 text-primary" />
            Kelola Menu
          </Button>
        )}
      </div>

      {/* Banner Ajakan Masuk untuk Tamu jika belum login */}
      {!user && onNavigateToAuth && (
        <div className="p-3 bg-muted/40 border border-border rounded-xl flex items-center justify-between gap-3 text-xs">
          <p className="text-muted-foreground">
            Ingin memesan katering? Masuk atau daftar akun terlebih dahulu.
          </p>
          <Button
            variant="outline"
            size="xs"
            onClick={onNavigateToAuth}
            className="font-bold text-xs shrink-0 cursor-pointer border-primary text-primary hover:bg-primary/5"
          >
            Masuk Sekarang
          </Button>
        </div>
      )}

      {/* Category Pills Dinamis (Kategori Aktual Tanpa Label "Umum") */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {categories.map((cat) => {
          const isSelected = activeKategori === cat
          return (
            <button
              key={cat}
              onClick={() => setActiveKategori(cat)}
              className="cursor-pointer transition active:scale-95 shrink-0"
            >
              <Badge
                variant={isSelected ? 'default' : 'outline'}
                className={`px-3 py-1 cursor-pointer text-xs font-semibold rounded-full transition-all ${
                  isSelected
                    ? 'bg-primary text-primary-foreground border-transparent shadow-xs'
                    : 'bg-card text-muted-foreground hover:text-foreground border-border'
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
          <UtensilsCrossed className="w-8 h-8 mx-auto text-neutral-400 mb-2" />
          <p className="text-sm font-semibold text-foreground">Belum ada menu tersedia</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
            Daftar menu katering harian kategori "{activeKategori}" akan segera diperbarui.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredMenus.map((menu) => (
            <MenuCard
              key={menu.id}
              menu={menu}
              canManage={false}
              selectedQty={selectedCart[menu.id] || 0}
              onQtyChange={handleQtyChange}
              onDirectOrder={handleDirectOrder}
            />
          ))}
        </div>
      )}

      {/* Floating Order Bar Minimalis (Pilihan B: Hanya Berapa Porsi & Berapa Harganya) */}
      <FloatingOrderBar
        totalItems={totalItems}
        totalHarga={totalHarga}
        onCheckout={() => setIsOrderModalOpen(true)}
        onReset={() => setSelectedCart({})}
      />

      {/* Modal Checkout / Buat Pesanan */}
      <PesananCreateModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        menuList={menus}
        pelangganList={pelangganList}
        initialCart={selectedCart}
        onOrderSuccess={() => setSelectedCart({})}
      />

      {/* Dialog Ajakan Masuk Saat Tamu Klik Pesan */}
      {showAuthPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-card w-full max-w-sm rounded-2xl border border-border p-5 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-sm text-foreground">
                Masuk untuk Memesan Katering
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Silakan masuk atau daftarkan akun pembeli terlebih dahulu agar alamat pengiriman dan pesanan Anda tercatat rapi di Dapur Nia.
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAuthPrompt(false)}
                className="flex-1 text-xs cursor-pointer rounded-lg"
              >
                Batal
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setShowAuthPrompt(false)
                  if (onNavigateToAuth) onNavigateToAuth()
                }}
                className="flex-1 text-xs font-bold cursor-pointer rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground gap-1"
              >
                <LogIn className="w-3.5 h-3.5" />
                Masuk / Daftar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
