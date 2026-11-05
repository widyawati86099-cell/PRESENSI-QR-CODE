import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  Maximize2, 
  Minimize2, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Sparkles,
  Smartphone
} from 'lucide-react';
import { useAttendance } from '../../context/AttendanceContext';

export const DynamicQrDisplay: React.FC = () => {
  const { 
    dynamicToken, 
    dynamicTokenSecondsLeft, 
    settings, 
    recentEvents, 
    simulateRandomScan,
    updateSettings 
  } = useAttendance();

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  // Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
      setCurrentDate(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Generate QR code when dynamicToken changes
  useEffect(() => {
    // Payload contains the anti-spoof dynamic security token + office identifier
    const payload = JSON.stringify({
      app: 'PresensiQR',
      token: dynamicToken,
      office: settings.officeName,
      timestamp: Date.now(),
    });

    QRCode.toDataURL(payload, {
      width: 400,
      margin: 1.5,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error(err));
  }, [dynamicToken, settings.officeName]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch((err) => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
      setIsFullscreen(false);
    }
  };

  const latestEvent = recentEvents[0];
  const percentLeft = (dynamicTokenSecondsLeft / settings.dynamicQrIntervalSeconds) * 100;

  return (
    <div
      ref={containerRef}
      className={`min-h-[75vh] flex flex-col justify-between rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white p-6 sm:p-8 relative overflow-hidden transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : ''
      }`}
    >
      {/* Background ambient light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header of Kiosk */}
      <div className="relative z-10 flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">
            Terminal Kios Presensi Lobi
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
            {settings.officeName}
          </h2>
          <p className="text-xs text-slate-400">{currentDate}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            title={settings.soundEnabled ? 'Suara Aktif' : 'Suara Senyap'}
            className="p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
          </button>

          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Keluar Fullscreen' : 'Layar Penuh (Kios)'}
            className="p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Center Display: Dynamic Rolling QR & Live Countdown */}
      <div className="relative z-10 my-auto py-8 flex flex-col items-center text-center">
        {/* Digital Clock */}
        <div className="flex items-center gap-2 text-4xl sm:text-6xl font-bold font-mono tracking-tight text-white tabular-nums drop-shadow-sm mb-4">
          <Clock className="w-7 h-7 sm:w-10 sm:h-10 text-blue-500 animate-pulse" />
          <span>{currentTime}</span>
          <span className="text-base sm:text-xl text-slate-400 font-normal">WIB</span>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 max-w-md mb-6">
          Arahkan kamera smartphone Anda ke kode QR berikut untuk presensi masuk/pulang.
        </p>

        {/* Dynamic QR Code Card with Countdown border */}
        <div className="relative p-5 sm:p-6 bg-white rounded-2xl shadow-2xl border-4 border-slate-700/50 flex flex-col items-center">
          {/* Circular Countdown Indicator */}
          <div className="w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center relative">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Dynamic Rolling Attendance QR"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-slate-500 text-xs font-mono">Memuat QR Dinamis...</div>
            )}
          </div>

          {/* Countdown & Security Token */}
          <div className="w-full mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-700">
            <div className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Anti-Fraud Berputar:</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-20 bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-1000 rounded-full"
                  style={{ width: `${percentLeft}%` }}
                />
              </div>
              <span className="font-mono font-bold tabular-nums text-blue-600 w-6 text-right">
                {dynamicTokenSecondsLeft}s
              </span>
            </div>
          </div>
        </div>

        {/* Security token disclaimer */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-4 font-mono">
          <span>Token Keamanan: {dynamicToken.slice(0, 15)}...</span>
          <span aria-hidden="true">·</span>
          <span>Batas Waktu Masuk: {settings.workStartTime} (+{settings.lateToleranceMinutes}m)</span>
        </div>
      </div>

      {/* Footer Banner: Live notification of recent scans */}
      <div className="relative z-10 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {latestEvent ? (
          <div className="flex items-center gap-3 bg-emerald-950/80 border border-emerald-800/80 text-emerald-200 px-4 py-2.5 rounded-xl animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-semibold text-white">{latestEvent.employee.name}</span>
              <span className="text-emerald-300 ml-1.5">
                {latestEvent.type === 'check_in'
                  ? `berhasil presensi masuk pada ${latestEvent.timeString} (${latestEvent.checkInStatus === 'terlambat' ? 'Terlambat' : 'Tepat Waktu'})`
                  : `berhasil presensi pulang pada ${latestEvent.timeString}`}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-slate-400 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-blue-400" />
            <span>Menunggu scan presensi dari pegawai...</span>
          </div>
        )}

        {/* Demo trigger button for quick testing */}
        <button
          onClick={simulateRandomScan}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/30 transition-colors cursor-pointer text-xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tes Scan Pegawai Sekarang</span>
        </button>
      </div>
    </div>
  );
};
