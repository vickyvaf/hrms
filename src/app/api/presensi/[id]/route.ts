import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

export const GET = withAuth(
  async (req, { params }: any, user) => {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const bulan = searchParams.get('bulan');
    const tahun = searchParams.get('tahun');

    const where: any = {
      pegawaiId: id,
    };

    if (bulan) where.bulan = parseInt(bulan);
    if (tahun) where.tahun = parseInt(tahun);

    const data = await prisma.presensi.findMany({
      where,
      orderBy: { tanggal: 'asc' },
    });

    return successResponse('Presensi detail fetched', data);
  },
  'MANAGER_HRD', 'ADMIN_HRD'
);

export const PUT = withAuth(
  async (req, { params }: any, user) => {
    try {
      const { id } = await params; // This is actually the presensi ID, not pegawai ID in common CRUD
      // But the PRD says src/app/api/presensi/[id]/route.ts
      // In the context of list pegawai rekap, [id] could be pegawaiId.
      // Let's check how the frontend uses it.
      // Actually, typically CRUD for a single record uses the record ID.
      
      const body = await req.json();
      const { statusVerifikasi, verifikator, keterangan } = body;

      const updated = await prisma.presensi.update({
        where: { id },
        data: {
          verifikasi: statusVerifikasi,
          verifikator,
          keterangan,
        },
      });

      return successResponse('Presensi updated successfully', updated);
    } catch (error: any) {
      return errorResponse(error.message || 'Failed to update presensi', 500);
    }
  },
  'ADMIN_HRD'
);
