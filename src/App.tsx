import { useState } from 'react'
import { Navbar } from './components/Navbar'
import { BottomNav, TabType } from './components/BottomNav'
import { MenuTab } from './components/menu/MenuTab'
import { PelangganTab } from './components/pelanggan/PelangganTab'
import { PesananTab } from './components/pesanan/PesananTab'
import { LaporanTab } from './components/laporan/LaporanTab'
import { AlertProvider } from './context/AlertContext'

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('menu')

  return (
    <AlertProvider>
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
        {/* Top Header */}
        <Navbar />

        {/* Main Content Area */}
        <main className="flex-1 max-w-md w-full mx-auto px-4 pt-4 pb-24">
          {activeTab === 'menu' && <MenuTab />}
          {activeTab === 'pelanggan' && <PelangganTab />}
          {activeTab === 'pesanan' && <PesananTab />}
          {activeTab === 'laporan' && <LaporanTab />}
        </main>

        {/* Bottom Navigation */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </AlertProvider>
  )
}
