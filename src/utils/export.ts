import { AttendanceRecord } from '../types/attendance';

export function exportAttendanceToCSV(records: AttendanceRecord[], filenamePrefix = 'Laporan_Presensi'): void {
  if (!records || records.length === 0) {
    alert('Tidak ada data kehadiran untuk diekspor.');
    return;
  }

  const headers = [
    'Tanggal',
    'NIP',
    'Nama Pegawai',
    'Departemen',
    'Jam Masuk',
    'Status Masuk',
    'Jam Pulang',
    'Status Keseluruhan',
    'Metode Scan',
    'Lokasi / Jarak',
    'Catatan'
  ];

  const rows = records.map(record => {
    const formatStatus = (s: string) => {
      switch (s) {
        case 'hadir': return 'Hadir';
        case 'terlambat': return 'Terlambat';
        case 'izin': return 'Izin';
        case 'sakit': return 'Sakit';
        case 'alpa': return 'Alpa (Tidak Hadir)';
        default: return s;
      }
    };

    const locationText = record.location
      ? `${record.location.address} (${Math.round(record.location.distanceMeters)}m ${record.location.isValidRadius ? 'Dalam Radius' : 'Luar Radius'})`
      : 'Di Kantor';

    return [
      `"${record.date}"`,
      `"${record.employeeNip}"`,
      `"${record.employeeName.replace(/"/g, '""')}"`,
      `"${record.department}"`,
      `"${record.checkInTime || '-'}"`,
      `"${record.checkInStatus === 'terlambat' ? 'Terlambat' : 'Tepat Waktu'}"`,
      `"${record.checkOutTime || '-'}"`,
      `"${formatStatus(record.status)}"`,
      `"${record.scanType === 'kiosk_qr' ? 'Kios Layar' : record.scanType === 'mobile_camera' ? 'Kamera HP' : 'Manual HR'}"`,
      `"${locationText}"`,
      `"${(record.notes || '-').replace(/"/g, '""')}"`
    ].join(',');
  });

  // Add UTF-8 BOM so Excel reads Indonesian strings and punctuation properly
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  const todayStr = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `${filenamePrefix}_${todayStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
