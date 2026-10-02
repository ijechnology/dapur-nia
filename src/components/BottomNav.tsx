import React from 'react'
import { Utensils, Users, ClipboardList, BarChart3 } from 'lucide-react'

export type TabType = 'menu' | 'pelanggan' | 'pesanan' | 'laporan'

interface Props {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export const BottomNav: React.FC<Props> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'menu' as TabType, label: 'Menu', icon: Utensils },
    { id: 'pelanggan' as TabType, label: 'Pelanggan', icon: Users },
    { id: 'pesanan' as TabType, label: 'Pesanan', icon: ClipboardList },
    { id: 'laporan' as TabType, label: 'Laporan', icon: BarChart3 },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200">
      <div className="max-w-md mx-auto h-16 px-4 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all ${
                isActive
                  ? 'text-[#C85A32] font-bold scale-102'
                  : 'text-neutral-400 hover:text-neutral-700 font-medium'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition ${
                  isActive ? 'bg-orange-50' : 'bg-transparent'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] leading-tight mt-0.5">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
