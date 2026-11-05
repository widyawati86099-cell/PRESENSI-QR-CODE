import { Employee, AttendanceRecord, OfficeSettings } from '../types/attendance';

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-001',
    nip: 'NIP-2024-001',
    name: 'Budi Pratama',
    email: 'budi.pratama@perusahaan.co.id',
    phone: '0812-8899-1001',
    department: 'IT & Engineering',
    position: 'Senior Software Engineer',
    avatarUrl: '/src/assets/images/avatar_employee_male_1_1793848457132.jpg',
    qrCodeSecret: 'QR-EMP-BUDI-9901',
    status: 'active',
    joinedDate: '2023-01-15'
  },
  {
    id: 'emp-002',
    nip: 'NIP-2024-002',
    name: 'Anisa Rahmawati',
    email: 'anisa.rahma@perusahaan.co.id',
    phone: '0813-7744-2002',
    department: 'Finance & Accounting',
    position: 'Finance Lead',
    avatarUrl: '/src/assets/images/avatar_employee_female_1_1793848455913.jpg',
    qrCodeSecret: 'QR-EMP-ANISA-9902',
    status: 'active',
    joinedDate: '2023-03-01'
  },
  {
    id: 'emp-003',
    nip: 'NIP-2024-003',
    name: 'Dewi Lestari',
    email: 'dewi.lestari@perusahaan.co.id',
    phone: '0811-2233-3003',
    department: 'Human Resources',
    position: 'HR Manager',
    avatarUrl: '/src/assets/images/avatar_employee_female_2_1793848457814.jpg',
    qrCodeSecret: 'QR-EMP-DEWI-9903',
    status: 'active',
    joinedDate: '2022-08-10'
  },
  {
    id: 'emp-004',
    nip: 'NIP-2024-004',
    name: 'Dimas Setiawan',
    email: 'dimas.setiawan@perusahaan.co.id',
    phone: '0815-6677-4004',
    department: 'IT & Engineering',
    position: 'Frontend Developer',
    avatarUrl: '',
    qrCodeSecret: 'QR-EMP-DIMAS-9904',
    status: 'active',
    joinedDate: '2023-06-20'
  },
  {
    id: 'emp-005',
    nip: 'NIP-2024-005',
    name: 'Siti Rahayu',
    email: 'siti.rahayu@perusahaan.co.id',
    phone: '0819-3322-5005',
    department: 'Marketing & Creative',
    position: 'Digital Marketer',
    avatarUrl: '',
    qrCodeSecret: 'QR-EMP-SITI-9905',
    status: 'active',
    joinedDate: '2023-09-05'
  },
  {
    id: 'emp-006',
    nip: 'NIP-2024-006',
    name: 'Fajar Nugroho',
    email: 'fajar.nugroho@perusahaan.co.id',
    phone: '0821-4455-6006',
    department: 'Operasional',
    position: 'Operations Supervisor',
    avatarUrl: '',
    qrCodeSecret: 'QR-EMP-FAJAR-9906',
    status: 'active',
    joinedDate: '2022-11-12'
  },
  {
    id: 'emp-007',
    nip: 'NIP-2024-007',
    name: 'Rina Wulandari',
    email: 'rina.wulan@perusahaan.co.id',
    phone: '0857-1122-7007',
    department: 'Finance & Accounting',
    position: 'Tax Specialist',
    avatarUrl: '',
    qrCodeSecret: 'QR-EMP-RINA-9907',
    status: 'active',
    joinedDate: '2024-02-01'
  },
  {
    id: 'emp-008',
    nip: 'NIP-2024-008',
    name: 'Aditya Pratama',
    email: 'aditya.p@perusahaan.co.id',
    phone: '0812-9988-8008',
    department: 'IT & Engineering',
    position: 'DevOps Engineer',
    avatarUrl: '',
    qrCodeSecret: 'QR-EMP-ADIT-9908',
    status: 'active',
    joinedDate: '2023-04-10'
  },
  {
    id: 'emp-009',
    nip: 'NIP-2024-009',
    name: 'Maya Anggraini',
    email: 'maya.a@perusahaan.co.id',
    phone: '0813-5566-9009',
    department: 'Marketing & Creative',
    position: 'UI/UX Designer',
    avatarUrl: '',
    qrCodeSecret: 'QR-EMP-MAYA-9909',
    status: 'active',
    joinedDate: '2023-08-15'
  },
  {
    id: 'emp-010',
    nip: 'NIP-2024-010',
    name: 'Hendra Wijaya',
    email: 'hendra.w@perusahaan.co.id',
    phone: '0818-7788-1010',
    department: 'Operasional',
    position: 'Logistics Officer',
    avatarUrl: '',
    qrCodeSecret: 'QR-EMP-HENDRA-9910',
    status: 'active',
    joinedDate: '2023-10-01'
  }
];

