import { LokasiGedung } from '@prisma/client';

export const calculatePresensiDuration = (
  checkin: Date,
  checkout: Date
): number => {
  // Start and end of work day
  const workStart = new Date(checkin);
  workStart.setHours(8, 0, 0, 0);

  const workEnd = new Date(checkin);
  workEnd.setHours(17, 0, 0, 0);

  const restStart = new Date(checkin);
  restStart.setHours(12, 0, 0, 0);

  const restEnd = new Date(checkin);
  restEnd.setHours(13, 0, 0, 0);

  // Effective checkin: if late <= 15 min, consider as 08:00
  let effectiveCheckin = new Date(checkin);
  const lateMinutes = (checkin.getTime() - workStart.getTime()) / (1000 * 60);
  
  if (lateMinutes > 0 && lateMinutes <= 15) {
    effectiveCheckin = workStart;
  }

  // Use the actual checkout or workEnd, whichever is earlier? 
  // PRD says jam kerja fix 08.00-17.00. 
  // Let's assume duration is between effectiveCheckin and checkout (capped at workEnd).
  const actualCheckout = checkout > workEnd ? workEnd : checkout;
  const actualCheckin = effectiveCheckin < workStart ? workStart : effectiveCheckin;

  if (actualCheckout <= actualCheckin) return 0;

  let durationMs = actualCheckout.getTime() - actualCheckin.getTime();

  // Subtract rest hour if checkin is before restEnd and checkout is after restStart
  if (actualCheckin < restEnd && actualCheckout > restStart) {
    const overlapStart = Math.max(actualCheckin.getTime(), restStart.getTime());
    const overlapEnd = Math.min(actualCheckout.getTime(), restEnd.getTime());
    durationMs -= (overlapEnd - overlapStart);
  }

  return Math.max(0, durationMs / (1000 * 60 * 60)); // in hours
};

export const determineStatusPresensi = ({
  lokasiCheckin,
  lokasiCheckout,
  durasiJam,
}: {
  lokasiCheckin: LokasiGedung | null;
  lokasiCheckout: LokasiGedung | null;
  durasiJam: number;
}) => {
  if (!lokasiCheckin || !lokasiCheckout) return false;
  
  // Checkin and checkout must be in the same location
  if (lokasiCheckin !== lokasiCheckout) return false;

  // Min 8 hours for "Terpenuhi"
  return durasiJam >= 8;
};
