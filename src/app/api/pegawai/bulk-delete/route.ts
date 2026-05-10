import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { createLog } from '@/lib/activity-log';
import { ModulLog, AksiLog } from '@prisma/client';

export const POST = withAuth(
  async (req, ctx, user) => {
    try {
      const { ids } = await req.json();

      if (!Array.isArray(ids) || ids.length === 0) {
        return errorResponse('Invalid IDs', 400);
      }

      // Check if any of these pegawai belong to a SUPERADMIN
      const pegawaiWithUser = await prisma.pegawai.findMany({
        where: { id: { in: ids } },
        include: { users: true }
      });

      const superadminPegawai = pegawaiWithUser.filter(p => p.users.some(u => u.role === 'SUPERADMIN'));
      
      const idsToDelete = ids.filter(id => !superadminPegawai.some(p => p.id === id));

      if (idsToDelete.length === 0) {
        return errorResponse('Cannot delete pegawai associated with SUPERADMIN', 403);
      }

      await prisma.pegawai.updateMany({
        where: { id: { in: idsToDelete } },
        data: { deletedAt: new Date() },
      });

      await createLog({
        userId: user.userId,
        username: user.username,
        modul: ModulLog.PEGAWAI,
        aksi: AksiLog.DELETE,
        deskripsi: `Menghapus massal ${idsToDelete.length} pegawai`,
      });

      let message = `${idsToDelete.length} pegawai berhasil dihapus`;
      if (superadminPegawai.length > 0) {
        message += `. ${superadminPegawai.length} pegawai dilewati karena terkait role SUPERADMIN.`;
      }

      return successResponse(message);
    } catch (error: any) {
      return errorResponse(error.message || 'Failed to bulk delete pegawai', 500);
    }
  },
  'ADMIN_HRD'
);
