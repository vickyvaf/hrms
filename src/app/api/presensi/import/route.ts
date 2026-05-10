import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import prisma from '@/lib/prisma';
import { parsePresensiExcel } from '@/lib/excel-parser';
import { calculatePresensiDuration, determineStatusPresensi } from '@/lib/presensi-calc';
import { successResponse, errorResponse } from '@/lib/api-response';
import { createLog } from '@/lib/activity-log';
import { ModulLog, AksiLog, LokasiGedung, StatusKehadiran } from '@prisma/client';

/**
 * @swagger
 * /api/presensi/import:
 *   post:
 *     summary: Import attendance records from Excel
 *     tags: [Presensi]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Presensi imported successfully
 */
export const POST = withAuth(
  async (req, ctx, user) => {
    try {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      if (!file) return errorResponse('No file uploaded', 400);

      const buffer = Buffer.from(await file.arrayBuffer());
      const rawData: any[] = parsePresensiExcel(buffer);

      const results = [];
      for (const row of rawData) {
        const {
          NIP,
          'Tanggal (YYYY-MM-DD)': tanggalStr,
          'Lokasi Checkin': locIn,
          'Lokasi Checkout': locOut,
          'Waktu Checkin (HH:mm)': timeIn,
          'Waktu Checkout (HH:mm)': timeOut,
          'Status Kehadiran (HADIR/CUTI/IZIN/UNPAID_LEAVE)': statusStr,
          Keterangan
        } = row;

        const pegawai = await prisma.pegawai.findUnique({ where: { nip: NIP.toString() } });
        if (!pegawai) continue;

        const tanggal = new Date(tanggalStr);
        const checkin = timeIn ? new Date(`${tanggalStr}T${timeIn}:00`) : null;
        const checkout = timeOut ? new Date(`${tanggalStr}T${timeOut}:00`) : null;

        let durasiJam = 0;
        let statusTerpenuhi = false;

        if (checkin && checkout) {
          durasiJam = calculatePresensiDuration(checkin, checkout);
          statusTerpenuhi = determineStatusPresensi({
            lokasiCheckin: locIn as LokasiGedung,
            lokasiCheckout: locOut as LokasiGedung,
            durasiJam
          });
        }

        const presensi = await prisma.presensi.upsert({
          where: {
            pegawaiId_tanggal: {
              pegawaiId: pegawai.id,
              tanggal,
            },
          },
          update: {
            lokasiCheckin: locIn as LokasiGedung,
            lokasiCheckout: locOut as LokasiGedung,
            waktuCheckin: checkin,
            waktuCheckout: checkout,
            statusKehadiran: statusStr as StatusKehadiran,
            durasiJam,
            statusTerpenuhi,
            keterangan: Keterangan,
            bulan: tanggal.getMonth() + 1,
            tahun: tanggal.getFullYear(),
          },
          create: {
            pegawaiId: pegawai.id,
            tanggal,
            lokasiCheckin: locIn as LokasiGedung,
            lokasiCheckout: locOut as LokasiGedung,
            waktuCheckin: checkin,
            waktuCheckout: checkout,
            statusKehadiran: statusStr as StatusKehadiran,
            durasiJam,
            statusTerpenuhi,
            keterangan: Keterangan,
            bulan: tanggal.getMonth() + 1,
            tahun: tanggal.getFullYear(),
          },
        });
        results.push(presensi);
      }

      await createLog({
        userId: user.userId,
        username: user.username,
        modul: ModulLog.PRESENSI,
        aksi: AksiLog.IMPORT,
        deskripsi: `Import presensi from Excel, ${results.length} records processed`,
      });

      return successResponse('Presensi imported successfully', { count: results.length });
    } catch (error: any) {
      console.error('Import presensi error:', error);
      return errorResponse(error.message || 'Failed to import presensi', 500);
    }
  },
  'SUPERADMIN', 'MANAGER_HRD', 'ADMIN_HRD'
);
