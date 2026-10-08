import React, { useState } from 'react'
import { X, ArrowRight, CheckCircle2, Clock, ChefHat, Ban, MapPin } from 'lucide-react'
import { Pesanan, OrderStatus } from '../../types'
import { updatePesananStatus } from '../../services/pesananService'
import { useAlert } from '../../context/AlertContext'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'

interface Props {
  isOpen: boolean
  onClose: () => void
  pesanan: Pesanan | null
}

const STATUS_LABELS: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive'; icon: any }
> = {
  menunggu_bayar: {
    label: 'Menunggu Bayar',
    variant: 'outline',
    icon: Clock,
  },
  menunggu: {
    label: 'Menunggu Bayar',
    variant: 'outline',
    icon: Clock,
  },
  menunggu_pembayaran: {
    label: 'Menunggu Bayar',
    variant: 'outline',
    icon: Clock,
  },
  dibayar: {
    label: 'Dibayar',
    variant: 'secondary',
    icon: CheckCircle2,
  },
  dikonfirmasi: {
    label: 'Dibayar',
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
  dibatalkan: {
    label: 'Dibatalkan',
    variant: 'destructive',
    icon: Ban,
  },
}

export const PesananDetailModal: React.FC<Props> = ({ isOpen, onClose, pesanan }) => {
  const { isStaffOrOwner } = useAuth()
  const [loading, setLoading] = useState(false)
  const { showAlert } = useAlert()

  if (!isOpen || !pesanan) return null

  const currentConfig = STATUS_LABELS[pesanan.status] || STATUS_LABELS.menunggu_bayar
  const StatusIcon = currentConfig.icon

  const handleNextStatus = async (nextStatus: OrderStatus) => {
    setLoading(true)
    try {
      await updatePesananStatus(pesanan.id, pesanan.status, nextStatus)
      showAlert(
        'Status Diperbarui',
        `Status pesanan diubah ke ${STATUS_LABELS[nextStatus]?.label || nextStatus}`
      )
      onClose()
    } catch (err: any) {
      showAlert('Gagal Ubah Status', err.message, 'destructive')
    } finally {
      setLoading(false)
    }
  }

  // Alur status resmi Skema:
  // menunggu_bayar -> dibayar atau dibatalkan
  // dibayar -> diproses atau dibatalkan
  // diproses -> selesai
  // selesai & dibatalkan -> terminal
  const renderActionButtons = () => {
    // Jika pelanggan (bukan staf/pemilik), hanya lihat detail atau batalkan jika belum bayar
    if (!isStaffOrOwner) {
      const s = pesanan.status as string
      if (s === 'menunggu_bayar' || s === 'menunggu' || s === 'menunggu_pembayaran') {
        return (
          <div className="flex items-center justify-between gap-2 w-full">
            <Button
              variant="outline"
              onClick={() => handleNextStatus('dibatalkan')}
              disabled={loading}
              size="sm"
              className="text-destructive hover:bg-destructive/10 gap-1 text-xs cursor-pointer"
            >
              <Ban className="w-3.5 h-3.5" />
              Batalkan Pesanan
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs cursor-pointer"
            >
              Tutup
            </Button>
          </div>
        )
      }
      return (
        <div className="flex items-center justify-end w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs cursor-pointer"
          >
            Tutup
          </Button>
        </div>
      )
    }

    // Role Staf / Pemilik:
    const s = pesanan.status as string
    if (s === 'menunggu_bayar' || s === 'menunggu' || s === 'menunggu_pembayaran') {
      return (
        <div className="flex items-center justify-between gap-2 w-full">
          <Button
            variant="outline"
            onClick={() => handleNextStatus('dibatalkan')}
            disabled={loading}
            size="sm"
            className="text-destructive hover:bg-destructive/10 gap-1 text-xs cursor-pointer"
          >
            <Ban className="w-3.5 h-3.5" />
            Batalkan
          </Button>
          <Button
            onClick={() => handleNextStatus('dibayar')}
            disabled={loading}
            size="sm"
            className="gap-1.5 font-semibold text-xs cursor-pointer shadow-xs"
          >
            Konfirmasi Pembayaran
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      )
    }

    if (s === 'dibayar' || s === 'dikonfirmasi') {
      return (
        <div className="flex items-center justify-between gap-2 w-full">
          <Button
            variant="outline"
            onClick={() => handleNextStatus('dibatalkan')}
            disabled={loading}
            size="sm"
            className="text-destructive hover:bg-destructive/10 gap-1 text-xs cursor-pointer"
          >
            <Ban className="w-3.5 h-3.5" />
            Batalkan
          </Button>
          <Button
            onClick={() => handleNextStatus('diproses')}
            disabled={loading}
            size="sm"
            className="gap-1.5 font-semibold text-xs cursor-pointer shadow-xs"
          >
            Proses Pesanan
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      )
    }

    if (s === 'diproses') {
      return (
        <div className="flex items-center justify-end gap-2 w-full">
          <Button
            onClick={() => handleNextStatus('selesai')}
            disabled={loading}
            size="sm"
            className="gap-1.5 font-semibold text-xs cursor-pointer shadow-xs"
          >
            Selesaikan Pesanan
            <CheckCircle2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      )
    }

    if (s === 'dibatalkan') {
      return (
        <div className="flex items-center justify-between gap-2 w-full">
          <p className="text-xs text-destructive italic">
            Pesanan ini telah dibatalkan.
          </p>
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs cursor-pointer">
            Tutup
          </Button>
        </div>
      )
    }

    return (
      <div className="flex items-center justify-between gap-2 w-full">
        <p className="text-xs text-muted-foreground italic">
          Pesanan ini sudah selesai.
        </p>
        <Button variant="outline" size="sm" onClick={onClose} className="text-xs cursor-pointer">
          Tutup
        </Button>
      </div>
    )
  }

  const pNama = pesanan.nama_pelanggan || pesanan.pelangganSnapshot?.nama || 'Pelanggan'
  const pWA = pesanan.pelanggan_id || pesanan.pelangganSnapshot?.nomorWhatsapp || '-'
  const pAlamat = pesanan.alamat_kirim || pesanan.pelangganSnapshot?.alamat || '-'

  const orderItems =
    Array.isArray(pesanan.items) && pesanan.items.length > 0
      ? pesanan.items
      : [
          {
            menu_id: pesanan.menu_id || '',
            nama_menu: pesanan.nama_menu || 'Menu',
            harga_satuan: Number(pesanan.harga_satuan || 0),
            jumlah_porsi: Number(pesanan.jumlah_porsi || 1),
            subtotal: Number(pesanan.harga_satuan || 0) * Number(pesanan.jumlah_porsi || 1),
          },
        ]

  const totalItemSubtotal = orderItems.reduce(
    (s, it) =>
      s +
      (it.subtotal ||
        (it.harga_satuan || it.hargaSaatPesan || 0) * (it.jumlah_porsi || it.jumlahPorsi || 1)),
    0
  )
  const ongkir = Number(pesanan.ongkir ?? pesanan.ongkosKirim ?? 0)
  const total = Number(pesanan.total ?? pesanan.totalTagihan ?? totalItemSubtotal + ongkir)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[88vh] relative z-50">
        {/* Header Sticky (Shrink-0) */}
        <div className="shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-border bg-slate-50/80 dark:bg-muted/30">
          <div>
            <span className="text-[10px] text-muted-foreground font-mono">
              {pesanan.nomorPesanan || pesanan.id}
            </span>
            <h2 className="font-heading font-semibold text-foreground text-sm">
              Rincian Pesanan
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content Scrollable (Anti-Overbig) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs bg-white dark:bg-card overscroll-contain">
          {/* Status Badge */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20">
            <span className="text-muted-foreground font-medium">Status Pesanan:</span>
            <Badge variant={currentConfig.variant} className="gap-1.5 text-xs py-1 px-3">
              <StatusIcon className="w-3.5 h-3.5" />
              {currentConfig.label}
            </Badge>
          </div>

          {/* Info Pelanggan */}
          <div className="p-3 bg-muted/30 rounded-xl space-y-1 border border-border/50">
            <p className="font-bold text-foreground text-xs">{pNama}</p>
            {pWA !== '-' && <p className="text-muted-foreground font-mono">{pWA}</p>}
            <p className="text-muted-foreground mt-1 leading-relaxed flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
              <span>{pAlamat}</span>
            </p>
            {pesanan.catatanPesanan && (
              <p className="text-muted-foreground italic pt-1">
                Catatan: "{pesanan.catatanPesanan}"
              </p>
            )}
          </div>

          {/* Rincian Menu Dipesan */}
          <div>
            <h3 className="font-semibold text-foreground mb-2">
              Item Menu Dipesan ({orderItems.length} menu):
            </h3>
            <div className="border border-border rounded-xl divide-y divide-border bg-card">
              {orderItems.map((item, idx) => {
                const itemNama = item.nama_menu || item.namaMenu || 'Menu'
                const itemPorsi = Number(item.jumlah_porsi ?? item.jumlahPorsi ?? 1)
                const itemHarga = Number(item.harga_satuan ?? item.hargaSaatPesan ?? 0)
                const itemSubtotal = Number(item.subtotal ?? itemHarga * itemPorsi)
                return (
                  <div key={idx} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{itemNama}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {itemPorsi} porsi × Rp {itemHarga.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <span className="font-bold text-foreground tabular-nums">
                      Rp {itemSubtotal.toLocaleString('id-ID')}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Biaya */}
          <div className="pt-2 border-t border-border space-y-1">
            <div className="flex justify-between text-muted-foreground">
              <span>Ongkos Kirim:</span>
              <span className="font-semibold tabular-nums text-foreground">
                Rp {ongkir.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between font-bold text-sm text-foreground pt-1">
              <span>Total Tagihan:</span>
              <span className="text-primary tabular-nums">
                Rp {total.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons Sticky (Shrink-0) */}
        <div className="shrink-0 p-4 bg-muted/30 border-t border-border flex items-center">
          {renderActionButtons()}
        </div>
      </div>
    </div>
  )
}
