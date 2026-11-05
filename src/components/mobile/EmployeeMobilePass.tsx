import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  Smartphone, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Camera, 
  ShieldCheck, 
  Calendar,
  AlertCircle,
  Building
} from 'lucide-react';
import { useAttendance } from '../../context/AttendanceContext';
import { Employee } from '../../types/attendance';

export const EmployeeMobilePass: React.FC = () => {
  const { employees, records, settings, recordAttendance, dynamicToken } = useAttendance();

  // Selected employee profile
  const [activeEmpId, setActiveEmpId] = useState<string>(employees[0]?.id || '');
  const activeEmployee = employees.find((e) => e.id === activeEmpId) || employees[0];

  const [personalQrUrl, setPersonalQrUrl] = useState<string>('');
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [gpsSimulatedDistance, setGpsSimulatedDistance] = useState<number>(25); // 25 meters from office
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [scanResultNotice, setScanResultNotice] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Generate QR for active employee
  useEffect(() => {
    if (activeEmployee) {
      QRCode.toDataURL(activeEmployee.qrCodeSecret, {
        width: 260,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setPersonalQrUrl(url))
        .catch((err) => console.error(err));
    }
  }, [activeEmployee]);

  // Employee's personal records
  const personalRecords = records.filter((r) => r.employeeId === activeEmployee?.id);

  // Trigger simulated mobile attendance scan of office QR
  const handleScanOfficeDynamicQr = () => {
    if (!activeEmployee) return;

    setGpsLoading(true);
    setScanResultNotice(null);

    setTimeout(() => {
      setGpsLoading(false);
      const inRadius = gpsSimulatedDistance <= settings.radiusMeters;

      if (settings.requireGps && !inRadius) {
        setScanResultNotice({
          type: 'error',
          message: `Gagal Presensi: Anda berada ${gpsSimulatedDistance} meter dari kantor (Batas maksimum radius: ${settings.radiusMeters} meter).`,
        });
        return;
      }

      const res = recordAttendance(activeEmployee.qrCodeSecret, 'mobile_camera', {
        token: dynamicToken,
        photoUrl: selfiePreview || activeEmployee.avatarUrl,
        location: {
          lat: settings.targetCoordinates.lat + 0.0001,
          lng: settings.targetCoordinates.lng + 0.0001,
          address: settings.officeAddress,
          distanceMeters: gpsSimulatedDistance,
          isValidRadius: inRadius,
        },
        notes: `Presensi mandiri ponsel (Jarak ${gpsSimulatedDistance}m)`,
      });

      if (res.success) {
        setScanResultNotice({
          type: 'success',
          message: res.message,
        });
      } else {
        setScanResultNotice({
          type: 'error',
          message: res.message,
        });
      }
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Pass Presensi Mandiri Pegawai (Mobile View)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Simulasi tampilan aplikasi pegawai di smartphone untuk presensi berbasis lokasi dan QR
          </p>
        </div>

        {/* Switch employee selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-600">Pilih Pegawai:</label>
          <select
            value={activeEmpId}
            onChange={(e) => setActiveEmpId(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer shadow-2xs"
          >
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.nip})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mobile Device Mockup Frame */}
      <div className="max-w-md mx-auto bg-slate-900 p-4 rounded-3xl shadow-2xl border-4 border-slate-800">
        {/* Phone Notch/Island */}
        <div className="w-32 h-4 bg-slate-800 rounded-full mx-auto mb-3" />

        {/* Screen Content */}
        <div className="bg-white rounded-2xl p-5 space-y-4 text-slate-900">
          {/* Header of mobile screen */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">
                Kartu Presensi Digital
              </span>
              <h3 className="text-base font-bold text-slate-900">{activeEmployee?.name}</h3>
              <p className="text-[11px] font-mono text-slate-500">{activeEmployee?.nip}</p>
            </div>

            <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
              {activeEmployee?.avatarUrl ? (
                <img
                  src={activeEmployee.avatarUrl}
                  alt={activeEmployee.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs font-bold text-slate-600">
                  {activeEmployee?.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </span>
              )}
            </div>
          </div>

          {/* Department badge */}
          <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-700">
              <Building className="w-3.5 h-3.5 text-slate-500" />
              <span>{activeEmployee?.department}</span>
            </div>
            <span className="text-blue-600 font-semibold">{activeEmployee?.position}</span>
          </div>

          {/* GPS Location validation strip */}
          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-800">
              <div className="flex items-center gap-1.5 text-blue-700">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Geofencing Presensi</span>
              </div>
              <span
                className={`font-mono text-[11px] font-bold ${
                  gpsSimulatedDistance <= settings.radiusMeters
                    ? 'text-emerald-700'
                    : 'text-rose-600'
                }`}
              >
                {gpsSimulatedDistance <= settings.radiusMeters ? 'Dalam Radius' : 'Di Luar Radius'}
              </span>
            </div>

            <p className="text-[11px] text-slate-600">
              {settings.officeName} · Jarak estimasi: <strong>{gpsSimulatedDistance} m</strong> (Maks: {settings.radiusMeters}m)
            </p>

            {/* Distance slider to simulate moving closer/farther */}
            <div className="pt-1 flex items-center gap-2">
              <span className="text-[10px] text-slate-500">Simulasi GPS:</span>
              <input
                type="range"
                min="10"
                max="300"
                step="10"
                value={gpsSimulatedDistance}
                onChange={(e) => setGpsSimulatedDistance(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg accent-blue-600 cursor-pointer"
              />
              <span className="text-[11px] font-mono text-slate-700 w-10 text-right">
                {gpsSimulatedDistance}m
              </span>
            </div>
          </div>

          {/* QR Code Card */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center flex flex-col items-center">
            <span className="text-[11px] font-medium text-slate-500 mb-2">
              QR Code Pegawai untuk Discan di Mesin Kios
            </span>
            <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
              {personalQrUrl ? (
                <img
                  src={personalQrUrl}
                  alt="Personal QR"
                  className="w-40 h-40 object-contain"
                />
              ) : (
                <div className="w-40 h-40 flex items-center justify-center text-xs text-slate-400">
                  Membuat QR...
                </div>
              )}
            </div>
            <span className="text-[10px] font-mono text-slate-400 mt-2">
              {activeEmployee?.qrCodeSecret}
            </span>
          </div>

          {/* Scan Notice */}
          {scanResultNotice && (
            <div
              className={`p-3 rounded-xl text-xs flex items-start gap-2 animate-fadeIn ${
                scanResultNotice.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}
            >
              {scanResultNotice.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span>{scanResultNotice.message}</span>
            </div>
          )}

          {/* Primary Action Button: Scan Office Dynamic QR */}
          <button
            onClick={handleScanOfficeDynamicQr}
            disabled={gpsLoading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-medium text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Smartphone className="w-4 h-4" />
            <span>
              {gpsLoading ? 'Memverifikasi Lokasi & Token...' : 'Scan QR Kantor (Presensi Sekarang)'}
            </span>
          </button>

          {/* Personal Recent Attendance History */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-800 block mb-2">
              Riwayat Presensi Saya
            </span>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {personalRecords.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic">Belum ada catatan kehadiran.</p>
              ) : (
                personalRecords.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between text-[11px] py-1.5 px-2 bg-slate-50 rounded-lg border border-slate-100"
                  >
                    <div>
                      <span className="font-mono text-slate-600">{r.date}</span>
                      <span className="text-slate-400 mx-1">·</span>
                      <span className="font-semibold text-slate-800">{r.checkInTime}</span>
                    </div>
                    <span
                      className={`font-medium ${
                        r.status === 'terlambat' ? 'text-amber-600' : 'text-emerald-600'
                      }`}
                    >
                      {r.status === 'terlambat' ? 'Terlambat' : 'Tepat Waktu'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
