import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse } from '@/lib/api-response';

/**
 * @swagger
 * /api/wilayah/kecamatan:
 *   get:
 *     summary: Get districts
 *     tags: [Wilayah]
 *     parameters:
 *       - in: query
 *         name: kabupatenId
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Kecamatan fetched successfully
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const kabupatenId = searchParams.get('kabupatenId');
  const search = searchParams.get('search');
  
  const data = await prisma.kecamatan.findMany({
    where: {
      AND: [
        kabupatenId ? { kabupatenId } : {},
        search ? { nama: { contains: search, mode: 'insensitive' } } : {},
      ]
    },
    include: { kabupaten: true },
    orderBy: { nama: 'asc' },
    take: 50,
  });

  const formatted = data.map(k => ({
    id: k.id,
    nama: k.nama,
    kabupatenNama: k.kabupaten.nama,
    provinsiId: k.kabupaten.provinsiId,
    label: `${k.nama} - ${k.kabupaten.nama}`
  }));

  return successResponse('Kecamatan fetched', formatted);
}
