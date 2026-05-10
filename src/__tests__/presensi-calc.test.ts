import { calculatePresensiDuration, determineStatusPresensi } from '../lib/presensi-calc';
import { LokasiGedung } from '@prisma/client';

describe('calculatePresensiDuration', () => {
  const date = '2024-03-20';

  test('should return 8 hours if checkin 08:00 and checkout 17:00 (1h rest)', () => {
    const checkin = new Date(`${date}T08:00:00`);
    const checkout = new Date(`${date}T17:00:00`);
    expect(calculatePresensiDuration(checkin, checkout)).toBe(8);
  });

  test('should consider as 08:00 if late <= 15 minutes', () => {
    const checkin = new Date(`${date}T08:15:00`);
    const checkout = new Date(`${date}T17:15:00`); // capped at 17:00 in current logic
    expect(calculatePresensiDuration(checkin, checkout)).toBe(8);
  });

  test('should deduct rest hour (12:00-13:00)', () => {
    const checkin = new Date(`${date}T08:00:00`);
    const checkout = new Date(`${date}T12:30:00`);
    // 08:00 to 12:00 = 4 hours. 12:00 to 12:30 is rest time.
    expect(calculatePresensiDuration(checkin, checkout)).toBe(4);
  });

  test('should return half day logic if late > 15 minutes (handled by duration >= 8 check later)', () => {
    const checkin = new Date(`${date}T08:16:00`);
    const checkout = new Date(`${date}T17:00:00`);
    // 08:16 to 17:00 = 8h 44m. Minus 1h rest = 7h 44m.
    // 7.7333 hours
    expect(calculatePresensiDuration(checkin, checkout)).toBeLessThan(8);
  });
});

describe('determineStatusPresensi', () => {
  test('should return false if lokasi checkin != lokasi checkout', () => {
    expect(determineStatusPresensi({
      lokasiCheckin: LokasiGedung.GEDUNG_UTAMA,
      lokasiCheckout: LokasiGedung.GEDUNG_A,
      durasiJam: 8
    })).toBe(false);
  });

  test('should return true if same location and duration >= 8', () => {
    expect(determineStatusPresensi({
      lokasiCheckin: LokasiGedung.GEDUNG_UTAMA,
      lokasiCheckout: LokasiGedung.GEDUNG_UTAMA,
      durasiJam: 8
    })).toBe(true);
  });

  test('should return false if duration < 8', () => {
    expect(determineStatusPresensi({
      lokasiCheckin: LokasiGedung.GEDUNG_UTAMA,
      lokasiCheckout: LokasiGedung.GEDUNG_UTAMA,
      durasiJam: 7.9
    })).toBe(false);
  });
});
