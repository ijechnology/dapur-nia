import React from 'react'
import { ChevronRight, Clock, CheckCircle2, ChefHat } from 'lucide-react'
import { Pesanan } from '../../types'
import { Badge } from '../ui/badge'

interface Props {
  pesanan: Pesanan
  onClick: (pesanan: Pesanan) => void
}

const STATUS_CONFIG: Record<
  string,
  { text: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }
> = {
  menunggu_bayar: {
    text: 'Menunggu Bayar',
    variant: 'outline',
    icon: Clock,
  },
  menunggu: {
    text: 'Menunggu Bayar',
    variant: 'outline',
    icon: Clock,
  },
  menunggu_pembayaran: {
    text: 'Menunggu Bayar',
    variant: 'outline',
    icon: Clock,
  },
  dibayar: {
    text: 'Dibayar',
    variant: 'secondary',
    icon: CheckCircle2,
  },
  dikonfirmasi: {
    text: 'Dibayar',
    variant: 'secondary',
    icon: CheckCircle2,
  },
  diproses: {
    text: 'Diproses',
    variant: 'secondary',
    icon: ChefHat,
  },
  selesai: {
    text: 'Selesai',
    variant: 'default',
    icon: CheckCircle2,
  },
  dibatalkan: {
    text: 'Dibatalkan',
    variant: 'destructive',
    icon: Clock,
  },
}

export const PesananCard: React.FC<Props> = ({ pesanan, onClick }) => {
  const config = STATUS_CONFIG[pesanan.status] || STATUS_CONFIG.menunggu_bayar
  const Icon = config.icon

  const totalPorsi = pesanan.items && pesanan.items.length > 0
    ? pesanan.items.reduce((sum, i) => sum + Number(i.jumlah_porsi ?? i.jumlahPorsi ?? 0), 0)
    : Number(pesanan.jumlah_porsi || 0)

  const itemsText = pesanan.items && pesanan.items.length > 0
    ? pesanan.items.map((i) => `${i.nama_menu || i.namaMenu} (${i.jumlah_porsi ?? i.jumlahPorsi}x)`).join(', ')
    : (pesanan.nama_menu ? `${pesanan.nama_menu} (${pesanan.jumlah_porsi} porsi)` : '-')

  const customerName = pesanan.nama_pelanggan || pesanan.pelangganSnapshot?.nama || 'Pelanggan'
  const nomorOrder = pesanan.nomorPesanan || pesanan.id
  const orderDate = pesanan.tanggalPesanan || pesanan.tanggal || '-'
  const grandTotal = pesanan.total ?? pesanan.totalTagihan ?? 0

  return (
    <div
      onClick={() => onClick(pesanan)}
      className="rounded-2xl border border-border bg-card p-4 transition-all shadow-sm hover:shadow-md hover:border-primary/40 cursor-pointer active:scale-99"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-muted-foreground">
              {nomorOrder}
            </span>
            <Badge variant={config.variant} className="gap-1 text-[10px] py-0.5">
              <Icon className="w-2.5 h-2.5" />
              {config.text}
            </Badge>
          </div>

          <h3 className="font-heading text-base font-semibold text-foreground tracking-tight pt-0.5">
            {customerName}
          </h3>
        </div>

        <ChevronRight className="w-4 h-4 text-muted-foreground mt-1" />
      </div>

      <p className="text-xs text-muted-foreground line-clamp-1 mt-2">
        {itemsText} • Total {totalPorsi} porsi
      </p>

      <div className="mt-3.5 pt-3 border-t border-border flex items-center justify-between text-xs">
        <span className="text-muted-foreground text-[11px] font-mono">
          {orderDate}
        </span>
        <span className="font-bold text-primary tabular-nums text-sm">
          Rp {grandTotal.toLocaleString('id-ID')}
        </span>
      </div>
    </div>
  )
}
