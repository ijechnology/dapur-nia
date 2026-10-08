import { useState, useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { BottomNav, TabType } from './components/BottomNav'
import { MenuTab } from './components/menu/MenuTab'
import { KelolaMenuTab } from './components/menu/KelolaMenuTab'
import { PelangganTab } from './components/pelanggan/PelangganTab'
import { PesananTab } from './components/pesanan/PesananTab'
import { LaporanTab } from './components/laporan/LaporanTab'
import { AuthPage } from './components/auth/AuthPage'
import { AlertProvider } from './context/AlertContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { UserRole } from './types'

function AppContent() {
  const { user, loading, isOwner, isStaffOrOwner } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('menu')

  const handleTabChange = (tab: TabType) => {
    if (tab === 'kelola_menu' && !user) {
      setActiveTab('masuk')
      return
    }
    setActiveTab(tab)
  }

  // Pengaman routing: otomatis arahkan ke tab yang sesuai peran tanpa menampilkan banner peringatan
  useEffect(() => {
    if (loading) return

    if (!user) {
      if (activeTab === 'kelola_menu' || activeTab === 'pelanggan' || activeTab === 'laporan') {
        setActiveTab('menu')
      }
      return
    }

    if (user.role === 'pelanggan') {
      if (activeTab === 'kelola_menu' || activeTab === 'pelanggan' || activeTab === 'laporan' || activeTab === 'masuk') {
        setActiveTab('menu')
      }
    } else if (user.role === 'staf') {
      if (activeTab === 'kelola_menu' || activeTab === 'laporan' || activeTab === 'masuk') {
        setActiveTab('pesanan')
      }
    } else if (user.role === 'pemilik') {
      if (activeTab === 'masuk') {
        setActiveTab('kelola_menu')
      }
    }
  }, [user, loading, activeTab])

  // Arahkan langsung sesuai peran setelah berhasil masuk
  const handleAuthSuccess = (role?: UserRole) => {
    const targetRole = role || user?.role
    if (targetRole === 'staf') {
      setActiveTab('pesanan')
    } else if (targetRole === 'pemilik') {
      setActiveTab('kelola_menu')
    } else {
      setActiveTab('menu')
    }
  }

  const handleLogout = () => {
    setActiveTab('menu')
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
      {/* Top Header dengan identitas brand bersih & tombol Masuk/Keluar */}
      <Navbar
        onNavigateToAuth={() => setActiveTab('masuk')}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 pt-4 pb-24">
        {/* Tab Menu Utama */}
        {activeTab === 'menu' && (
          <MenuTab
            onOpenKelola={() => handleTabChange('kelola_menu')}
            onNavigateToAuth={() => setActiveTab('masuk')}
          />
        )}

        {/* Tab Kelola Menu (HANYA Pemilik Dina) */}
        {activeTab === 'kelola_menu' && isOwner && (
          <KelolaMenuTab onRedirectToLogin={() => setActiveTab('masuk')} />
        )}

        {/* Halaman Masuk dan Daftar Akun Riil */}
        {activeTab === 'masuk' && (
          <AuthPage
            onSuccess={handleAuthSuccess}
            onCancel={() => setActiveTab('menu')}
          />
        )}

        {/* Tab Buku Pelanggan (Hanya Pengelola: Dina & Rani) */}
        {activeTab === 'pelanggan' && isStaffOrOwner && (
          <ErrorBoundary fallbackTitle="Kendala Memuat Halaman Pelanggan">
            <PelangganTab />
          </ErrorBoundary>
        )}

        {/* Tab Pesanan (Pesanan Saya untuk pembeli, Kelola Pesanan untuk Staf/Pemilik) */}
        {activeTab === 'pesanan' && (
          <ErrorBoundary fallbackTitle="Kendala Memuat Halaman Pesanan">
            <PesananTab />
          </ErrorBoundary>
        )}

        {/* Tab Laporan (HANYA Pemilik Dina sesuai MoM) */}
        {activeTab === 'laporan' && isOwner && (
          <ErrorBoundary fallbackTitle="Kendala Memuat Halaman Laporan">
            <LaporanTab />
          </ErrorBoundary>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AlertProvider>
        <AppContent />
      </AlertProvider>
    </AuthProvider>
  )
}
