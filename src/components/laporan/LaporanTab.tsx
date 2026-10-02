import React, { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, DollarSign, PackageCheck, ShoppingCart, Download, ChevronDown } from 'lucide-react'
import { Pesanan, DailyReportSummary } from '../../types'
import { subscribePesanan } from '../../services/pesananService'
import { calculateDailyReport } from '../../lib/validation'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Calendar } from '../ui/calendar'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export const LaporanTab: React.FC = () => {
  const [selectedDateObj, setSelectedDateObj] = useState<Date | undefined>(new Date())
  const [showCalendar, setShowCalendar] = useState(false)
  const [allOrders, setAllOrders] = useState<Pesanan[]>([])
  const [report, setReport] = useState<DailyReportSummary | null>(null)

  const selectedDateStr = selectedDateObj
    ? selectedDateObj.toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0]

  useEffect(() => {
    const unsub = subscribePesanan((orders) => {
      setAllOrders(orders)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    const ordersOnDate = allOrders.filter((o) => o.tanggalPesanan === selectedDateStr)
    const summary = calculateDailyReport(ordersOnDate, selectedDateStr)
    setReport(summary)
  }, [allOrders, selectedDateStr])

  const setQuickDate = (offsetDays: number) => {
    const d = new Date()
    d.setDate(d.getDate() + offsetDays)
    setSelectedDateObj(d)
    setShowCalendar(false)
  }

  // Fungsi Cetak & Unduh PDF Laporan (Poin 7)
  const handleDownloadPDF = () => {
    if (!report) return

    const doc = new jsPDF()

    // Header PDF
    doc.setFontSize(18)
    doc.setTextColor(30, 41, 59)
    doc.text('DAPUR NIA - LAPORAN PENJUALAN HARIAN', 14, 20)

    doc.setFontSize(11)
    doc.setTextColor(100, 116, 139)
    doc.text(`Tanggal Laporan: ${selectedDateStr}`, 14, 28)
    doc.text(`Waktu Cetak: ${new Date().toLocaleString('id-ID')}`, 14, 34)

    // Summary Box
    doc.setFontSize(12)
    doc.setTextColor(15, 23, 42)
    doc.text(`Total Omset Uang Masuk: Rp ${report.totalOmset.toLocaleString('id-ID')}`, 14, 46)
    doc.text(`Total Porsi Terjual: ${report.totalPorsiTerjual} porsi`, 14, 53)
    doc.text(`Total Transaksi Pesanan: ${report.totalPesananSukses} pesanan`, 14, 60)

    // Tabel Rincian Menu
    const tableData = Object.values(report.itemSales).map((item, idx) => [
      idx + 1,
      item.namaMenu,
      `${item.porsi} porsi`,
      `Rp ${item.nominal.toLocaleString('id-ID')}`,
    ])

    if (tableData.length === 0) {
      tableData.push(['-', 'Tidak ada transaksi pada tanggal ini', '0', 'Rp 0'])
    }

    autoTable(doc, {
      startY: 68,
      head: [['No', 'Nama Menu Katering', 'Porsi Terjual', 'Total Nominal']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [82, 110, 223] }, // primary indigo shade
    })

    // Footer
    const finalY = (doc as any).lastAutoTable?.finalY || 100
    doc.setFontSize(10)
    doc.setTextColor(148, 163, 184)
    doc.text('Dicetak otomatis dari Sistem Katering Dapur Nia', 14, finalY + 15)

    doc.save(`Laporan_Dapur_Nia_${selectedDateStr}.pdf`)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-foreground">Laporan Penjualan Harian</h2>
          <p className="text-xs text-muted-foreground">
            Ringkasan omset dan porsi menu terjual
          </p>
        </div>
        {/* Tombol Unduh PDF (Poin 7) */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadPDF}
          className="gap-1.5 font-semibold text-xs border-primary/40 text-primary hover:bg-primary/10"
        >
          <Download className="w-3.5 h-3.5" />
          Unduh PDF
        </Button>
      </div>

      {/* Date Picker Card menggunakan UI Shadcn Calendar (Poin 8) */}
      <Card size="sm" className="overflow-hidden">
        <CardContent className="p-3.5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCalendar(!showCalendar)}
              className="gap-2 text-xs font-medium justify-between flex-1"
            >
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                <span>
                  {selectedDateObj
                    ? selectedDateObj.toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : 'Pilih Tanggal'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 opacity-50" />
            </Button>

            <div className="flex items-center gap-1">
              <Button
                variant={selectedDateStr === new Date().toISOString().split('T')[0] ? 'default' : 'secondary'}
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

          {/* Kalender Shadcn dropdown */}
          {showCalendar && (
            <div className="flex justify-center border-t border-border pt-3 animate-in fade-in zoom-in-95 duration-150">
              <Calendar
                mode="single"
                selected={selectedDateObj}
                onSelect={(date) => {
                  if (date) {
                    setSelectedDateObj(date)
                    setShowCalendar(false)
                  }
                }}
                className="rounded-xl border border-border bg-card shadow-xs"
              />
            </div>
          )}
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
            <p className="text-[10px] text-muted-foreground mt-1">Uang masuk pesanan</p>
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
              Dari {report?.totalPesananSukses || 0} pesanan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rincian Porsi per Menu */}
      <Card size="sm">
        <CardHeader className="py-3 border-b border-border flex items-center justify-between">
          <CardTitle className="text-xs font-semibold text-foreground">
            Rincian Menu Terjual ({selectedDateStr})
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
              Pilih tanggal lain atau buat pesanan baru untuk melihat data penjualan.
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
