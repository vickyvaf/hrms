import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse } from '@/lib/api-response';

/**
 * @swagger
 * /api/wilayah/kalurahan:
 *   get:
 *     summary: Get sub-districts/villages
 *     tags: [Wilayah]
 *     parameters:
 *       - in: query
 *         name: kecamatanId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Kalurahan fetched successfully
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const kecamatanId = searchParams.get('kecamatanId');
  
  if (!kecamatanId) {
    return successResponse('Kalurahan empty', []);
  }

  const data = await prisma.kalurahan.findMany({
    where: { kecamatanId },
    orderBy: { nama: 'asc' },
  });
  return successResponse('Kalurahan fetched', data);
}
