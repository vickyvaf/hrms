import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { createLog } from '@/lib/activity-log';
import { ModulLog, AksiLog } from '@prisma/client';

/**
 * @swagger
 * /api/tunjangan/setting:
 *   get:
 *     summary: Get all transport allowance settings
 *     tags: [Tunjangan]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Tunjangan settings fetched successfully
 *   post:
 *     summary: Create a new transport allowance setting
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
 *               - baseFare
 *             properties:
 *               baseFare:
 *                 type: number
 *               keterangan:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Setting created successfully
 */
export const GET = withAuth(
  async (req, ctx, user) => {
    const data = await prisma.settingTunjanganTransport.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return successResponse('Tunjangan settings fetched', data);
  },
  'SUPERADMIN', 'MANAGER_HRD', 'ADMIN_HRD'
);

export const POST = withAuth(
  async (req, ctx, user) => {
    const { baseFare, keterangan, isActive } = await req.json();

    if (isActive) {
      // Deactivate other settings
      await prisma.settingTunjanganTransport.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }

    const newSetting = await prisma.settingTunjanganTransport.create({
      data: { baseFare, keterangan, isActive },
    });

    await createLog({
      userId: user.userId,
      username: user.username,
      modul: ModulLog.SETTING_TUNJANGAN,
      aksi: AksiLog.CREATE,
      deskripsi: `Membuat setting tunjangan baru: ${baseFare}`,
    });

    return successResponse('Setting created', newSetting);
  },
  'SUPERADMIN', 'MANAGER_HRD', 'ADMIN_HRD'
);
