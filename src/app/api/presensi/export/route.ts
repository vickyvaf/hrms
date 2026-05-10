import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import prisma from '@/lib/prisma';
import { exportPresensiToExcel } from '@/lib/excel-parser';
import { createLog } from '@/lib/activity-log';
import { ModulLog, AksiLog } from '@prisma/client';

export const GET = withAuth(
  async (req, ctx, user) => {
    try {
      const { searchParams } = new URL(req.url);
      const search = searchParams.get('search') || '';
      const bulan = searchParams.get('bulan');
      const tahun = searchParams.get('tahun');

      const where: any = {
        AND: [],
      };

      if (search) {
        where.AND.push({
          pegawai: {
            nama: { contains: search, mode: 'insensitive' },
          },
        });
      }

      if (bulan) where.AND.push({ bulan: parseInt(bulan) });
      if (tahun) where.AND.push({ tahun: parseInt(tahun) });

      const data = await prisma.presensi.findMany({
        where,
        include: {
          pegawai: {
            select: {
              nama: true,
              nip: true,
            },
          },
        },
        orderBy: { tanggal: 'desc' },
      });

      const buffer = exportPresensiToExcel(data);

      await createLog({
        userId: user.userId,
        username: user.username,
        modul: ModulLog.PRESENSI,
        aksi: AksiLog.DOWNLOAD,
        deskripsi: `Export presensi to Excel, ${data.length} records exported`,
      });

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="data_presensi_${bulan}_${tahun}.xlsx"`,
        },
      });
    } catch (error: any) {
      console.error('Export presensi error:', error);
      return new NextResponse(JSON.stringify({ message: 'Failed to export presensi' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
  'SUPERADMIN', 'MANAGER_HRD', 'ADMIN_HRD'
);
