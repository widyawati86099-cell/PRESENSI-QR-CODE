import React from 'react';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Building2, 
  ArrowUpRight, 
  Sparkles,
  FileSpreadsheet,
  Camera,
  QrCode
} from 'lucide-react';
import { useAttendance } from '../../context/AttendanceContext';
import { exportAttendanceToCSV } from '../../utils/export';
import { NavTab } from '../Header';

interface DashboardOverviewProps {
  onNavigate: (tab: NavTab) => void;
  onOpenManualModal: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onNavigate,
  onOpenManualModal,
}) => {
  const { stats, records, recentEvents, todayString, simulateRandomScan, settings } = useAttendance();

  const todayRecords = records.filter((r) => r.date === todayString);

  // Hourly arrival distribution (06:00 to 11:00)
  const hourlyArrivals = [
    { label: '06:00', count: 0 },
    { label: '07:00', count: 0 },
    { label: '08:00', count: 0 },
    { label: '09:00', count: 0 },
    { label: '10:00+', count: 0 },
  ];

  todayRecords.forEach((r) => {
    if (r.checkInTime) {
      const hour = parseInt(r.checkInTime.split(':')[0], 10);
      if (hour <= 6) hourlyArrivals[0].count += 1;
      else if (hour === 7) hourlyArrivals[1].count += 1;
      else if (hour === 8) hourlyArrivals[2].count += 1;
      else if (hour === 9) hourlyArrivals[3].count += 1;
      else hourlyArrivals[4].count += 1;
    }
  });

  const maxHourlyCount = Math.max(...hourlyArrivals.map((h) => h.count), 1);

  // Department distribution
  const departments = [
    'IT & Engineering',
    'Finance & Accounting',
    'Human Resources',
    'Marketing & Creative',
    'Operasional',
  ] as const;

  const departmentData = departments.map((dept) => {
    const deptRecords = todayRecords.filter((r) => r.department === dept);
    const present = deptRecords.filter((r) => r.status === 'hadir' || r.status === 'terlambat').length;
    const late = deptRecords.filter((r) => r.checkInStatus === 'terlambat').length;
    return {
      name: dept,
      present,
      late,
      total: deptRecords.length,
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Dashboard Pemantauan Presensi
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>{settings.officeName}</span>
            <span aria-hidden="true">·</span>
            <span>Jam Kerja: {settings.workStartTime} - {settings.workEndTime}</span>
            <span aria-hidden="true">·</span>
            <span>Toleransi: +{settings.lateToleranceMinutes} menit</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportAttendanceToCSV(todayRecords, 'Presensi_Hari_Ini')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={onOpenManualModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Catat Manual</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Pegawai */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Pegawai</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {stats.totalEmployees}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Aktif terdaftar</div>
          </div>
        </div>

        {/* Hadir Hari Ini */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Hadir Hari Ini</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                {stats.presentToday}
              </span>
              <span className="text-xs font-medium text-emerald-600">
                ({stats.attendanceRate}%)
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              dari {stats.totalEmployees} pegawai
            </div>
          </div>
        </div>

        {/* Tepat Waktu */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Tepat Waktu</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600 font-mono tabular-nums">
              {stats.onTimeToday}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Sebelum batas toleransi</div>
          </div>
        </div>

        {/* Terlambat */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Terlambat</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-600 font-mono tabular-nums">
              {stats.lateToday}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">&gt; {settings.workStartTime} + {settings.lateToleranceMinutes}m</div>
          </div>
        </div>

        {/* Izin & Sakit */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Izin / Sakit</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800 font-mono tabular-nums">
              {stats.permitToday + stats.sickToday}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {stats.permitToday} Izin · {stats.sickToday} Sakit
            </div>
          </div>
        </div>

        {/* Di Kantor Sekarang */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Di Kantor</span>
            <Building2 className="w-4 h-4 text-teal-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-teal-700 font-mono tabular-nums">
              {stats.currentlyInOffice}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Belum tap checkout</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Live Feed & Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Arrival Trend & Department Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hourly Check-In Distribution Chart */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Grafik Waktu Kedatangan Hari Ini
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Distribusi jam kedatangan pegawai saat scan QR
                </p>
              </div>
              <span className="text-xs font-medium text-slate-500 font-mono tabular-nums">
                Total Scan: {todayRecords.length}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-3 pt-4 border-t border-slate-100">
              {hourlyArrivals.map((slot) => {
                const heightPercent = maxHourlyCount > 0 ? (slot.count / maxHourlyCount) * 100 : 0;
                return (
                  <div key={slot.label} className="flex flex-col items-center">
                    <div className="h-32 w-full flex items-end justify-center bg-slate-50 rounded-lg p-1.5 relative group">
                      <div
                        style={{ height: `${Math.max(heightPercent, 8)}%` }}
                        className={`w-full max-w-10 rounded-md transition-all duration-500 flex items-center justify-center text-xs font-mono font-medium ${
                          slot.count > 0 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'
                        }`}
                      >
                        {slot.count > 0 && <span className="text-xs">{slot.count}</span>}
                      </div>
                    </div>
                    <span className="text-xs font-medium text-slate-600 mt-2 font-mono">
                      {slot.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Department Breakdown */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Kehadiran per Departemen
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tingkat kedatangan dan kepatuhan waktu divisi
                </p>
              </div>
              <button
                onClick={() => onNavigate('reports')}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Lihat Detail</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {departmentData.map((dept) => (
                <div key={dept.name} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="min-w-44">
                    <span className="font-medium text-slate-800">{dept.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-slate-600 font-mono tabular-nums">
                    <div>
                      Hadir: <span className="font-semibold text-emerald-600">{dept.present}</span>
                    </div>
                    {dept.late > 0 && (
                      <div>
                        Terlambat: <span className="font-semibold text-amber-600">{dept.late}</span>
                      </div>
                    )}
                    <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full"
                        style={{ width: `${dept.present > 0 ? (dept.present / Math.max(dept.total, 1)) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Real-Time Live Feed Ticker */}
        <div className="space-y-6">
          {/* Real-Time Live Ticker Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-sm font-semibold text-slate-900">
                  Live Feed Presensi Real-Time
                </h3>
              </div>
              <button
                onClick={simulateRandomScan}
                title="Simulasi scan baru secara instan"
                className="p-1 hover:bg-slate-100 text-slate-500 rounded transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-blue-600" />
              </button>
            </div>

            <div className="mt-3 divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1">
              {recentEvents.length === 0 ? (
                // Show latest records from today if no fresh events in current session
                todayRecords.slice(0, 6).map((r) => (
                  <div key={r.id} className="py-3 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
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

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-900 truncate">
                          {r.employeeName}
                        </span>
                        <span className="text-xs font-mono tabular-nums text-slate-500">
                          {r.checkInTime}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                        <span>{r.department}</span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={
                            r.checkInStatus === 'terlambat'
                              ? 'text-amber-600 font-medium'
                              : 'text-emerald-600 font-medium'
                          }
                        >
                          {r.checkInStatus === 'terlambat' ? 'Terlambat' : 'Tepat Waktu'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                recentEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="py-3 flex items-start gap-3 animate-fadeIn"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
                      {evt.employee.avatarUrl ? (
                        <img
                          src={evt.employee.avatarUrl}
                          alt={evt.employee.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-bold text-slate-600">
                          {evt.employee.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-900 truncate">
                          {evt.employee.name}
                        </span>
                        <span className="text-xs font-mono tabular-nums text-slate-500">
                          {evt.timeString}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                        <span>{evt.employee.department}</span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={`font-medium ${
                            evt.type === 'check_out'
                              ? 'text-indigo-600'
                              : evt.checkInStatus === 'terlambat'
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {evt.type === 'check_out'
                            ? 'Pulang'
                            : evt.checkInStatus === 'terlambat'
                            ? 'Terlambat'
                            : 'Tepat Waktu'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Sync cross-tab: Aktif</span>
              <button
                onClick={simulateRandomScan}
                className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
              >
                + Simulasi Scan Baru
              </button>
            </div>
          </div>

          {/* Quick Scanner Launch Banners */}
          <div className="bg-slate-900 text-white p-5 rounded-xl shadow-2xs space-y-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-blue-400 font-medium">
                Terminal Scanner Presensi
              </span>
              <h3 className="text-base font-semibold text-white mt-1">
                Buka Kios QR atau Scanner
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Tampilkan kode QR dinamis di layar lobi kantor atau gunakan kamera web scanner untuk membaca kartu ID pegawai.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => onNavigate('kiosk_display')}
                className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                <span>Kios QR Layar</span>
              </button>
              
              <button
                onClick={() => onNavigate('camera_scanner')}
                className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Scanner Kamera</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
