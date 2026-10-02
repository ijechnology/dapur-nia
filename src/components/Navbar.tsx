import React, { useState, useEffect } from 'react'
import { getFirebaseDb, getEnvFirebaseConfig } from '../lib/firebase'

export const Navbar: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [configProject, setConfigProject] = useState<string>('')

  useEffect(() => {
    const config = getEnvFirebaseConfig()
    const db = getFirebaseDb()
    if (config && db) {
      setIsConnected(true)
      setConfigProject(config.projectId)
    } else {
      setIsConnected(false)
    }
  }, [])

  return (
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

        {/* Status Indikator Sederhana (Read-only dari .env) */}
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-emerald-500' : 'bg-neutral-300'
            }`}
          />
          <span className="text-[11px] font-medium text-neutral-500">
            {isConnected ? configProject : 'Local Demo'}
          </span>
        </div>
      </div>
    </header>
  )
}
