import React from 'react'
import { ChevronRight, Clock, CheckCircle2, Truck, ChefHat, Ban } from 'lucide-react'
import { Pesanan, OrderStatus } from '../../types'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card'
import { Badge } from '../ui/badge'

interface Props {
  pesanan: Pesanan
  onClick: (pesanan: Pesanan) => void
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { text: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }
> = {
  menunggu_pembayaran: {
    text: 'Menunggu Bayar',
    variant: 'outline',
    icon: Clock,
  },
  dikonfirmasi: {
    text: 'Dikonfirmasi',
    variant: 'secondary',
    icon: CheckCircle2,
  },
  diproses: {
    text: 'Dimasak',
    variant: 'secondary',
    icon: ChefHat,
  },
  dikirim: {
    text: 'Dikirim',
    variant: 'default',
    icon: Truck,
  },
  selesai: {
    text: 'Selesai',
    variant: 'default',
    icon: CheckCircle2,
  },
  dibatalkan: {
    text: 'Batal',
    variant: 'destructive',
    icon: Ban,
  },
}

export const PesananCard: React.FC<Props> = ({ pesanan, onClick }) => {
  const config = STATUS_CONFIG[pesanan.status]
  const Icon = config.icon

  const totalPorsi = pesanan.items.reduce((sum, i) => sum + i.jumlahPorsi, 0)
  const itemsText = pesanan.items.map((i) => `${i.namaMenu} (${i.jumlahPorsi})`).join(', ')

  return (
    <Card
      size="sm"
      onClick={() => onClick(pesanan)}
      className="cursor-pointer hover:border-primary/50 transition-all active:scale-99"
    >
      <CardHeader className="pb-1.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-muted-foreground">
                {pesanan.nomorPesanan}
              </span>
              <Badge variant={config.variant} className="gap-1 text-[10px] py-0">
                <Icon className="w-2.5 h-2.5" />
                {config.text}
              </Badge>
            </div>

            <CardTitle className="text-base font-semibold text-foreground mt-1">
              {pesanan.pelangganSnapshot.nama}
            </CardTitle>
          </div>

          <ChevronRight className="w-4 h-4 text-muted-foreground mt-1" />
        </div>
      </CardHeader>

      <CardContent className="py-1">
        <p className="text-xs text-muted-foreground line-clamp-1">
          {itemsText} • Total {totalPorsi} porsi
        </p>
      </CardContent>

      <CardFooter className="pt-2 border-t border-border flex items-center justify-between text-xs">
        <span className="text-muted-foreground text-[11px] font-mono">
          {pesanan.tanggalPesanan}
        </span>
        <span className="font-bold text-primary tabular-nums text-sm">
          Rp {pesanan.totalTagihan.toLocaleString('id-ID')}
        </span>
      </CardFooter>
    </Card>
  )
}
