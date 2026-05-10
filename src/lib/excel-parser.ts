import * as XLSX from 'xlsx';

export const parsePresensiExcel = (buffer: Buffer) => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Convert to JSON
  const data = XLSX.utils.sheet_to_json(worksheet);
  
  return data;
};

export const generatePresensiTemplate = () => {
  const headers = [
    'NIP',
    'Tanggal (YYYY-MM-DD)',
    'Lokasi Checkin',
    'Lokasi Checkout',
    'Waktu Checkin (HH:mm)',
    'Waktu Checkout (HH:mm)',
    'Status Kehadiran (HADIR/CUTI/IZIN/UNPAID_LEAVE)',
    'Keterangan'
  ];
  
  const examples = [
    ['11111111', '2024-05-01', 'GEDUNG_UTAMA', 'GEDUNG_UTAMA', '08:00', '17:00', 'HADIR', 'Masuk normal'],
    ['22222222', '2024-05-01', '', '', '', '', 'IZIN', 'Acara keluarga'],
    ['33333333', '2024-05-01', 'GEDUNG_A', 'GEDUNG_A', '08:15', '17:30', 'HADIR', 'Lembur sedikit'],
  ];
  
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...examples]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Presensi');

  // Adjust column widths for template as well
  const wscols = [
    { wch: 15 }, // NIP
    { wch: 20 }, // Tanggal
    { wch: 15 }, // Lokasi In
    { wch: 15 }, // Lokasi Out
    { wch: 20 }, // Waktu In
    { wch: 20 }, // Waktu Out
    { wch: 35 }, // Status
    { wch: 20 }, // Keterangan
  ];
  worksheet['!cols'] = wscols;
  
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return buffer;
};

export const exportPresensiToExcel = (data: any[]) => {
  const formattedData = data.map((item, index) => ({
    'No': index + 1,
    'NIP': item.pegawai?.nip || '-',
    'Nama Pegawai': item.pegawai?.nama || '-',
    'Tanggal': new Date(item.tanggal).toLocaleDateString('id-ID'),
    'Status': item.statusKehadiran,
    'Check-in': item.waktuCheckin ? new Date(item.waktuCheckin).toLocaleTimeString('id-ID') : '-',
    'Check-out': item.waktuCheckout ? new Date(item.waktuCheckout).toLocaleTimeString('id-ID') : '-',
    'Durasi (Jam)': item.durasiJam ? parseFloat(item.durasiJam).toFixed(1) : '0',
    'Status Terpenuhi': item.statusTerpenuhi ? 'YA' : 'TIDAK',
    'Verifikasi': item.verifikasi,
    'Keterangan': item.keterangan || '-',
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Presensi');

  // Adjust column widths
  const wscols = [
    { wch: 5 },  // No
    { wch: 15 }, // NIP
    { wch: 25 }, // Nama
    { wch: 15 }, // Tanggal
    { wch: 12 }, // Status
    { wch: 12 }, // Check-in
    { wch: 12 }, // Check-out
    { wch: 12 }, // Durasi
    { wch: 15 }, // Status Terpenuhi
    { wch: 12 }, // Verifikasi
    { wch: 30 }, // Keterangan
  ];
  worksheet['!cols'] = wscols;

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return buffer;
};
