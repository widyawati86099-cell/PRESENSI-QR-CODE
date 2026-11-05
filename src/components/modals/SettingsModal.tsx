import React, { useState } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { OfficeSettings } from '../../types/attendance';
import { RotateCcw, Save } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, resetToDefault } = useAttendance();

  const [formData, setFormData] = useState<OfficeSettings>({ ...settings });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    onClose();
  };

  const handleReset = () => {
    if (confirm('Apakah Anda yakin ingin mengatur ulang semua data demo ke kondisi awal? Riwayat scan yang baru akan dihapus.')) {
      resetToDefault();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Pengaturan Kebijakan Presensi & Kantor
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          {/* Identitas Kantor */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-blue-600">
              Identitas Kantor
            </h4>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Nama Kantor / Lokasi</label>
              <input
                type="text"
                required
                value={formData.officeName}
                onChange={(e) => setFormData({ ...formData, officeName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Alamat Kantor</label>
              <input
                type="text"
                value={formData.officeAddress}
                onChange={(e) => setFormData({ ...formData, officeAddress: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Jam Kerja & Toleransi */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-blue-600">
              Jam Kerja & Toleransi
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Jam Masuk</label>
                <input
                  type="time"
                  required
                  value={formData.workStartTime}
                  onChange={(e) => setFormData({ ...formData, workStartTime: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Toleransi Terlambat (Menit)</label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={formData.lateToleranceMinutes}
                  onChange={(e) => setFormData({ ...formData, lateToleranceMinutes: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Jam Pulang Normal</label>
                <input
                  type="time"
                  required
                  value={formData.workEndTime}
                  onChange={(e) => setFormData({ ...formData, workEndTime: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Interval Refresh QR (Detik)</label>
                <select
                  value={formData.dynamicQrIntervalSeconds}
                  onChange={(e) => setFormData({ ...formData, dynamicQrIntervalSeconds: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
                >
                  <option value={15}>15 Detik (Anti-Fraud Ketat)</option>
                  <option value={20}>20 Detik (Standar Rekomendasi)</option>
                  <option value={30}>30 Detik</option>
                  <option value={60}>60 Detik</option>
                </select>
              </div>
            </div>
          </div>

          {/* Geofencing */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-blue-600">
              Validasi Geofencing & Suara
            </h4>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Radius Kehadiran Maksimal (Meter)</label>
              <input
                type="number"
                min="20"
                max="1000"
                step="10"
                value={formData.radiusMeters}
                onChange={(e) => setFormData({ ...formData, radiusMeters: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.requireGps}
                  onChange={(e) => setFormData({ ...formData, requireGps: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-slate-700">Wajibkan Verifikasi Radius Lokasi GPS Kantor</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.soundEnabled}
                  onChange={(e) => setFormData({ ...formData, soundEnabled: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-slate-700">Aktifkan Efek Suara Notifikasi Web Audio (Chime & Beep)</span>
              </label>
            </div>
          </div>

          {/* Reset Demo Data */}
          <div className="p-3 bg-red-50 rounded-lg border border-red-100 flex items-center justify-between">
            <div>
              <span className="font-semibold text-red-900 block">Reset Data Demo</span>
              <span className="text-red-700 text-[11px]">Kembalikan ke data awal bawaan sistem</span>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-50 cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
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
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
