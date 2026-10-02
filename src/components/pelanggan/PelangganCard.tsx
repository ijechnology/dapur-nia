import React from 'react'
import { MapPin, Phone, MessageSquare, Edit2, Trash2 } from 'lucide-react'
import { Pelanggan } from '../../types'
import { deletePelanggan } from '../../services/pelangganService'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'

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

  const waUrl = `https://wa.me/${
    pelanggan.nomorWhatsapp.startsWith('0')
      ? '62' + pelanggan.nomorWhatsapp.slice(1)
      : pelanggan.nomorWhatsapp
  }`

  return (
    <div className="rounded-2xl border border-border bg-card p-4 transition-all shadow-sm hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 flex-1">
          <h3 className="font-heading text-base font-semibold text-foreground tracking-tight">
            {pelanggan.nama}
          </h3>

          <div className="flex items-center gap-2 pt-0.5">
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-mono">
              <Phone className="w-3 h-3" />
              {pelanggan.nomorWhatsapp}
            </span>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Badge variant="secondary" className="gap-1 hover:bg-secondary/80 text-[11px] cursor-pointer">
                <MessageSquare className="w-3 h-3 text-emerald-600" />
                Chat WA
              </Badge>
            </a>
          </div>

          <div className="pt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
            <p className="leading-relaxed text-foreground/90">{pelanggan.alamat}</p>
          </div>

          {pelanggan.catatan && (
            <p className="mt-1 text-[11px] text-muted-foreground bg-muted/50 p-2 rounded-xl border border-border/40 italic">
              "{pelanggan.catatan}"
            </p>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onEdit(pelanggan)}
            title="Ubah Pelanggan"
            className="text-muted-foreground hover:text-foreground"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleDelete}
            title="Hapus Pelanggan"
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
