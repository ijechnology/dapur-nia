import React from 'react'
import { ArrowRight, X } from 'lucide-react'
import { Button } from '../ui/button'

interface Props {
  totalItems: number
  totalHarga: number
  onCheckout: () => void
  onReset: () => void
}

export const FloatingOrderBar: React.FC<Props> = ({
  totalItems,
  totalHarga,
  onCheckout,
  onReset,
}) => {
  if (totalItems <= 0) return null

  return (
    <div
      className="fixed left-0 right-0 z-50 px-4 pointer-events-none transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
      style={{ bottom: '76px' }}
    >
      <div className="max-w-md mx-auto pointer-events-auto shadow-2xl">
        {/* Bar Solid Minimalis: Hanya Berapa Porsi dan Berapa Harganya */}
        <div className="bg-card text-card-foreground rounded-xl px-4 py-3 shadow-lg border border-border flex items-center justify-between gap-3">
          {/* Informasi Ringkas: X Porsi • Rp XX.XXX */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-semibold text-xs sm:text-sm text-foreground whitespace-nowrap">
              {totalItems} Porsi
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="font-bold text-xs sm:text-sm text-primary tabular-nums truncate">
              Rp {totalHarga.toLocaleString('id-ID')}
            </span>
          </div>

          {/* Tombol Aksi Bersih */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onReset}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition cursor-pointer"
              title="Batalkan pilihan"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <Button
              size="sm"
              onClick={onCheckout}
              className="font-bold text-xs shadow-xs gap-1.5 px-3 py-1.5 h-8 rounded-lg cursor-pointer"
            >
              Lanjut Pesan
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
