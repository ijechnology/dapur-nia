import React, { useState } from 'react'
import { X, ArrowRight, Ban, CheckCircle2, Clock, Truck, ChefHat } from 'lucide-react'
import { Pesanan, OrderStatus } from '../../types'
import { updatePesananStatus } from '../../services/pesananService'

interface Props {
  isOpen: boolean
  onClose: () => void
  pesanan: Pesanan | null
}

const STATUS_LABELS: Record<OrderStatus, { label: string; color: string; icon: any }> = {
  menunggu_pembayaran: {
    label: 'Menunggu Pembayaran',
    color: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: Clock,
  },
  dikonfirmasi: {
    label: 'Dikonfirmasi',
    color: 'bg-blue-50 text-blue-800 border-blue-200',
    icon: CheckCircle2,
  },
  diproses: {
    label: 'Sedang Dimasak',
    color: 'bg-purple-50 text-purple-800 border-purple-200',
    icon: ChefHat,
  },
  dikirim: {
    label: 'Sedang Dikirim',
    color: 'bg-orange-50 text-orange-800 border-orange-200',
    icon: Truck,
  },
  selesai: {
    label: 'Selesai',
    color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: CheckCircle2,
  },
  dibatalkan: {
    label: 'Dibatalkan',
    color: 'bg-neutral-100 text-neutral-600 border-neutral-200',
    icon: Ban,
  },
}

export const PesananDetailModal: React.FC<Props> = ({ isOpen, onClose, pesanan }) => {
  const [loading, setLoading] = useState(false)

  if (!isOpen || !pesanan) return null

  const currentConfig = STATUS_LABELS[pesanan.status]
  const StatusIcon = currentConfig.icon

  const handleNextStatus = async (nextStatus: OrderStatus) => {
    setLoading(true)
    try {
      await updatePesananStatus(
        pesanan.id,
        pesanan.status,
        nextStatus,
        pesanan.items // disertakan jika status dibatalkan untuk refund porsi
      )
      onClose()
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah status pesanan')
    } finally {
      setLoading(false)
    }
  }

  // Menentukan tombol aksi transisi berikutnya yang SAH
  const renderActionButtons = () => {
    switch (pesanan.status) {
      case 'menunggu_pembayaran':
        return (
          <div className="flex items-center justify-between gap-2 w-full">
            <button
              onClick={() => handleNextStatus('dibatalkan')}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <Ban className="w-4 h-4" />
              Batalkan Pesanan
            </button>
            <button
              onClick={() => handleNextStatus('dikonfirmasi')}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
            >
              Konfirmasi Bayar
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )
      case 'dikonfirmasi':
        return (
          <div className="flex items-center justify-between gap-2 w-full">
            <button
              onClick={() => handleNextStatus('dibatalkan')}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <Ban className="w-4 h-4" />
              Batalkan Pesanan
            </button>
            <button
              onClick={() => handleNextStatus('diproses')}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition"
            >
              Mulai Masak
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )
      case 'diproses':
        return (
          <div className="flex items-center justify-end gap-2 w-full">
            <button
              onClick={() => handleNextStatus('dikirim')}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-sm transition"
            >
              Kirim ke Pelanggan
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )
      case 'dikirim':
        return (
          <div className="flex items-center justify-end gap-2 w-full">
            <button
              onClick={() => handleNextStatus('selesai')}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition"
            >
              Selesaikan Pesanan
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        )
      case 'selesai':
      case 'dibatalkan':
      default:
        return (
          <p className="text-xs text-neutral-400 italic">
            Pesanan ini sudah mencapai status akhir dan tidak dapat diubah lagi.
          </p>
        )
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-xl border border-neutral-200 shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 bg-neutral-50/50">
          <div>
            <span className="text-[10px] text-neutral-400 font-mono">
              {pesanan.nomorPesanan}
            </span>
            <h2 className="font-semibold text-neutral-800 text-sm">Rincian Pesanan</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Status Badge */}
          <div className="flex items-center justify-between p-3 rounded-lg border bg-neutral-50/50">
            <span className="text-neutral-500 font-medium">Status Alur:</span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold border ${currentConfig.color}`}
            >
              <StatusIcon className="w-3.5 h-3.5" />
              {currentConfig.label}
            </span>
          </div>

          {/* Info Pelanggan */}
          <div className="p-3 bg-neutral-50 rounded-lg space-y-1">
            <p className="font-bold text-neutral-900 text-xs">
              {pesanan.pelangganSnapshot.nama}
            </p>
            <p className="text-neutral-600 font-mono">{pesanan.pelangganSnapshot.nomorWhatsapp}</p>
            <p className="text-neutral-600 mt-1 leading-relaxed">
              📍 {pesanan.pelangganSnapshot.alamat}
            </p>
            {pesanan.catatanPesanan && (
              <p className="text-neutral-500 italic pt-1">
                Catatan: "{pesanan.catatanPesanan}"
              </p>
            )}
          </div>

          {/* Rincian Menu */}
          <div>
            <h3 className="font-semibold text-neutral-700 mb-2">Item Menu Dipesan:</h3>
            <div className="border border-neutral-200 rounded-lg divide-y divide-neutral-100 bg-white">
              {pesanan.items.map((item, idx) => (
                <div key={idx} className="p-2.5 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-neutral-800">{item.namaMenu}</p>
                    <p className="text-[11px] text-neutral-500">
                      {item.jumlahPorsi} porsi × Rp {item.hargaSaatPesan.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <span className="font-bold text-neutral-800 tabular-nums">
                    Rp {item.subtotal.toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Biaya */}
          <div className="pt-2 border-t border-neutral-100 space-y-1">
            <div className="flex justify-between text-neutral-600">
              <span>Ongkos Kirim:</span>
              <span className="font-semibold tabular-nums">
                Rp {pesanan.ongkosKirim.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between font-bold text-sm text-neutral-900 pt-1">
              <span>Total Tagihan:</span>
              <span className="text-[#C85A32] tabular-nums">
                Rp {pesanan.totalTagihan.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons (FSM Restricted) */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex items-center">
          {renderActionButtons()}
        </div>
      </div>
    </div>
  )
}
