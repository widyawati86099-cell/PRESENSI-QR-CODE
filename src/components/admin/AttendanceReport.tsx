import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  FileSpreadsheet, 
  Printer, 
  Plus, 
  Calendar,
  CheckCircle2,
  Trash2,
  MapPin
} from 'lucide-react';
import { useAttendance } from '../../context/AttendanceContext';
import { AttendanceRecord, Department, AttendanceStatus } from '../../types/attendance';
import { exportAttendanceToCSV } from '../../utils/export';

interface AttendanceReportProps {
  onOpenManualModal: () => void;
}

export const AttendanceReport: React.FC<AttendanceReportProps> = ({ onOpenManualModal }) => {
  const { records, deleteRecord, settings } = useAttendance();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(''); // empty means all dates or filter
  const [selectedRecordDetail, setSelectedRecordDetail] = useState<AttendanceRecord | null>(null);

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Search
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        r.employeeName.toLowerCase().includes(q) ||
        r.employeeNip.toLowerCase().includes(q) ||
        (r.notes && r.notes.toLowerCase().includes(q));

      // Department
      const matchDept = selectedDepartment === 'all' || r.department === selectedDepartment;

      // Status
      const matchStatus = selectedStatus === 'all' || r.status === selectedStatus;

      // Date
      const matchDate = !selectedDate || r.date === selectedDate;

      return matchSearch && matchDept && matchStatus && matchDate;
    });
  }, [records, searchQuery, selectedDepartment, selectedStatus, selectedDate]);

  // Summary counts for current filter
  const stats = useMemo(() => {
    let tepatWaktu = 0;
    let terlambat = 0;
    let izin = 0;
    let sakit = 0;

    filteredRecords.forEach((r) => {
      if (r.checkInStatus === 'terlambat') terlambat++;
      else if (r.status === 'hadir') tepatWaktu++;
      else if (r.status === 'izin') izin++;
      else if (r.status === 'sakit') sakit++;
    });

    return { tepatWaktu, terlambat, izin, sakit, total: filteredRecords.length };
  }, [filteredRecords]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Laporan Kehadiran Pegawai
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Data rekapitulasi kehadiran harian dan riwayat absensi berbasis QR Code
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportAttendanceToCSV(filteredRecords, 'Laporan_Kehadiran_Presensi')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Unduh Excel / CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak Rekap</span>
          </button>

          <button
            onClick={onOpenManualModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Presensi Manual</span>
          </button>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama, NIP, atau keterangan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Department Filter */}
          <div className="relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-slate-900 appearance-none cursor-pointer"
            >
              <option value="all">Semua Departemen</option>
              <option value="IT & Engineering">IT & Engineering</option>
              <option value="Finance & Accounting">Finance & Accounting</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Marketing & Creative">Marketing & Creative</option>
              <option value="Operasional">Operasional</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-slate-900 cursor-pointer"
            >
              <option value="all">Semua Status Presensi</option>
              <option value="hadir">Hadir (Tepat Waktu)</option>
              <option value="terlambat">Terlambat</option>
              <option value="izin">Izin</option>
              <option value="sakit">Sakit</option>
            </select>
          </div>

          {/* Date Picker */}
          <div className="relative flex items-center">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-slate-900 cursor-pointer"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="absolute right-2.5 text-xs text-slate-400 hover:text-slate-600 px-1 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filter Summary Tags */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100 text-xs text-slate-600">
          <span>
            Total Data:{' '}
            <strong className="text-slate-900 font-mono tabular-nums">{stats.total}</strong>
          </span>
          <span aria-hidden="true" className="text-slate-300">|</span>
          <span>
            Tepat Waktu:{' '}
            <strong className="text-emerald-700 font-mono tabular-nums">{stats.tepatWaktu}</strong>
          </span>
          <span aria-hidden="true" className="text-slate-300">|</span>
          <span>
            Terlambat:{' '}
            <strong className="text-amber-700 font-mono tabular-nums">{stats.terlambat}</strong>
          </span>
          <span aria-hidden="true" className="text-slate-300">|</span>
          <span>
            Izin & Sakit:{' '}
            <strong className="text-indigo-700 font-mono tabular-nums">{stats.izin + stats.sakit}</strong>
          </span>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200 tracking-wider">
              <tr>
                <th className="py-3 px-4">Pegawai</th>
                <th className="py-3 px-4">Departemen</th>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Jam Masuk</th>
                <th className="py-3 px-4">Jam Pulang</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Metode</th>
                <th className="py-3 px-4">Catatan</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Tidak ada data presensi yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => {
                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Pegawai */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
                            {r.avatarUrl ? (
                              <img
                                src={r.avatarUrl}
                                alt={r.employeeName}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xs font-bold text-slate-600">
                                {r.employeeName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">
                              {r.employeeName}
                            </div>
                            <div className="text-slate-400 font-mono text-[11px] tabular-nums">
                              {r.employeeNip}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Departemen */}
                      <td className="py-3 px-4 text-slate-600 font-medium whitespace-nowrap">
                        {r.department}
                      </td>

                      {/* Tanggal */}
                      <td className="py-3 px-4 font-mono tabular-nums text-slate-600 whitespace-nowrap">
                        {r.date}
                      </td>

                      {/* Jam Masuk */}
                      <td className="py-3 px-4 font-mono tabular-nums font-medium text-slate-900 whitespace-nowrap">
                        {r.checkInTime || '-'}
                      </td>

                      {/* Jam Pulang */}
                      <td className="py-3 px-4 font-mono tabular-nums text-slate-600 whitespace-nowrap">
                        {r.checkOutTime || (
                          <span className="text-slate-400 italic">Belum tap</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {r.status === 'terlambat' ? (
                          <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Terlambat
                          </span>
                        ) : r.status === 'hadir' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Tepat Waktu
                          </span>
                        ) : r.status === 'izin' ? (
                          <span className="inline-flex items-center gap-1 text-blue-700 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            Izin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-purple-700 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                            Sakit
                          </span>
                        )}
                      </td>

                      {/* Scan Method */}
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {r.scanType === 'kiosk_qr' ? (
                          'Kios QR'
                        ) : r.scanType === 'mobile_camera' ? (
                          'Scan HP'
                        ) : (
                          'Manual HR'
                        )}
                      </td>

                      {/* Catatan / Lokasi */}
                      <td className="py-3 px-4 text-slate-500 max-w-56 truncate">
                        {r.notes || '-'}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedRecordDetail(r)}
                            className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                          >
                            Detail
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus catatan presensi untuk ${r.employeeName}?`)) {
                                deleteRecord(r.id);
                              }
                            }}
                            title="Hapus Catatan"
                            className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Detail Modal */}
      {selectedRecordDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Detail Presensi Kehadiran
              </h3>
              <button
                onClick={() => setSelectedRecordDetail(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
                  {selectedRecordDetail.avatarUrl ? (
                    <img
                      src={selectedRecordDetail.avatarUrl}
                      alt={selectedRecordDetail.employeeName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold text-slate-600">
                      {selectedRecordDetail.employeeName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {selectedRecordDetail.employeeName}
                  </h4>
                  <p className="font-mono text-slate-500 tabular-nums">
                    {selectedRecordDetail.employeeNip} · {selectedRecordDetail.department}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[11px]">Tanggal Presensi</span>
                  <span className="font-semibold text-slate-900 font-mono">
                    {selectedRecordDetail.date}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Status</span>
                  <span className="font-semibold capitalize text-slate-900">
                    {selectedRecordDetail.status === 'terlambat' ? 'Terlambat Masuk' : selectedRecordDetail.status}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Jam Masuk</span>
                  <span className="font-semibold font-mono text-slate-900">
                    {selectedRecordDetail.checkInTime || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Jam Pulang</span>
                  <span className="font-semibold font-mono text-slate-900">
                    {selectedRecordDetail.checkOutTime || 'Belum Tercatat'}
                  </span>
                </div>
              </div>

              {selectedRecordDetail.location && (
                <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                  <div className="flex items-center gap-1.5 font-medium text-slate-900">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>Verifikasi Lokasi GPS</span>
                  </div>
                  <p className="text-slate-600">{selectedRecordDetail.location.address}</p>
                  <p className="text-slate-500 font-mono text-[11px]">
                    Jarak: {Math.round(selectedRecordDetail.location.distanceMeters)} meter dari kantor
                    {selectedRecordDetail.location.isValidRadius ? ' (Valid dalam radius)' : ' (Luar radius)'}
                  </p>
                </div>
              )}

              {selectedRecordDetail.notes && (
                <div>
                  <span className="text-slate-400 block text-[11px]">Keterangan</span>
                  <p className="p-2.5 bg-slate-50 rounded-lg text-slate-700 italic">
                    "{selectedRecordDetail.notes}"
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedRecordDetail(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
