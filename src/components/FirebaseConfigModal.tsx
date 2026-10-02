import React, { useState, useEffect } from 'react'
import { X, Database, ShieldCheck, Trash2 } from 'lucide-react'
import { FirebaseConfig, getStoredFirebaseConfig, saveFirebaseConfig, clearFirebaseConfig } from '../lib/firebase'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export const FirebaseConfigModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<FirebaseConfig>({
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
  })

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredFirebaseConfig()
      if (stored) {
        setFormData(stored)
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.apiKey.trim() || !formData.projectId.trim()) {
      alert('API Key dan Project ID wajib diisi!')
      return
    }
    saveFirebaseConfig(formData)
  }

  const handleReset = () => {
    if (confirm('Yakin ingin menghapus konfigurasi Firebase lokal ini?')) {
      clearFirebaseConfig()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-xl border border-neutral-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 bg-neutral-50/50">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#C85A32]" />
            <h2 className="font-semibold text-neutral-800 text-base">Konfigurasi Cloud Firestore</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-sm">
          <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-lg text-amber-900 text-xs leading-relaxed">
            Kredensial disimpan secara aman di peramban (localStorage) Anda untuk sesi latihan Dapur Nia Sesi 3 tanpa perlu restart server.
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Firebase Project ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="contoh: dapur-nia-app"
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85A32] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Web API Key <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="AIzaSy..."
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85A32] focus:border-transparent font-mono text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Auth Domain</label>
              <input
                type="text"
                placeholder="project.firebaseapp.com"
                value={formData.authDomain}
                onChange={(e) => setFormData({ ...formData, authDomain: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85A32] text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">App ID</label>
              <input
                type="text"
                placeholder="1:123456:web:abcd"
                value={formData.appId}
                onChange={(e) => setFormData({ ...formData, appId: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85A32] text-xs font-mono"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <Trash2 className="w-4 h-4" />
              Reset Config
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#C85A32] hover:bg-[#b44b25] rounded-lg shadow-sm transition active:scale-98"
              >
                <ShieldCheck className="w-4 h-4" />
                Simpan & Hubungkan
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
