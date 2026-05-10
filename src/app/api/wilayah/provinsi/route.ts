import prisma from '@/lib/prisma';
import { successResponse } from '@/lib/api-response';

/**
 * @swagger
 * /api/wilayah/provinsi:
 *   get:
 *     summary: Get all provinces
 *     tags: [Wilayah]
 *     responses:
 *       200:
 *         description: Provinsi fetched successfully
 */
export async function GET() {
  const data = await prisma.provinsi.findMany({ orderBy: { nama: 'asc' } });
  return successResponse('Provinsi fetched', data);
}
