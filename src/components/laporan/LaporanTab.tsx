import React, { useState, useEffect } from 'react'
import { Calendar, DollarSign, PackageCheck, ShoppingCart } from 'lucide-react'
import { Pesanan, DailyReportSummary } from '../../types'
import { subscribePesanan } from '../../services/pesananService'
import { calculateDailyReport } from '../../lib/validation'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Button } from '../ui/button'

export const LaporanTab: React.FC = () => {
  const today = new Date().toISOString().split('T')[0]
  const [selectedDate, setSelectedDate] = useState<string>(today)
  const [allOrders, setAllOrders] = useState<Pesanan[]>([])
  const [report, setReport] = useState<DailyReportSummary | null>(null)

  useEffect(() => {
    const unsub = subscribePesanan((orders) => {
      setAllOrders(orders)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    const ordersOnDate = allOrders.filter((o) => o.tanggalPesanan === selectedDate)
    const summary = calculateDailyReport(ordersOnDate, selectedDate)
    setReport(summary)
  }, [allOrders, selectedDate])

  const setQuickDate = (offsetDays: number) => {
    const d = new Date()
    d.setDate(d.getDate() + offsetDays)
    setSelectedDate(d.toISOString().split('T')[0])
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-foreground">Laporan Penjualan Harian</h2>
        <p className="text-xs text-muted-foreground">
          Ringkasan omset dan porsi menu terjual (pesanan batal diabaikan otomatis)
        </p>
      </div>

      {/* Date Picker Controls */}
      <Card size="sm">
        <CardContent className="p-3.5 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Calendar className="w-4 h-4 text-primary" />
              <span>Pilih Tanggal:</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant={selectedDate === today ? 'default' : 'secondary'}
                size="xs"
                onClick={() => setQuickDate(0)}
              >
                Hari Ini
              </Button>
              <Button
                variant="secondary"
                size="xs"
                onClick={() => setQuickDate(-1)}
              >
                Kemarin
              </Button>
            </div>
          </div>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-1.5 border border-input rounded-xl text-xs font-medium bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </CardContent>
      </Card>

      {/* Stat Summary Widgets */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Omset */}
        <Card size="sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium mb-1">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Total Omset</span>
            </div>
            <div className="text-lg font-bold text-foreground tabular-nums">
              Rp {(report?.totalOmset || 0).toLocaleString('id-ID')}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Uang masuk pesanan aktif</p>
          </CardContent>
        </Card>

        {/* Total Porsi */}
        <Card size="sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium mb-1">
              <PackageCheck className="w-4 h-4 text-primary" />
              <span>Porsi Terjual</span>
            </div>
            <div className="text-lg font-bold text-foreground tabular-nums">
              {report?.totalPorsiTerjual || 0}{' '}
              <span className="text-xs font-normal text-muted-foreground">porsi</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Dari {report?.totalPesananSukses || 0} pesanan sah
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rincian Porsi per Menu */}
      <Card size="sm">
        <CardHeader className="py-3 border-b border-border flex items-center justify-between">
          <CardTitle className="text-xs font-semibold text-foreground">
            Rincian Menu Terjual ({selectedDate})
          </CardTitle>
          <span className="text-[11px] text-muted-foreground">
            {Object.keys(report?.itemSales || {}).length} menu
          </span>
        </CardHeader>

        {report && Object.keys(report.itemSales).length > 0 ? (
          <div className="divide-y divide-border text-xs">
            {Object.entries(report.itemSales).map(([menuId, item]) => (
              <div
                key={menuId}
                className="p-3.5 flex items-center justify-between hover:bg-muted/40 transition"
              >
                <div>
                  <p className="font-semibold text-foreground">{item.namaMenu}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Terjual <span className="font-bold text-foreground">{item.porsi}</span> porsi
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary tabular-nums">
                    Rp {item.nominal.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <ShoppingCart className="w-7 h-7 mx-auto text-muted-foreground/60 mb-2" />
            <p className="text-xs font-semibold text-foreground">
              Belum ada pesanan pada tanggal ini
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Pesanan berstatus batal atau hari tanpa pesanan tidak memunculkan data penjualan.
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
