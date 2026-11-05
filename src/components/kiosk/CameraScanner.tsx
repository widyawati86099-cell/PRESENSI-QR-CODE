import React, { useState, useEffect, useRef, useCallback } from 'react';
import jsQR from 'jsqr';
import { 
  Camera, 
  CameraOff, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Sparkles, 
  Volume2, 
  VolumeX,
  UserCheck,
  Building
} from 'lucide-react';
import { useAttendance } from '../../context/AttendanceContext';
import { Employee } from '../../types/attendance';

export const CameraScanner: React.FC = () => {
  const { employees, recordAttendance, settings, updateSettings } = useAttendance();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanCooldown, setScanCooldown] = useState<boolean>(false);
  
  // Last scan feedback result
  const [lastScannedResult, setLastScannedResult] = useState<{
    success: boolean;
    employee?: Employee;
    message: string;
    type?: 'check_in' | 'check_out';
    isLate?: boolean;
    timeString: string;
  } | null>(null);

  // Manual fast-scan selection for devices without webcam or denied permissions
  const [selectedQuickEmpId, setSelectedQuickEmpId] = useState<string>('');

  // Start webcam
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser tidak mendukung akses kamera getUserMedia.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err: unknown) {
      console.warn('Camera access error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      setCameraError(
        msg.includes('Permission') || msg.includes('NotAllowed')
          ? 'Izin akses kamera ditolak. Silakan izinkan akses kamera di peramban Anda.'
          : 'Kamera tidak terdeteksi atau sedang digunakan aplikasi lain. Anda tetap dapat menggunakan fitur "Scan Cepat Pegawai" di bawah.'
      );
      setIsCameraActive(false);
    }
  };

  // Stop webcam
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  // Process video frames for QR detection
  const processFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || scanCooldown) {
      animFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data) {
        handleCodeDetected(code.data);
        return;
      }
    }

    animFrameRef.current = requestAnimationFrame(processFrame);
  }, [scanCooldown]);

  // Handle scanned QR payload
  const handleCodeDetected = (rawValue: string) => {
    setScanCooldown(true);

    let identifier = rawValue;
    try {
      // Check if it's JSON formatted
      const parsed = JSON.parse(rawValue);
      if (parsed.secret) identifier = parsed.secret;
      else if (parsed.nip) identifier = parsed.nip;
    } catch {
      // Raw string
      identifier = rawValue;
    }

    const res = recordAttendance(identifier, 'kiosk_qr', {
      notes: 'Presensi via scanner kamera terminal'
    });

    const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setLastScannedResult({
      success: res.success,
      employee: res.employee,
      message: res.message,
      type: res.type,
      isLate: res.isLate,
      timeString: nowStr,
    });

    // Reset cooldown after 3.5 seconds to prevent multi-scanning same person
    setTimeout(() => {
      setScanCooldown(false);
      if (isCameraActive) {
        animFrameRef.current = requestAnimationFrame(processFrame);
      }
    }, 3500);
  };

  // Start frame loop on camera active
  useEffect(() => {
    if (isCameraActive && !scanCooldown) {
      animFrameRef.current = requestAnimationFrame(processFrame);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isCameraActive, scanCooldown, processFrame]);

  // Stop camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Quick manual scan handler
  const handleQuickManualScan = () => {
    if (!selectedQuickEmpId) return;
    const emp = employees.find((e) => e.id === selectedQuickEmpId);
    if (!emp) return;

    handleCodeDetected(emp.qrCodeSecret);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Terminal Scanner Kamera Presensi
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gunakan kamera untuk memindai kartu fisik QR pegawai atau layar smartphone
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            title={settings.soundEnabled ? 'Suara Aktif' : 'Suara Senyap'}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-500" />}
          </button>

          {!isCameraActive ? (
            <button
              onClick={startCamera}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Aktifkan Kamera</span>
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <CameraOff className="w-4 h-4 text-red-500" />
              <span>Matikan Kamera</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Scanner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera Viewport (2 cols) */}
        <div className="lg:col-span-2">
          <div className="bg-slate-950 rounded-2xl overflow-hidden shadow-md border border-slate-800 relative aspect-video flex items-center justify-center">
            {/* Hidden canvas used for pixel analysis */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Video element */}
            <video
              ref={videoRef}
              className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
              muted
            />

            {/* Viewfinder overlay when camera is running */}
            {isCameraActive && !scanCooldown && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {/* Target Scanning Reticle */}
                <div className="w-64 h-64 border-2 border-blue-400/80 rounded-2xl relative shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                  {/* Corner accents */}
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />

                  {/* Scanning horizontal laser line animation */}
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent absolute top-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <div className="absolute bottom-6 bg-slate-900/80 backdrop-blur-xs text-white text-xs px-4 py-1.5 rounded-full border border-slate-700">
                  Arahkan QR Code Pegawai ke dalam kotak
                </div>
              </div>
            )}

            {/* Scan Cooldown Overlay (celebration / confirmation) */}
            {scanCooldown && lastScannedResult && (
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
                    lastScannedResult.success
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  }`}
                >
                  {lastScannedResult.success ? (
                    <CheckCircle2 className="w-10 h-10" />
                  ) : (
                    <AlertCircle className="w-10 h-10" />
                  )}
                </div>

                <h3 className="text-xl font-bold text-white mb-1">
                  {lastScannedResult.success
                    ? lastScannedResult.type === 'check_in'
                      ? 'Presensi Masuk Berhasil'
                      : 'Presensi Pulang Berhasil'
                    : 'Presensi Gagal'}
                </h3>

                {lastScannedResult.employee && (
                  <div className="my-2 flex flex-col items-center">
                    <span className="text-lg font-semibold text-blue-400">
                      {lastScannedResult.employee.name}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {lastScannedResult.employee.nip} · {lastScannedResult.employee.department}
                    </span>
                  </div>
                )}

                <p className="text-xs text-slate-300 max-w-sm mt-1">
                  {lastScannedResult.message}
                </p>

                <div className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-500">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Siap memindai pegawai berikutnya dalam beberapa detik...</span>
                </div>
              </div>
            )}

            {/* Camera Inactive Placeholder */}
            {!isCameraActive && (
              <div className="flex flex-col items-center text-center p-6 text-slate-400 max-w-sm">
                <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
                  <Camera className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">
                  Kamera Belum Aktif
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Klik tombol di bawah untuk mengaktifkan webcam scanner komputer/tablet Anda.
                </p>
                <button
                  onClick={startCamera}
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Aktifkan Kamera Sekarang
                </button>
              </div>
            )}
          </div>

          {/* Camera Error / Warning notice */}
          {cameraError && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Info Kamera: </span>
                <span>{cameraError}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Quick Scan Test & Employee Selector */}
        <div className="space-y-6">
          {/* Quick Scanner Simulator Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div>
              <div className="flex items-center gap-1.5 text-blue-600 font-semibold text-xs mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simulasi Scan Cepat (Tanpa Kamera)</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Pilih Pegawai untuk Tap Presensi
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Gunakan dropdown ini untuk menguji sistem seolah-olah pegawai baru saja men-scan kartu QR di scanner.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Pilih Pegawai:
                </label>
                <select
                  value={selectedQuickEmpId}
                  onChange={(e) => setSelectedQuickEmpId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
                >
                  <option value="">-- Pilih salah satu pegawai --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.nip} - {emp.department})
                    </option>
                  ))}
                </select>
              </div>

              <button
                disabled={!selectedQuickEmpId}
                onClick={handleQuickManualScan}
                className="w-full py-2.5 px-4 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-2xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>Simulasikan Scan Kartu QR</span>
              </button>
            </div>
          </div>

          {/* Quick instructions */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
            <h4 className="font-semibold text-slate-900">Petunjuk Penggunaan Scanner</h4>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>Posisikan kartu QR sekitar 15 - 30 cm di depan kamera.</li>
              <li>Pastikan pencahayaan cukup dan QR tidak silau.</li>
              <li>Sistem otomatis mendeteksi apakah pegawai melakukan presensi Masuk atau Pulang.</li>
              <li>Waktu presensi dicatat secara real-time dan disinkronkan ke dashboard admin.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
