import React from 'react'
import { MapPin, Phone, MessageSquare, Edit2, Trash2 } from 'lucide-react'
import { Pelanggan } from '../../types'
import { deletePelanggan } from '../../services/pelangganService'

interface Props {
  pelanggan: Pelanggan
  onEdit: (pelanggan: Pelanggan) => void
}

export const PelangganCard: React.FC<Props> = ({ pelanggan, onEdit }) => {
  const handleDelete = async () => {
    if (confirm(`Yakin ingin menghapus pelanggan "${pelanggan.nama}"?`)) {
      try {
        await deletePelanggan(pelanggan.id)
      } catch (err) {
        console.error(err)
      }
    }
  }

  // Format link direct WhatsApp
  const waUrl = `https://wa.me/${pelanggan.nomorWhatsapp.startsWith('0') ? '62' + pelanggan.nomorWhatsapp.slice(1) : pelanggan.nomorWhatsapp}`

  return (
    <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-2xs hover:border-neutral-300 transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h3 className="font-semibold text-neutral-900 text-sm">{pelanggan.nama}</h3>

          <div className="mt-1 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs text-neutral-600 font-mono">
              <Phone className="w-3 h-3 text-neutral-400" />
              {pelanggan.nomorWhatsapp}
            </span>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded hover:bg-emerald-100 transition"
            >
              <MessageSquare className="w-3 h-3" />
              Chat WA
            </a>
          </div>

          <div className="mt-2.5 flex items-start gap-1.5 text-xs text-neutral-600">
            <MapPin className="w-3.5 h-3.5 text-[#C85A32] shrink-0 mt-0.5" />
            <p className="leading-relaxed">{pelanggan.alamat}</p>
          </div>

          {pelanggan.catatan && (
            <p className="mt-1.5 text-[11px] text-neutral-500 bg-neutral-50 p-2 rounded border border-neutral-100 italic">
              " {pelanggan.catatan} "
            </p>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(pelanggan)}
            title="Ubah Pelanggan"
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            title="Hapus Pelanggan"
            className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
