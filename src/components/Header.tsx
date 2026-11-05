import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  Settings, 
  Sparkles, 
  Radio
} from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';

export type NavTab = 'dashboard' | 'reports' | 'employees' | 'kiosk_display' | 'camera_scanner' | 'mobile_pass';

interface HeaderProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenSettings,
}) => {
  const { isSimulating, setIsSimulating, simulateRandomScan } = useAttendance();
  const [timeString, setTimeString] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }) + ' WIB'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navLinks: { id: NavTab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard Admin' },
    { id: 'reports', label: 'Laporan Kehadiran' },
    { id: 'employees', label: 'Data Pegawai' },
    { id: 'kiosk_display', label: 'Kios QR Layar' },
    { id: 'camera_scanner', label: 'Scanner Kamera' },
    { id: 'mobile_pass', label: 'Pass Mandiri' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-2.5 text-left text-slate-900 group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <QrCode className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold tracking-tight whitespace-nowrap shrink-0">
              PresensiQR
            </span>
          </button>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            {navLinks.map((link) => {
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onSelectTab(link.id)}
                  className={`relative py-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'text-blue-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action area */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Clock */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-md text-xs font-mono tabular-nums text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{timeString}</span>
            </div>

            {/* Quick Simulation trigger for demoing real-time feed */}
            <button
              onClick={() => {
                if (isSimulating) {
                  setIsSimulating(false);
                } else {
                  simulateRandomScan();
                }
              }}
              title="Klik untuk mensimulasikan scan presensi pegawai secara langsung"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                isSimulating
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              {isSimulating ? (
                <>
                  <Radio className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                  <span className="whitespace-nowrap">Simulasi Berjalan</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span className="whitespace-nowrap">Tes Scan Real-Time</span>
                </>
              )}
            </button>

            {/* Settings button */}
            <button
              onClick={onOpenSettings}
              title="Pengaturan Kantor"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto py-2 border-t border-slate-100 no-scrollbar">
          {navLinks.map((link) => {
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onSelectTab(link.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
