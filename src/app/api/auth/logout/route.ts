import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { successResponse } from '@/lib/api-response';
import { createLog } from '@/lib/activity-log';
import { ModulLog, AksiLog } from '@prisma/client';

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
export const POST = withAuth(
  async (req, ctx, user) => {
    await createLog({
      userId: user.userId,
      username: user.username,
      modul: ModulLog.LOGIN,
      aksi: AksiLog.LOGOUT,
      deskripsi: `User ${user.username} logged out`,
    });

    return successResponse('Logged out successfully');
  },
  'SUPERADMIN', 'MANAGER_HRD', 'ADMIN_HRD'
);
