import { JenisPegawai } from '@prisma/client';

export const OFFICE_COORDS = {
  lat: -7.7956,
  lng: 110.3695,
};

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c; // Distance in km
  return d;
};

export const calculateTunjanganTransport = ({
  jenisPegawai,
  baseFare,
  jarakKm,
  jumlahHariMasuk,
}: {
  jenisPegawai: JenisPegawai;
  baseFare: number;
  jarakKm: number;
  jumlahHariMasuk: number;
}) => {
  // Hanya pegawai TETAP yang dapat tunjangan
  if (jenisPegawai !== JenisPegawai.TETAP) {
    return 0;
  }

  // Minimal 19 hari masuk kerja
  if (jumlahHariMasuk < 19) {
    return 0;
  }

  // Jarak minimal > 5 km
  if (jarakKm <= 5) {
    return 0;
  }

  // Jarak maksimal efektif 25 km
  const effectiveJarak = Math.min(jarakKm, 25);

  // Pembulatan km: < 0.5 bulatkan bawah, >= 0.5 bulatkan atas
  const roundedJarak = Math.round(effectiveJarak);

  // Rumus: Tunjangan = base_fare × km_dibulatkan × jumlah_hari_masuk_kerja
  return baseFare * roundedJarak * jumlahHariMasuk;
};

export const roundKm = (km: number): number => {
  return Math.round(km);
};

