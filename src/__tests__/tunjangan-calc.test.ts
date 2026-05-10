import { calculateTunjanganTransport } from '../lib/tunjangan-calc';
import { JenisPegawai } from '@prisma/client';

describe('calculateTunjanganTransport', () => {
  const baseFare = 2500;

  test('should return 0 if pegawai is not TETAP', () => {
    expect(calculateTunjanganTransport({
      jenisPegawai: JenisPegawai.KONTRAK,
      baseFare,
      jarakKm: 10,
      jumlahHariMasuk: 20
    })).toBe(0);

    expect(calculateTunjanganTransport({
      jenisPegawai: JenisPegawai.MAGANG,
      baseFare,
      jarakKm: 10,
      jumlahHariMasuk: 20
    })).toBe(0);
  });

  test('should return 0 if jumlah hari masuk < 19', () => {
    expect(calculateTunjanganTransport({
      jenisPegawai: JenisPegawai.TETAP,
      baseFare,
      jarakKm: 10,
      jumlahHariMasuk: 18
    })).toBe(0);
  });

  test('should return 0 if jarak <= 5 km', () => {
    expect(calculateTunjanganTransport({
      jenisPegawai: JenisPegawai.TETAP,
      baseFare,
      jarakKm: 5,
      jumlahHariMasuk: 20
    })).toBe(0);
  });

  test('should cap distance at 25 km', () => {
    // 2500 * 25 * 20 = 1,250,000
    expect(calculateTunjanganTransport({
      jenisPegawai: JenisPegawai.TETAP,
      baseFare,
      jarakKm: 30,
      jumlahHariMasuk: 20
    })).toBe(2500 * 25 * 20);
  });

  test('should round down if decimal < 0.5', () => {
    // 10.4 -> 10
    // 2500 * 10 * 20 = 500,000
    expect(calculateTunjanganTransport({
      jenisPegawai: JenisPegawai.TETAP,
      baseFare,
      jarakKm: 10.4,
      jumlahHariMasuk: 20
    })).toBe(500000);
  });

  test('should round up if decimal >= 0.5', () => {
    // 10.5 -> 11
    // 2500 * 11 * 20 = 550,000
    expect(calculateTunjanganTransport({
      jenisPegawai: JenisPegawai.TETAP,
      baseFare,
      jarakKm: 10.5,
      jumlahHariMasuk: 20
    })).toBe(550000);
  });

  test('should calculate normally for valid inputs', () => {
    // 2500 * 15 * 22 = 825,000
    expect(calculateTunjanganTransport({
      jenisPegawai: JenisPegawai.TETAP,
      baseFare,
      jarakKm: 15,
      jumlahHariMasuk: 22
    })).toBe(825000);
  });
});
