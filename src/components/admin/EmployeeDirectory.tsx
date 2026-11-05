import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  Users, 
  UserPlus, 
  QrCode, 
  Download, 
  Printer, 
  Search, 
  Filter, 
  Edit, 
  Trash2,
  CheckCircle,
  Sparkles,
  Building,
  Mail,
  Phone
} from 'lucide-react';
import { useAttendance } from '../../context/AttendanceContext';
import { Employee, Department } from '../../types/attendance';

export const EmployeeDirectory: React.FC = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee, recordAttendance } = useAttendance();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [activeModal, setActiveModal] = useState<'none' | 'add' | 'edit' | 'badge'>('none');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [generatedQrDataUrl, setGeneratedQrDataUrl] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    nip: '',
    email: '',
    phone: '',
    department: 'IT & Engineering' as Department,
    position: '',
    avatarUrl: '',
    status: 'active' as 'active' | 'inactive',
  });

  // Filtered list
  const filteredEmployees = employees.filter((e) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      e.name.toLowerCase().includes(q) ||
      e.nip.toLowerCase().includes(q) ||
      e.position.toLowerCase().includes(q);
    const matchDept = selectedDept === 'all' || e.department === selectedDept;
    return matchSearch && matchDept;
  });

  // Generate QR image when badge modal opens
  useEffect(() => {
    if (selectedEmployee) {
      QRCode.toDataURL(selectedEmployee.qrCodeSecret, {
        width: 300,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setGeneratedQrDataUrl(url))
        .catch((err) => console.error(err));
    }
  }, [selectedEmployee]);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      nip: `NIP-2024-${String(employees.length + 1).padStart(3, '0')}`,
      email: '',
      phone: '',
      department: 'IT & Engineering',
      position: '',
      avatarUrl: '',
      status: 'active',
    });
    setActiveModal('add');
  };

  const handleOpenEdit = (emp: Employee) => {
    setSelectedEmployee(emp);
    setFormData({
      name: emp.name,
      nip: emp.nip,
      email: emp.email,
      phone: emp.phone,
      department: emp.department,
      position: emp.position,
      avatarUrl: emp.avatarUrl,
      status: emp.status,
    });
    setActiveModal('edit');
  };

  const handleOpenBadge = (emp: Employee) => {
    setSelectedEmployee(emp);
    setActiveModal('badge');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.nip) {
      alert('Nama dan NIP wajib diisi.');
      return;
    }

    if (activeModal === 'add') {
      addEmployee({
        ...formData,
        joinedDate: new Date().toISOString().split('T')[0],
        qrCodeSecret: `QR-EMP-${formData.nip.replace(/\D/g, '') || Date.now()}`,
      });
    } else if (activeModal === 'edit' && selectedEmployee) {
      updateEmployee(selectedEmployee.id, formData);
    }

    setActiveModal('none');
    setSelectedEmployee(null);
  };

  const handleDownloadQr = () => {
    if (!generatedQrDataUrl || !selectedEmployee) return;
    const link = document.createElement('a');
    link.href = generatedQrDataUrl;
    link.download = `QR_Card_${selectedEmployee.nip}_${selectedEmployee.name.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintBadge = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Direktori Pegawai & Kartu QR
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola data pegawai, kode rahasia presensi, dan cetak Kartu ID Badge QR
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Pegawai Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama, NIP, atau jabatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-slate-900"
          />
        </div>

        <div className="w-full sm:w-auto flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-slate-900 cursor-pointer"
          >
            <option value="all">Semua Departemen ({employees.length})</option>
            <option value="IT & Engineering">IT & Engineering</option>
            <option value="Finance & Accounting">Finance & Accounting</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Marketing & Creative">Marketing & Creative</option>
            <option value="Operasional">Operasional</option>
          </select>
        </div>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map((emp) => (
          <div
            key={emp.id}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
                    {emp.avatarUrl ? (
                      <img
                        src={emp.avatarUrl}
                        alt={emp.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-bold text-slate-600">
                        {emp.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{emp.name}</h3>
                    <p className="text-xs text-slate-500 font-mono tabular-nums">{emp.nip}</p>
                    <p className="text-[11px] font-medium text-blue-600 mt-0.5">{emp.position}</p>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                    emp.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {emp.status === 'active' ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2 truncate">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{emp.department}</span>
                </div>
                {emp.email && (
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                )}
                {emp.phone && (
                  <div className="flex items-center gap-2 truncate">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono tabular-nums">{emp.phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => handleOpenBadge(emp)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5 text-blue-600" />
                <span>Kartu QR</span>
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    recordAttendance(emp.qrCodeSecret, 'kiosk_qr', {
                      notes: 'Presensi instan via tombol pegawai'
                    });
                  }}
                  title="Presensikan pegawai ini sekarang"
                  className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                </button>
                <button
                  onClick={() => handleOpenEdit(emp)}
                  title="Edit Data Pegawai"
                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Hapus data pegawai ${emp.name}?`)) {
                      deleteEmployee(emp.id);
                    }
                  }}
                  title="Hapus Pegawai"
                  className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Employee Modal */}
      {(activeModal === 'add' || activeModal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {activeModal === 'add' ? 'Tambah Pegawai Baru' : 'Perbarui Data Pegawai'}
              </h3>
              <button
                onClick={() => setActiveModal('none')}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Rian Anggara"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Nomor Induk Pegawai (NIP) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nip}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    placeholder="NIP-2024-XXX"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Departemen *
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value as Department })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
                  >
                    <option value="IT & Engineering">IT & Engineering</option>
                    <option value="Finance & Accounting">Finance & Accounting</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Marketing & Creative">Marketing & Creative</option>
                    <option value="Operasional">Operasional</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Jabatan / Posisi
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="Contoh: Backend Developer"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nama@perusahaan.co.id"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">No. WhatsApp</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  URL Foto Profil (Opsional)
                </label>
                <input
                  type="text"
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  placeholder="https://... atau biarkan kosong"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="statusActive"
                  checked={formData.status === 'active'}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.checked ? 'active' : 'inactive' })
                  }
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="statusActive" className="text-slate-700 cursor-pointer">
                  Pegawai Berstatus Aktif (Dapat melakukan presensi)
                </label>
              </div>

              <div className="p-4 bg-slate-50 -mx-5 -mb-5 mt-6 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal('none')}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  {activeModal === 'add' ? 'Simpan Pegawai' : 'Perbarui'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable ID Badge Modal */}
      {activeModal === 'badge' && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800">
                Kartu ID Presensi Pegawai
              </span>
              <button
                onClick={() => setActiveModal('none')}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Printable Badge Body */}
            <div className="p-6 flex flex-col items-center text-center bg-gradient-to-b from-slate-50 to-white">
              <div className="w-full flex items-center justify-between text-[11px] text-slate-400 mb-4 pb-2 border-b border-slate-200">
                <span className="font-bold tracking-tight text-slate-800">PresensiQR ID PASS</span>
                <span className="font-mono">{selectedEmployee.nip}</span>
              </div>

              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-white shadow-md overflow-hidden mb-3">
                {selectedEmployee.avatarUrl ? (
                  <img
                    src={selectedEmployee.avatarUrl}
                    alt={selectedEmployee.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-slate-600 text-lg">
                    {selectedEmployee.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                )}
              </div>

              <h3 className="text-base font-bold text-slate-900">{selectedEmployee.name}</h3>
              <p className="text-xs font-medium text-blue-600">{selectedEmployee.position}</p>
              <p className="text-xs text-slate-500 mt-0.5">{selectedEmployee.department}</p>

              {/* QR Code Container */}
              <div className="mt-4 p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col items-center">
                {generatedQrDataUrl ? (
                  <img
                    src={generatedQrDataUrl}
                    alt="QR Code"
                    className="w-44 h-44 object-contain"
                  />
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center text-slate-400">
                    Membuat QR...
                  </div>
                )}
                <span className="text-[10px] font-mono text-slate-400 mt-1">
                  {selectedEmployee.qrCodeSecret}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 mt-4">
                Arahkan kode QR ini ke kamera scanner lobi kantor untuk absensi kehadiran.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-2">
              <button
                onClick={handleDownloadQr}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Gambar</span>
              </button>

              <button
                onClick={handlePrintBadge}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Kartu</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
