import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { createLog } from '@/lib/activity-log';
import { ModulLog, AksiLog } from '@prisma/client';

export const PATCH = withAuth(
  async (req, ctx, user) => {
    try {
      const { id } = await ctx.params;
      const { isActive } = await req.json();

      if (isActive) {
        // Deactivate all other settings first
        await prisma.settingTunjanganTransport.updateMany({
          where: { 
            id: { not: id },
            isActive: true 
          },
          data: { isActive: false },
        });
      }

      const updatedSetting = await prisma.settingTunjanganTransport.update({
        where: { id },
        data: { isActive },
      });

      await createLog({
        userId: user.userId,
        username: user.username,
        modul: ModulLog.SETTING_TUNJANGAN,
        aksi: AksiLog.UPDATE,
        deskripsi: `Mengaktifkan setting tunjangan: ${updatedSetting.baseFare}`,
      });

      return successResponse('Pengaturan berhasil diperbarui', updatedSetting);
    } catch (error: any) {
      return errorResponse(error.message, 500);
    }
  },
  'ADMIN_HRD' // Only ADMIN_HRD based on PRD line 323
);

export const DELETE = withAuth(
  async (req, ctx, user) => {
    try {
      const { id } = await ctx.params;
      
      const setting = await prisma.settingTunjanganTransport.findUnique({ where: { id } });
      if (setting?.isActive) {
        return errorResponse('Tidak bisa menghapus pengaturan yang sedang aktif', 400);
      }

      await prisma.settingTunjanganTransport.delete({ where: { id } });

      await createLog({
        userId: user.userId,
        username: user.username,
        modul: ModulLog.SETTING_TUNJANGAN,
        aksi: AksiLog.DELETE,
        deskripsi: `Menghapus setting tunjangan: ${setting?.baseFare}`,
      });

      return successResponse('Pengaturan berhasil dihapus');
    } catch (error: any) {
      return errorResponse(error.message, 500);
    }
  },
  'ADMIN_HRD'
);
