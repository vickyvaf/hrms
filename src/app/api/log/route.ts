import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import prisma from '@/lib/prisma';
import { successResponse } from '@/lib/api-response';

/**
 * @swagger
 * /api/log:
 *   get:
 *     summary: Get activity logs
 *     tags: [Logs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: usernames
 *         schema:
 *           type: string
 *       - in: query
 *         name: moduls
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Activity logs fetched successfully
 */
export const GET = withAuth(
  async (req, ctx, user) => {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const usernames = searchParams.get('usernames')?.split(',').filter(Boolean);
    const moduls = searchParams.get('moduls')?.split(',').filter(Boolean);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const skip = (page - 1) * limit;

    const where: any = {
      AND: [],
    };

    if (search) {
      where.AND.push({
        deskripsi: { contains: search, mode: 'insensitive' },
      });
    }

    if (usernames && usernames.length > 0) {
      where.AND.push({ username: { in: usernames } });
    }

    if (moduls && moduls.length > 0) {
      where.AND.push({ modul: { in: moduls } });
    }

    if (startDate || endDate) {
      where.AND.push({
        createdAt: {
          ...(startDate ? { gte: new Date(startDate) } : {}),
          ...(endDate ? { lte: new Date(endDate) } : {}),
        },
      });
    }

    const [data, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.activityLog.count({ where }),
    ]);

    return successResponse('Activity logs fetched', data, { page, limit, total });
  },
  'SUPERADMIN', 'MANAGER_HRD', 'ADMIN_HRD'
);
