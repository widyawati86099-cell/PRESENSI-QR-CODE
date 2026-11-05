import React, { useState } from 'react';
import { AttendanceProvider } from './context/AttendanceContext';
import { Header, NavTab } from './components/Header';
import { DashboardOverview } from './components/admin/DashboardOverview';
import { AttendanceReport } from './components/admin/AttendanceReport';
import { EmployeeDirectory } from './components/admin/EmployeeDirectory';
import { DynamicQrDisplay } from './components/kiosk/DynamicQrDisplay';
import { CameraScanner } from './components/kiosk/CameraScanner';
import { EmployeeMobilePass } from './components/mobile/EmployeeMobilePass';
import { ManualAttendanceModal } from './components/modals/ManualAttendanceModal';
import { SettingsModal } from './components/modals/SettingsModal';

function AppContent() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* Top Bar Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'dashboard' && (
          <DashboardOverview
            onNavigate={setCurrentTab}
            onOpenManualModal={() => setIsManualModalOpen(true)}
          />
        )}

        {currentTab === 'reports' && (
          <AttendanceReport
            onOpenManualModal={() => setIsManualModalOpen(true)}
          />
        )}

        {currentTab === 'employees' && <EmployeeDirectory />}

        {currentTab === 'kiosk_display' && <DynamicQrDisplay />}

        {currentTab === 'camera_scanner' && <CameraScanner />}

        {currentTab === 'mobile_pass' && <EmployeeMobilePass />}
      </main>

      {/* Modals */}
      <ManualAttendanceModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">PresensiQR</span>
            <span aria-hidden="true">·</span>
            <span>Sistem Presensi Berbasis QR Code Real-Time</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <span>Sinkronisasi Multi-Tab Aktif</span>
            <span aria-hidden="true">·</span>
            <span>Format Waktu WIB (UTC+7)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AttendanceProvider>
      <AppContent />
    </AttendanceProvider>
  );
}
