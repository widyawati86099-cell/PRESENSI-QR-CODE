import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Employee, 
  AttendanceRecord, 
  OfficeSettings, 
  LiveScanEvent, 
  ScanType, 
  AttendanceStatus,
  CheckInStatus 
} from '../types/attendance';
import { 
  INITIAL_EMPLOYEES, 
  INITIAL_SETTINGS, 
  generateInitialRecords, 
  getTodayDateString 
} from '../data/initialData';
import { playSuccessChime, playCheckoutChime, playWarningChime } from '../utils/audio';

const STORAGE_KEYS = {
  RECORDS: 'presensi_qr_records_v1',
  EMPLOYEES: 'presensi_qr_employees_v1',
  SETTINGS: 'presensi_qr_settings_v1',
};

interface AttendanceStats {
  totalEmployees: number;
  presentToday: number;
  onTimeToday: number;
  lateToday: number;
  permitToday: number;
  sickToday: number;
  absentToday: number;
  attendanceRate: number;
  currentlyInOffice: number;
}

interface ScanResult {
  success: boolean;
  message: string;
  type?: 'check_in' | 'check_out';
  employee?: Employee;
  record?: AttendanceRecord;
  status?: CheckInStatus;
  isLate?: boolean;
}

interface AttendanceContextType {
  employees: Employee[];
  records: AttendanceRecord[];
  settings: OfficeSettings;
  recentEvents: LiveScanEvent[];
  stats: AttendanceStats;
  todayString: string;
  dynamicToken: string;
  dynamicTokenSecondsLeft: number;
  isSimulating: boolean;
  setIsSimulating: (active: boolean) => void;
  recordAttendance: (
    identifier: string, 
    scanType: ScanType, 
    options?: { 
      photoUrl?: string; 
      location?: AttendanceRecord['location']; 
      notes?: string;
      token?: string;
      forceType?: 'check_in' | 'check_out';
    }
  ) => ScanResult;
  addManualRecord: (record: Omit<AttendanceRecord, 'id'>) => void;
  updateRecord: (id: string, updates: Partial<AttendanceRecord>) => void;
  deleteRecord: (id: string) => void;
  addEmployee: (emp: Omit<Employee, 'id'>) => Employee;
  updateEmployee: (id: string, emp: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  updateSettings: (newSettings: Partial<OfficeSettings>) => void;
  simulateRandomScan: () => ScanResult | null;
  resetToDefault: () => void;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

// Generate random cryptographic string for dynamic anti-screenshot QR
function generateSecurityToken(): string {
  const rand = Math.random().toString(36).substring(2, 9).toUpperCase();
  const time = Date.now().toString(36).toUpperCase();
  return `PR-SEC-${rand}-${time}`;
}

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const todayString = getTodayDateString();

  // 1. Load or initialize State
  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
      return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
    } catch {
      return INITIAL_EMPLOYEES;
    }
  });

  const [records, setRecords] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECORDS);
      return saved ? JSON.parse(saved) : generateInitialRecords();
    } catch {
      return generateInitialRecords();
    }
  });

  const [settings, setSettings] = useState<OfficeSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? { ...INITIAL_SETTINGS, ...JSON.parse(saved) } : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [recentEvents, setRecentEvents] = useState<LiveScanEvent[]>([]);
  const [dynamicToken, setDynamicToken] = useState<string>(generateSecurityToken());
  const [dynamicTokenSecondsLeft, setDynamicTokenSecondsLeft] = useState<number>(settings.dynamicQrIntervalSeconds);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
    } catch (e) {
      console.error(e);
    }
  }, [employees]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    } catch (e) {
      console.error(e);
    }
  }, [records]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  }, [settings]);

  // Dynamic QR Token Rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setDynamicTokenSecondsLeft((prev) => {
        if (prev <= 1) {
          setDynamicToken(generateSecurityToken());
          return settings.dynamicQrIntervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [settings.dynamicQrIntervalSeconds]);

  // Broadcast Channel for Real-time Multi-Tab/Multi-Device synchronization
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel('presensi_qr_sync_channel');
        channel.onmessage = (event) => {
          if (event.data?.type === 'NEW_ATTENDANCE_EVENT') {
            const { eventData, newRecord } = event.data;
            if (eventData) {
              setRecentEvents((prev) => [eventData, ...prev.slice(0, 19)]);
            }
            if (newRecord) {
              setRecords((prev) => {
                const idx = prev.findIndex((r) => r.id === newRecord.id);
                if (idx >= 0) {
                  const updated = [...prev];
                  updated[idx] = newRecord;
                  return updated;
                }
                return [newRecord, ...prev];
              });
            }
          }
        };
      }
    } catch {
      // Ignore broadcast channel errors in restricted environments
    }

    return () => {
      if (channel) {
        channel.close();
      }
    };
  }, []);

  // Helper function to check if time is late
  const evaluateCheckInStatus = useCallback((timeStr: string): CheckInStatus => {
    const [h, m] = timeStr.split(':').map(Number);
    const [startH, startM] = settings.workStartTime.split(':').map(Number);
    const currentMins = h * 60 + m;
    const thresholdMins = startH * 60 + startM + settings.lateToleranceMinutes;

    return currentMins > thresholdMins ? 'terlambat' : 'tepat_waktu';
  }, [settings.workStartTime, settings.lateToleranceMinutes]);

  // Record Attendance Handler
  const recordAttendance = useCallback((
    identifier: string,
    scanType: ScanType,
    options?: {
      photoUrl?: string;
      location?: AttendanceRecord['location'];
      notes?: string;
      token?: string;
      forceType?: 'check_in' | 'check_out';
    }
  ): ScanResult => {
    const cleaned = identifier.trim().toLowerCase();
    
    // Find employee by QR secret, NIP, or ID
    const employee = employees.find(
      (e) =>
        e.qrCodeSecret.toLowerCase() === cleaned ||
        e.nip.toLowerCase() === cleaned ||
        e.id.toLowerCase() === cleaned
    );

    if (!employee) {
      if (settings.soundEnabled) playWarningChime();
      return {
        success: false,
        message: 'Kode QR tidak dikenali atau pegawai tidak terdaftar dalam sistem.'
      };
    }

    if (employee.status !== 'active') {
      if (settings.soundEnabled) playWarningChime();
      return {
        success: false,
        message: `Pegawai ${employee.name} berstatus nonaktif.`
      };
    }

    const now = new Date();
    const timeString = now.toTimeString().split(' ')[0]; // HH:mm:ss
    const today = getTodayDateString();

    // Check existing record for today
    const existingIndex = records.findIndex(
      (r) => r.employeeId === employee.id && r.date === today
    );

    let actionType: 'check_in' | 'check_out' = 'check_in';
    let checkInStatus: CheckInStatus = 'tepat_waktu';
    let updatedRecord: AttendanceRecord;

    if (existingIndex >= 0) {
      const existing = records[existingIndex];
      // If forceType is specified, respect it
      if (options?.forceType === 'check_in') {
        actionType = 'check_in';
        checkInStatus = existing.checkInStatus;
        updatedRecord = {
          ...existing,
          checkInTime: timeString,
          photoUrl: options?.photoUrl || existing.photoUrl,
          notes: options?.notes || existing.notes,
        };
      } else if (existing.checkInTime && !existing.checkOutTime) {
        // Already checked in, record check out
        actionType = 'check_out';
        checkInStatus = existing.checkInStatus;
        updatedRecord = {
          ...existing,
          checkOutTime: timeString,
          notes: options?.notes ? `${existing.notes || ''} | Pulang: ${options.notes}` : existing.notes
        };
      } else if (existing.checkInTime && existing.checkOutTime) {
        // Already checked out, update check-out time
        actionType = 'check_out';
        checkInStatus = existing.checkInStatus;
        updatedRecord = {
          ...existing,
          checkOutTime: timeString
        };
      } else {
        // Record check in
        checkInStatus = evaluateCheckInStatus(timeString);
        updatedRecord = {
          ...existing,
          checkInTime: timeString,
          checkInStatus,
          status: checkInStatus === 'terlambat' ? 'terlambat' : 'hadir',
          photoUrl: options?.photoUrl || existing.photoUrl,
          location: options?.location || existing.location,
          notes: options?.notes || existing.notes
        };
      }
    } else {
      // New check in today
      actionType = 'check_in';
      checkInStatus = evaluateCheckInStatus(timeString);
      updatedRecord = {
        id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        employeeId: employee.id,
        employeeName: employee.name,
        employeeNip: employee.nip,
        department: employee.department,
        avatarUrl: employee.avatarUrl,
        date: today,
        checkInTime: timeString,
        checkInStatus,
        status: checkInStatus === 'terlambat' ? 'terlambat' : 'hadir',
        scanType,
        photoUrl: options?.photoUrl,
        location: options?.location,
        notes: options?.notes || (checkInStatus === 'terlambat' ? 'Presensi terlambat' : 'Presensi tepat waktu')
      };
    }

    // Update records state
    setRecords((prev) => {
      const idx = prev.findIndex((r) => r.id === updatedRecord.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updatedRecord;
        return next;
      }
      return [updatedRecord, ...prev];
    });

    // Create live event
    const liveEvent: LiveScanEvent = {
      id: `evt-${Date.now()}`,
      timestamp: Date.now(),
      type: actionType,
      employee,
      checkInStatus,
      timeString,
      message: actionType === 'check_in'
        ? `${employee.name} berhasil presensi masuk (${checkInStatus === 'terlambat' ? 'Terlambat' : 'Tepat Waktu'})`
        : `${employee.name} berhasil presensi pulang`
    };

    setRecentEvents((prev) => [liveEvent, ...prev.slice(0, 19)]);

    // Broadcast across browser tabs
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const ch = new BroadcastChannel('presensi_qr_sync_channel');
        ch.postMessage({
          type: 'NEW_ATTENDANCE_EVENT',
          eventData: liveEvent,
          newRecord: updatedRecord
        });
        ch.close();
      }
    } catch {
      // Ignore
    }

    // Audio & Visual celebratory effect
    if (settings.soundEnabled) {
      if (actionType === 'check_in') {
        playSuccessChime();
      } else {
        playCheckoutChime();
      }
    }

    if (actionType === 'check_in' && checkInStatus === 'tepat_waktu') {
      try {
        confetti({
          particleCount: 25,
          spread: 45,
          origin: { y: 0.8 },
          colors: ['#0284c7', '#10b981', '#38bdf8']
        });
      } catch {
        // Ignore confetti errors
      }
    }

    const message = actionType === 'check_in'
      ? `Presensi Masuk Berhasil: ${employee.name} (${checkInStatus === 'terlambat' ? 'Terlambat' : 'Tepat Waktu'})`
      : `Presensi Pulang Berhasil: ${employee.name} pada ${timeString}`;

    return {
      success: true,
      message,
      type: actionType,
      employee,
      record: updatedRecord,
      status: checkInStatus,
      isLate: checkInStatus === 'terlambat'
    };
  }, [employees, records, settings.soundEnabled, evaluateCheckInStatus]);

  // Add Manual Record
  const addManualRecord = (recordData: Omit<AttendanceRecord, 'id'>) => {
    const newRecord: AttendanceRecord = {
      ...recordData,
      id: `rec-manual-${Date.now()}`
    };
    setRecords((prev) => [newRecord, ...prev]);

    // Live event
    const emp = employees.find((e) => e.id === recordData.employeeId);
    if (emp) {
      const liveEvent: LiveScanEvent = {
        id: `evt-${Date.now()}`,
        timestamp: Date.now(),
        type: 'check_in',
        employee: emp,
        checkInStatus: recordData.checkInStatus,
        timeString: recordData.checkInTime || '08:00:00',
        message: `Admin mencatat kehadiran manual: ${emp.name} (${recordData.status.toUpperCase()})`
      };
      setRecentEvents((prev) => [liveEvent, ...prev.slice(0, 19)]);
    }
  };

  const updateRecord = (id: string, updates: Partial<AttendanceRecord>) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const deleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  // Employee management
  const addEmployee = (empData: Omit<Employee, 'id'>): Employee => {
    const id = `emp-${String(employees.length + 1).padStart(3, '0')}`;
    const newEmp: Employee = {
      ...empData,
      id,
      qrCodeSecret: empData.qrCodeSecret || `QR-EMP-${empData.nip.replace(/\D/g, '') || Date.now()}`
    };
    setEmployees((prev) => [...prev, newEmp]);
    return newEmp;
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  };

  const deleteEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  };

  const updateSettings = (newSettings: Partial<OfficeSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Simulation feature for demonstration
  const simulateRandomScan = useCallback((): ScanResult | null => {
    const activeEmps = employees.filter((e) => e.status === 'active');
    if (activeEmps.length === 0) return null;

    const today = getTodayDateString();
    // Prefer employee who hasn't checked in yet, or one who checked in and needs checkout
    const notCheckedIn = activeEmps.filter(
      (e) => !records.some((r) => r.employeeId === e.id && r.date === today)
    );

    let targetEmp: Employee;
    if (notCheckedIn.length > 0) {
      targetEmp = notCheckedIn[Math.floor(Math.random() * notCheckedIn.length)];
    } else {
      targetEmp = activeEmps[Math.floor(Math.random() * activeEmps.length)];
    }

    return recordAttendance(targetEmp.qrCodeSecret, 'kiosk_qr', {
      notes: 'Presensi via simulasi otomatis scanner'
    });
  }, [employees, records, recordAttendance]);

  // Automated background simulator timer
  useEffect(() => {
    if (!isSimulating) return;

    const timer = setInterval(() => {
      simulateRandomScan();
    }, 7000);

    return () => clearInterval(timer);
  }, [isSimulating, simulateRandomScan]);

  const resetToDefault = () => {
    localStorage.removeItem(STORAGE_KEYS.RECORDS);
    localStorage.removeItem(STORAGE_KEYS.EMPLOYEES);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    setEmployees(INITIAL_EMPLOYEES);
    setRecords(generateInitialRecords());
    setSettings(INITIAL_SETTINGS);
    setRecentEvents([]);
  };

  // Compute Dashboard Statistics
  const stats: AttendanceStats = useMemo(() => {
    const activeEmployees = employees.filter((e) => e.status === 'active');
    const totalEmployees = activeEmployees.length;

    const todayRecords = records.filter((r) => r.date === todayString);

    let presentToday = 0;
    let onTimeToday = 0;
    let lateToday = 0;
    let permitToday = 0;
    let sickToday = 0;
    let currentlyInOffice = 0;

    todayRecords.forEach((r) => {
      if (r.status === 'hadir' || r.status === 'terlambat') {
        presentToday += 1;
        if (r.checkInStatus === 'tepat_waktu') {
          onTimeToday += 1;
        } else {
          lateToday += 1;
        }
        if (r.checkInTime && !r.checkOutTime) {
          currentlyInOffice += 1;
        }
      } else if (r.status === 'izin') {
        permitToday += 1;
      } else if (r.status === 'sakit') {
        sickToday += 1;
      }
    });

    const absentToday = Math.max(0, totalEmployees - (presentToday + permitToday + sickToday));
    const attendanceRate = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0;

    return {
      totalEmployees,
      presentToday,
      onTimeToday,
      lateToday,
      permitToday,
      sickToday,
      absentToday,
      attendanceRate,
      currentlyInOffice,
    };
  }, [employees, records, todayString]);

  return (
    <AttendanceContext.Provider
      value={{
        employees,
        records,
        settings,
        recentEvents,
        stats,
        todayString,
        dynamicToken,
        dynamicTokenSecondsLeft,
        isSimulating,
        setIsSimulating,
        recordAttendance,
        addManualRecord,
        updateRecord,
        deleteRecord,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        updateSettings,
        simulateRandomScan,
        resetToDefault,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};
