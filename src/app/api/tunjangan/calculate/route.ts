import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { createLog } from '@/lib/activity-log';
import { ModulLog, AksiLog, JenisPegawai, StatusKehadiran } from '@prisma/client';
import { calculateDistance, calculateTunjanganTransport, OFFICE_COORDS } from '@/lib/tunjangan-calc';

/**
 * @swagger
 * /api/tunjangan/calculate:
 *   post:
 *     summary: Calculate transport allowance for a specific period
 *     tags: [Tunjangan]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bulan
 *               - tahun
 *             properties:
 *               bulan:
 *                 type: integer
 *               tahun:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Berhasil menghitung tunjangan
 */
export const POST = withAuth(
  async (req, ctx, user) => {
    try {
      const { bulan, tahun } = await req.json();

      if (!bulan || !tahun) {
        return errorResponse('Bulan dan tahun wajib diisi', 400);
      }

      // 1. Get active setting
      const setting = await prisma.settingTunjanganTransport.findFirst({
        where: { isActive: true },
      });

      if (!setting) {
        return errorResponse('Setting tunjangan aktif tidak ditemukan', 400);
      }

      // 2. Get all TETAP employees
      const employees = await prisma.pegawai.findMany({
        where: { 
          jenisPegawai: JenisPegawai.TETAP,
          isActive: true,
          deletedAt: null
        },
      });

      const results = [];

      for (const emp of employees) {
        // 3. Count HADIR presensi for the month/year
        const presensiCount = await prisma.presensi.count({
          where: {
            pegawaiId: emp.id,
            bulan: parseInt(bulan),
            tahun: parseInt(tahun),
            statusKehadiran: StatusKehadiran.HADIR,
            statusTerpenuhi: true, // Only count fulfilled attendance? PRD says "jumlah hari masuk kerja". 
            // Usually "masuk kerja" means they were present.
            // Let's count HADIR.
          },
        });

        // 4. Calculate distance
        let distance = 0;
        if (emp.latitude && emp.longitude) {
          distance = calculateDistance(
            Number(emp.latitude),
            Number(emp.longitude),
            OFFICE_COORDS.lat,
            OFFICE_COORDS.lng
          );
        }

        // 5. Calculate allowance
        const totalAllowance = calculateTunjanganTransport({
          jenisPegawai: emp.jenisPegawai,
          baseFare: Number(setting.baseFare),
          jarakKm: distance,
          jumlahHariMasuk: presensiCount,
        });

        if (totalAllowance > 0) {
          // 6. Upsert into TunjanganTransport
          const result = await prisma.tunjanganTransport.upsert({
            where: {
              pegawaiId_bulan_tahun: {
                pegawaiId: emp.id,
                bulan: parseInt(bulan),
                tahun: parseInt(tahun),
              },
            },
            update: {
              baseFare: setting.baseFare,
              jarakKm: distance,
              jarakKmBulatkan: Math.round(Math.min(distance, 25)),
              jumlahHariMasuk: presensiCount,
              totalTunjangan: totalAllowance,
              keterangan: `Dihitung otomatis pada ${new Date().toISOString()}`,
            },
            create: {
              pegawaiId: emp.id,
              bulan: parseInt(bulan),
              tahun: parseInt(tahun),
              baseFare: setting.baseFare,
              jarakKm: distance,
              jarakKmBulatkan: Math.round(Math.min(distance, 25)),
              jumlahHariMasuk: presensiCount,
              totalTunjangan: totalAllowance,
              keterangan: `Dihitung otomatis pada ${new Date().toISOString()}`,
            },
          });
          results.push(result);
        }
      }

      await createLog({
        userId: user.userId,
        username: user.username,
        modul: ModulLog.TUNJANGAN,
        aksi: AksiLog.CREATE,
        deskripsi: `Menghitung tunjangan untuk periode ${bulan}/${tahun}. Total ${results.length} record diproses.`,
      });

      return successResponse(`Berhasil menghitung tunjangan untuk ${results.length} pegawai`, results);
    } catch (error: any) {
      console.error(error);
      return errorResponse(error.message || 'Internal Server Error', 500);
    }
  },
  'ADMIN_HRD' // Based on PRD Modul 5 (CRUD Setting is ADMIN_HRD), let's assume calculation is also ADMIN_HRD or MANAGER_HRD
);
