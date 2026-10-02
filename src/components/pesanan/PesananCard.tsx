import React from 'react'
import { ChevronRight, Clock, CheckCircle2, Truck, ChefHat, Ban } from 'lucide-react'
import { Pesanan, OrderStatus } from '../../types'

interface Props {
  pesanan: Pesanan
  onClick: (pesanan: Pesanan) => void
}

const STATUS_BADGE: Record<OrderStatus, { text: string; bg: string; icon: any }> = {
  menunggu_pembayaran: {
    text: 'Menunggu Bayar',
    bg: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: Clock,
  },
  dikonfirmasi: {
    text: 'Dikonfirmasi',
    bg: 'bg-blue-50 text-blue-800 border-blue-200',
    icon: CheckCircle2,
  },
  diproses: {
    text: 'Dimasak',
    bg: 'bg-purple-50 text-purple-800 border-purple-200',
    icon: ChefHat,
  },
  dikirim: {
    text: 'Dikirim',
    bg: 'bg-orange-50 text-orange-800 border-orange-200',
    icon: Truck,
  },
  selesai: {
    text: 'Selesai',
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: CheckCircle2,
  },
  dibatalkan: {
    text: 'Batal',
    bg: 'bg-neutral-100 text-neutral-600 border-neutral-200',
    icon: Ban,
  },
}

export const PesananCard: React.FC<Props> = ({ pesanan, onClick }) => {
  const badge = STATUS_BADGE[pesanan.status]
  const Icon = badge.icon

  const totalPorsi = pesanan.items.reduce((sum, i) => sum + i.jumlahPorsi, 0)
  const itemsText = pesanan.items.map((i) => `${i.namaMenu} (${i.jumlahPorsi})`).join(', ')

  return (
    <div
      onClick={() => onClick(pesanan)}
      className="p-4 rounded-xl border border-neutral-200 bg-white shadow-2xs hover:border-neutral-300 transition-all cursor-pointer active:scale-99"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-neutral-400">
              {pesanan.nomorPesanan}
            </span>
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.bg}`}
            >
              <Icon className="w-3 h-3" />
              {badge.text}
            </span>
          </div>

          <h3 className="font-semibold text-neutral-900 text-sm mt-1">
            {pesanan.pelangganSnapshot.nama}
          </h3>
        </div>

        <ChevronRight className="w-4 h-4 text-neutral-400 mt-1" />
      </div>

      <p className="text-xs text-neutral-500 mt-1.5 line-clamp-1">
        {itemsText} • Total {totalPorsi} porsi
      </p>

      <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-xs">
        <span className="text-neutral-400 text-[11px]">
          {pesanan.tanggalPesanan}
        </span>
        <span className="font-bold text-[#C85A32] tabular-nums text-sm">
          Rp {pesanan.totalTagihan.toLocaleString('id-ID')}
        </span>
      </div>
    </div>
  )
}