export const INITIAL_SETTINGS: OfficeSettings = {
  officeName: 'Kantor Pusat Wisma Nusantara',
  officeAddress: 'Jl. M.H. Thamrin No. 59, Gondangdia, Menteng, Jakarta Pusat',
  targetCoordinates: {
    lat: -6.1925,
    lng: 106.8239
  },
  radiusMeters: 150,
  workStartTime: '08:00',
  lateToleranceMinutes: 15,
  workEndTime: '17:00',
  dynamicQrIntervalSeconds: 20,
  soundEnabled: true,
  requireSelfie: false,
  requireGps: true
};

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function generateInitialRecords(): AttendanceRecord[] {
  const today = getTodayDateString();

  return [
    {
      id: 'rec-001',
      employeeId: 'emp-001',
      employeeName: 'Budi Pratama',
      employeeNip: 'NIP-2024-001',
      department: 'IT & Engineering',
      avatarUrl: '/src/assets/images/avatar_employee_male_1_1793848457132.jpg',
      date: today,
      checkInTime: '07:48:22',
      checkInStatus: 'tepat_waktu',
      status: 'hadir',
      scanType: 'kiosk_qr',
      location: {
        lat: -6.1924,
        lng: 106.8238,
        address: 'Lobi Utama Lt. 1',
        distanceMeters: 14,
        isValidRadius: true
      },
      notes: 'Hadir tepat waktu di kantor'
    },
    {
      id: 'rec-002',
      employeeId: 'emp-002',
      employeeName: 'Anisa Rahmawati',
      employeeNip: 'NIP-2024-002',
      department: 'Finance & Accounting',
      avatarUrl: '/src/assets/images/avatar_employee_female_1_1793848455913.jpg',
      date: today,
      checkInTime: '07:54:10',
      checkInStatus: 'tepat_waktu',
      status: 'hadir',
      scanType: 'kiosk_qr',
      location: {
        lat: -6.1926,
        lng: 106.8240,
        address: 'Lobi Utama Lt. 1',
        distanceMeters: 22,
        isValidRadius: true
      },
      notes: 'Presensi scan QR lobby'
    },
    {
      id: 'rec-003',
      employeeId: 'emp-003',
      employeeName: 'Dewi Lestari',
      employeeNip: 'NIP-2024-003',
      department: 'Human Resources',
      avatarUrl: '/src/assets/images/avatar_employee_female_2_1793848457814.jpg',
      date: today,
      checkInTime: '07:35:45',
      checkInStatus: 'tepat_waktu',
      status: 'hadir',
      scanType: 'mobile_camera',
      location: {
        lat: -6.1925,
        lng: 106.8239,
        address: 'Gedung Wisma Nusantara',
        distanceMeters: 8,
        isValidRadius: true
      },
      notes: 'Presensi mandiri ponsel'
    },
    {
      id: 'rec-004',
      employeeId: 'emp-004',
      employeeName: 'Dimas Setiawan',
      employeeNip: 'NIP-2024-004',
      department: 'IT & Engineering',
      date: today,
      checkInTime: '08:24:19',
      checkInStatus: 'terlambat',
      status: 'terlambat',
      scanType: 'kiosk_qr',
      location: {
        lat: -6.1928,
        lng: 106.8241,
        address: 'Lobi Utama Lt. 1',
        distanceMeters: 35,
        isValidRadius: true
      },
      notes: 'Keterlambatan 9 menit karena kendala KRL Manggarai'
    },
    {
      id: 'rec-005',
      employeeId: 'emp-005',
      employeeName: 'Siti Rahayu',
      employeeNip: 'NIP-2024-005',
      department: 'Marketing & Creative',
      date: today,
      checkInTime: '07:58:33',
      checkInStatus: 'tepat_waktu',
      status: 'hadir',
      scanType: 'mobile_camera',
      location: {
        lat: -6.1923,
        lng: 106.8237,
        address: 'Gedung Wisma Nusantara',
        distanceMeters: 28,
        isValidRadius: true
      },
      notes: 'Scan via web mobile'
    },
    {
      id: 'rec-006',
      employeeId: 'emp-006',
      employeeName: 'Fajar Nugroho',
      employeeNip: 'NIP-2024-006',
      department: 'Operasional',
      date: today,
      checkInTime: '08:02:11',
      checkInStatus: 'tepat_waktu',
      status: 'hadir',
      scanType: 'kiosk_qr',
      location: {
        lat: -6.1925,
        lng: 106.8239,
        address: 'Lobi Utama Lt. 1',
        distanceMeters: 10,
        isValidRadius: true
      },
      notes: 'Tepat waktu dalam batas toleransi'
    },
    {
      id: 'rec-007',
      employeeId: 'emp-007',
      employeeName: 'Rina Wulandari',
      employeeNip: 'NIP-2024-007',
      department: 'Finance & Accounting',
      date: today,
      checkInTime: '08:31:05',
      checkInStatus: 'terlambat',
      status: 'terlambat',
      scanType: 'mobile_camera',
      location: {
        lat: -6.1925,
        lng: 106.8239,
        address: 'Gedung Wisma Nusantara',
        distanceMeters: 12,
        isValidRadius: true
      },
      notes: 'Terlambat 16 menit'
    }
  ];
}
