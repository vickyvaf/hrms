import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import prisma from '@/lib/prisma';
import { successResponse } from '@/lib/api-response';

/**
 * @swagger
 * /api/tunjangan:
 *   get:
 *     summary: Get list of transport allowance records
 *     tags: [Tunjangan]
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
 *         name: bulan
 *         schema:
 *           type: integer
 *       - in: query
 *         name: tahun
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tunjangan fetched successfully
 */
export const GET = withAuth(
  async (req, ctx, user) => {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const bulan = searchParams.get('bulan');
    const tahun = searchParams.get('tahun');

    const skip = (page - 1) * limit;

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

    const [data, total] = await Promise.all([
      prisma.tunjanganTransport.findMany({
        where,
        skip,
        take: limit,
        include: {
          pegawai: {
            select: {
              nama: true,
              nip: true,
            },
          },
        },
        orderBy: [{ tahun: 'desc' }, { bulan: 'desc' }],
      }),
      prisma.tunjanganTransport.count({ where }),
    ]);

    return successResponse('Tunjangan fetched successfully', data, { page, limit, total });
  },
  'SUPERADMIN', 'MANAGER_HRD', 'ADMIN_HRD'
);
