import React from 'react'
import { MapPin, Phone, MessageSquare, Edit2, Trash2 } from 'lucide-react'
import { Pelanggan } from '../../types'
import { deletePelanggan } from '../../services/pelangganService'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
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
    <Card size="sm">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base font-semibold text-foreground">
              {pelanggan.nama}
            </CardTitle>
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-mono">
                <Phone className="w-3 h-3" />
                {pelanggan.nomorWhatsapp}
              </span>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Badge variant="secondary" className="gap-1 hover:bg-secondary/80">
                  <MessageSquare className="w-3 h-3 text-emerald-600" />
                  Chat WA
                </Badge>
              </a>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onEdit(pelanggan)}
              title="Ubah Pelanggan"
            >
              <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleDelete}
              title="Hapus Pelanggan"
              className="hover:text-destructive"
            >
              <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-red-600" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-1 space-y-2">
        <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
          <p className="leading-relaxed text-foreground/90">{pelanggan.alamat}</p>
        </div>

        {pelanggan.catatan && (
          <p className="text-[11px] text-muted-foreground bg-muted/40 p-2 rounded-lg border border-border/50 italic">
            "{pelanggan.catatan}"
          </p>
        )}
      </CardContent>
    </Card>
  )
}
