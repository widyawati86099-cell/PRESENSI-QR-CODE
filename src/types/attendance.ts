export type AttendanceStatus = 'hadir' | 'terlambat' | 'izin' | 'sakit' | 'alpa';
export type CheckInStatus = 'tepat_waktu' | 'terlambat';
export type ScanType = 'kiosk_qr' | 'mobile_camera' | 'manual';
export type Department = 'IT & Engineering' | 'Human Resources' | 'Finance & Accounting' | 'Marketing & Creative' | 'Operasional';

export interface Employee {
  id: string;
  nip: string;
  name: string;
  email: string;
  phone: string;
  department: Department;
  position: string;
  avatarUrl: string;
  qrCodeSecret: string;
  status: 'active' | 'inactive';
  joinedDate: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNip: string;
  department: Department;
  avatarUrl?: string;
  date: string; // YYYY-MM-DD
  checkInTime: string; // HH:mm:ss
  checkInStatus: CheckInStatus;
  checkOutTime?: string; // HH:mm:ss
  status: AttendanceStatus;
  scanType: ScanType;
  photoUrl?: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
    distanceMeters: number;
    isValidRadius: boolean;
  };
  notes?: string;
}

export interface OfficeSettings {
  officeName: string;
  officeAddress: string;
  targetCoordinates: {
    lat: number;
    lng: number;
  };
  radiusMeters: number;
  workStartTime: string; // e.g. "08:00"
  lateToleranceMinutes: number; // e.g. 15 -> after 08:15 is considered late
  workEndTime: string; // e.g. "17:00"
  dynamicQrIntervalSeconds: number; // e.g. 20s
  soundEnabled: boolean;
  requireSelfie: boolean;
  requireGps: boolean;
}

export interface LiveScanEvent {
  id: string;
  timestamp: number;
  type: 'check_in' | 'check_out';
  employee: Employee;
  checkInStatus: CheckInStatus;
  timeString: string;
  message: string;
}
