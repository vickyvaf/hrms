import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse } from '@/lib/api-response';

/**
 * @swagger
 * /api/wilayah/kabupaten:
 *   get:
 *     summary: Get regencies/cities
 *     tags: [Wilayah]
 *     parameters:
 *       - in: query
 *         name: provinsiId
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Kabupaten fetched successfully
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const provinsiId = searchParams.get('provinsiId');
  const search = searchParams.get('search');
  
  const data = await prisma.kabupaten.findMany({
    where: {
      AND: [
        provinsiId ? { provinsiId } : {},
        search ? { nama: { contains: search, mode: 'insensitive' } } : {},
      ]
    },
    orderBy: { nama: 'asc' },
    take: 50,
  });
  return successResponse('Kabupaten fetched', data);
}
