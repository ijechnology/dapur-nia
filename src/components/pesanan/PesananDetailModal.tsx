import React, { useState } from 'react'
import { X, ArrowRight, CheckCircle2, Clock, ChefHat } from 'lucide-react'
import { Pesanan, OrderStatus } from '../../types'
import { updatePesananStatus } from '../../services/pesananService'
import { useAlert } from '../../context/AlertContext'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'

interface Props {
  isOpen: boolean
  onClose: () => void
  pesanan: Pesanan | null
}

const STATUS_LABELS: Record<OrderStatus, { label: string; variant: 'default' | 'secondary' | 'outline'; icon: any }> = {
  menunggu_pembayaran: {
    label: 'Menunggu Bayar',
    variant: 'outline',
    icon: Clock,
  },
  dikonfirmasi: {
    label: 'Dikonfirmasi',
    variant: 'secondary',
    icon: CheckCircle2,
  },
  diproses: {
    label: 'Diproses',
    variant: 'secondary',
    icon: ChefHat,
  },
  selesai: {
    label: 'Selesai',
    variant: 'default',
    icon: CheckCircle2,
  },
}

export const PesananDetailModal: React.FC<Props> = ({ isOpen, onClose, pesanan }) => {
  const [loading, setLoading] = useState(false)
  const { showAlert } = useAlert()

  if (!isOpen || !pesanan) return null

  const currentConfig = STATUS_LABELS[pesanan.status] || STATUS_LABELS.menunggu_pembayaran
  const StatusIcon = currentConfig.icon

  const handleNextStatus = async (nextStatus: OrderStatus) => {
    setLoading(true)
    try {
      await updatePesananStatus(
        pesanan.id,
        pesanan.status,
        nextStatus,
        pesanan.items
      )
      showAlert('Status Diperbarui', `Status pesanan ${pesanan.nomorPesanan} diubah ke ${STATUS_LABELS[nextStatus].label}`)
      onClose()
    } catch (err: any) {
      showAlert('Gagal Ubah Status', err.message, 'destructive')
    } finally {
      setLoading(false)
    }
  }

  // 4 Status Action Flow: menunggu_pembayaran -> dikonfirmasi -> diproses -> selesai
  const renderActionButtons = () => {
    switch (pesanan.status) {
      case 'menunggu_pembayaran':
        return (
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              onClick={() => handleNextStatus('dikonfirmasi')}
              disabled={loading}
              size="sm"
              className="gap-1.5 font-semibold"
            >
              Konfirmasi Pesanan
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )
      case 'dikonfirmasi':
        return (
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              onClick={() => handleNextStatus('diproses')}
              disabled={loading}
              size="sm"
              className="gap-1.5 font-semibold"
            >
              Proses Pesanan
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )
      case 'diproses':
        return (
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              onClick={() => handleNextStatus('selesai')}
              disabled={loading}
              size="sm"
              className="gap-1.5 font-semibold"
            >
              Selesaikan Pesanan
              <CheckCircle2 className="w-4 h-4" />
            </Button>
          </div>
        )
      case 'selesai':
      default:
        return (
          <p className="text-xs text-muted-foreground italic">
            Pesanan ini sudah selesai dan alur proses telah tuntas.
          </p>
        )
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
          <div>
            <span className="text-[10px] text-muted-foreground font-mono">
              {pesanan.nomorPesanan}
            </span>
            <h2 className="font-heading font-semibold text-foreground text-sm">Rincian Pesanan</h2>
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Status Badge */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20">
            <span className="text-muted-foreground font-medium">Status Alur:</span>
            <Badge variant={currentConfig.variant} className="gap-1.5 text-xs py-1 px-3">
              <StatusIcon className="w-3.5 h-3.5" />
              {currentConfig.label}
            </Badge>
          </div>

          {/* Info Pelanggan */}
          <div className="p-3 bg-muted/30 rounded-xl space-y-1 border border-border/50">
            <p className="font-bold text-foreground text-xs">
              {pesanan.pelangganSnapshot.nama}
            </p>
            <p className="text-muted-foreground font-mono">{pesanan.pelangganSnapshot.nomorWhatsapp}</p>
            <p className="text-muted-foreground mt-1 leading-relaxed">
              📍 {pesanan.pelangganSnapshot.alamat}
            </p>
            {pesanan.catatanPesanan && (
              <p className="text-muted-foreground italic pt-1">
                Catatan: "{pesanan.catatanPesanan}"
              </p>
            )}
          </div>

          {/* Rincian Menu */}
          <div>
            <h3 className="font-semibold text-foreground mb-2">Item Menu Dipesan:</h3>
            <div className="border border-border rounded-xl divide-y divide-border bg-card">
              {pesanan.items.map((item, idx) => (
                <div key={idx} className="p-2.5 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{item.namaMenu}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {item.jumlahPorsi} porsi × Rp {item.hargaSaatPesan.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <span className="font-bold text-foreground tabular-nums">
                    Rp {item.subtotal.toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Biaya */}
          <div className="pt-2 border-t border-border space-y-1">
            <div className="flex justify-between text-muted-foreground">
              <span>Ongkos Kirim:</span>
              <span className="font-semibold tabular-nums text-foreground">
                Rp {pesanan.ongkosKirim.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between font-bold text-sm text-foreground pt-1">
              <span>Total Tagihan:</span>
              <span className="text-primary tabular-nums">
                Rp {pesanan.totalTagihan.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons (FSM 4 States) */}
        <div className="p-4 bg-muted/30 border-t border-border flex items-center">
          {renderActionButtons()}
        </div>
      </div>
    </div>
  )
}
