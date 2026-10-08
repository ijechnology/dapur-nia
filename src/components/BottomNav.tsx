import React from 'react'
import { Utensils, ChefHat, Users, ClipboardList, BarChart3, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export type TabType = 'menu' | 'kelola_menu' | 'pelanggan' | 'pesanan' | 'laporan' | 'masuk'

interface Props {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export const BottomNav: React.FC<Props> = ({ activeTab, onTabChange }) => {
  const { user } = useAuth()

  // Tentukan daftar tab dinamis murni berdasarkan peran pengguna sesuai MoM
  const getTabs = () => {
    // 1. Tamu (Belum Login): Hanya Menu & Tombol Masuk
    if (!user) {
      return [
        { id: 'menu' as TabType, label: 'Menu Katering', icon: Utensils },
        { id: 'masuk' as TabType, label: 'Masuk / Daftar', icon: LogIn },
      ]
    }

    // 2. Pelanggan (Sudah Login): Hanya Menu & Pesanan Saya
    // (Buku Pelanggan, Kelola Menu, dan Laporan disembunyikan total)
    if (user.role === 'pelanggan') {
      return [
        { id: 'menu' as TabType, label: 'Menu Katering', icon: Utensils },
        { id: 'pesanan' as TabType, label: 'Pesanan Saya', icon: ClipboardList },
      ]
    }

    // 3. Staf Dapur (Rani): Menu, Kelola Pesanan, dan Buku Pelanggan
    // (Rani TIDAK BISA kelola menu atau buka laporan sesuai MoM Bagian 2)
    if (user.role === 'staf') {
      return [
        { id: 'menu' as TabType, label: 'Menu Katering', icon: Utensils },
        { id: 'pesanan' as TabType, label: 'Kelola Pesanan', icon: ClipboardList },
        { id: 'pelanggan' as TabType, label: 'Buku Pelanggan', icon: Users },
      ]
    }

    // 4. Pemilik (Dina): Akses penuh ke seluruh 5 modul
    return [
      { id: 'menu' as TabType, label: 'Menu', icon: Utensils },
      { id: 'kelola_menu' as TabType, label: 'Kelola Menu', icon: ChefHat },
      { id: 'pelanggan' as TabType, label: 'Pelanggan', icon: Users },
      { id: 'pesanan' as TabType, label: 'Pesanan', icon: ClipboardList },
      { id: 'laporan' as TabType, label: 'Laporan', icon: BarChart3 },
    ]
  }

  const tabs = getTabs()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border shadow-md">
      <div className="max-w-md mx-auto h-16 px-2 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all cursor-pointer ${
                isActive
                  ? 'text-primary font-bold'
                  : 'text-muted-foreground hover:text-foreground font-medium'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition ${
                  isActive ? 'bg-primary/10 text-primary' : 'bg-transparent'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] sm:text-[11px] leading-tight mt-0.5 tracking-tight whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
