import React, { useState } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { AttendanceStatus, CheckInStatus } from '../../types/attendance';

interface ManualAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManualAttendanceModal: React.FC<ManualAttendanceModalProps> = ({ isOpen, onClose }) => {
  const { employees, addManualRecord, todayString, settings } = useAttendance();

  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || '');
  const [date, setDate] = useState(todayString);
  const [status, setStatus] = useState<AttendanceStatus>('hadir');
  const [checkInTime, setCheckInTime] = useState('08:00:00');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === selectedEmpId);
    if (!emp) return;

    // Evaluate on-time vs late
    let checkInStatus: CheckInStatus = 'tepat_waktu';
    if (checkInTime) {
      const [h, m] = checkInTime.split(':').map(Number);
      const [startH, startM] = settings.workStartTime.split(':').map(Number);
      const currentMins = h * 60 + m;
      const thresholdMins = startH * 60 + startM + settings.lateToleranceMinutes;
      if (currentMins > thresholdMins) {
        checkInStatus = 'terlambat';
      }
    }

    addManualRecord({
      employeeId: emp.id,
      employeeName: emp.name,
      employeeNip: emp.nip,
      department: emp.department,
      avatarUrl: emp.avatarUrl,
      date,
      checkInTime: status === 'izin' || status === 'sakit' ? '' : checkInTime,
      checkInStatus,
      checkOutTime: checkOutTime || undefined,
      status,
      scanType: 'manual',
      notes: notes || `Pencatatan manual oleh HR Admin (${status})`,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Catat Kehadiran Manual
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Pilih Pegawai *</label>
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.nip} - {emp.department})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Tanggal *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Status Kehadiran *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AttendanceStatus)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
              >
                <option value="hadir">Hadir</option>
                <option value="terlambat">Terlambat</option>
                <option value="izin">Izin</option>
                <option value="sakit">Sakit</option>
              </select>
            </div>
          </div>

          {(status === 'hadir' || status === 'terlambat') && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Jam Masuk (WIB)</label>
                <input
                  type="time"
                  step="1"
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Jam Pulang (Opsional)</label>
                <input
                  type="time"
                  step="1"
                  value={checkOutTime}
                  onChange={(e) => setCheckOutTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Keterangan / Alasan
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Surat dokter terlampir / dinas luar kota / lupa scan QR"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div className="p-4 bg-slate-50 -mx-5 -mb-5 mt-6 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              Simpan Presensi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
