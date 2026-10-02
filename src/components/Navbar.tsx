import React, { useState, useEffect } from 'react'
import { Settings2 } from 'lucide-react'
import { getFirebaseDb, getStoredFirebaseConfig } from '../lib/firebase'
import { FirebaseConfigModal } from './FirebaseConfigModal'

export const Navbar: React.FC = () => {
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [configProject, setConfigProject] = useState<string>('')

  useEffect(() => {
    const config = getStoredFirebaseConfig()
    const db = getFirebaseDb()
    if (config && db) {
      setIsConnected(true)
      setConfigProject(config.projectId)
    } else {
      setIsConnected(false)
    }
  }, [])

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-lg shadow-2xs">
              🍱
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-neutral-900 leading-none">
                Dapur Nia
              </h1>
              <p className="text-[11px] text-neutral-500 font-normal leading-tight mt-0.5">
                Katering Harian Rumahan
              </p>
            </div>
          </div>

          {/* Connection Status & Config Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConfigModal(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border transition ${
                isConnected
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800 animate-pulse'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <span className="font-medium text-[11px]">
                {isConnected ? configProject : 'Setup DB'}
              </span>
              <Settings2 className="w-3.5 h-3.5 ml-0.5 opacity-60" />
            </button>
          </div>
        </div>
      </header>

      <FirebaseConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
      />
    </>
  )
}
