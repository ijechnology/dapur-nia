import { useState, useEffect } from 'react'
import { Calendar, DollarSign, PackageCheck, ShoppingCart } from 'lucide-react'
import { Pesanan, DailyReportSummary } from '../../types'
import { subscribePesanan } from '../../services/pesananService'
import { calculateDailyReport } from '../../lib/validation'

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
    // Filter pesanan yang cocok dengan selectedDate
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
        <h2 className="text-base font-bold text-neutral-900">Laporan Penjualan Harian</h2>
        <p className="text-xs text-neutral-500">
          Ringkasan omset dan porsi menu terjual (pesanan batal diabaikan otomatis)
        </p>
      </div>

      {/* Date Picker Controls */}
      <div className="bg-white p-3.5 rounded-xl border border-neutral-200 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700">
            <Calendar className="w-4 h-4 text-[#C85A32]" />
            <span>Pilih Tanggal:</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setQuickDate(0)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition ${
                selectedDate === today
                  ? 'bg-[#1C1E1B] text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => setQuickDate(-1)}
              className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition"
            >
              Kemarin
            </button>
          </div>
        </div>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
        />
      </div>

      {/* Stat Summary Widgets */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Omset */}
        <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-2xs">
          <div className="flex items-center gap-1.5 text-neutral-500 text-xs font-medium mb-1">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Total Omset Masuk</span>
          </div>
          <div className="text-lg font-bold text-neutral-900 tabular-nums">
            Rp {(report?.totalOmset || 0).toLocaleString('id-ID')}
          </div>
          <p className="text-[10px] text-neutral-400 mt-1">Uang masuk pesanan aktif</p>
        </div>

        {/* Total Porsi */}
        <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-2xs">
          <div className="flex items-center gap-1.5 text-neutral-500 text-xs font-medium mb-1">
            <PackageCheck className="w-4 h-4 text-[#C85A32]" />
            <span>Porsi Terjual</span>
          </div>
          <div className="text-lg font-bold text-neutral-900 tabular-nums">
            {report?.totalPorsiTerjual || 0}{' '}
            <span className="text-xs font-normal text-neutral-500">porsi</span>
          </div>
          <p className="text-[10px] text-neutral-400 mt-1">
            Dari {report?.totalPesananSukses || 0} pesanan sah
          </p>
        </div>
      </div>

      {/* Rincian Porsi per Menu */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-2xs">
        <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="font-semibold text-neutral-800 text-xs">
            Rincian Menu Terjual ({selectedDate})
          </h3>
          <span className="text-[11px] text-neutral-400">
            {Object.keys(report?.itemSales || {}).length} menu
          </span>
        </div>

        {report && Object.keys(report.itemSales).length > 0 ? (
          <div className="divide-y divide-neutral-100 text-xs">
            {Object.entries(report.itemSales).map(([menuId, item]) => (
              <div
                key={menuId}
                className="p-3.5 flex items-center justify-between hover:bg-neutral-50/60 transition"
              >
                <div>
                  <p className="font-semibold text-neutral-800">{item.namaMenu}</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Terjual <span className="font-bold text-neutral-800">{item.porsi}</span> porsi
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#C85A32] tabular-nums">
                    Rp {item.nominal.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State Laporan */
          <div className="p-8 text-center">
            <ShoppingCart className="w-7 h-7 mx-auto text-neutral-300 mb-2" />
            <p className="text-xs font-semibold text-neutral-700">
              Belum ada pesanan pada tanggal ini
            </p>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Pesanan berstatus batal atau hari tanpa pesanan tidak memunculkan data penjualan.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
