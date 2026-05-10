import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { createLog } from '@/lib/activity-log';
import { ModulLog, AksiLog } from '@prisma/client';

export const POST = withAuth(
  async (req, ctx, user) => {
    try {
      const { ids, isActive } = await req.json();

      if (!Array.isArray(ids) || ids.length === 0) {
        return errorResponse('Invalid IDs', 400);
      }

      await prisma.pegawai.updateMany({
        where: { id: { in: ids } },
        data: { isActive },
      });

      await createLog({
        userId: user.userId,
        username: user.username,
        modul: ModulLog.PEGAWAI,
        aksi: AksiLog.UPDATE,
        deskripsi: `Memperbarui status massal ${ids.length} pegawai menjadi ${isActive ? 'Aktif' : 'Non-aktif'}`,
      });

      return successResponse(`${ids.length} pegawai berhasil di${isActive ? 'aktifkan' : 'nonaktifkan'}`);
    } catch (error: any) {
      return errorResponse(error.message || 'Failed to bulk update status', 500);
    }
  },
  'ADMIN_HRD'
);
