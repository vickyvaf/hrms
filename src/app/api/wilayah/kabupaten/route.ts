import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const provinsiId = searchParams.get('provinsiId');
  const search = searchParams.get('search');
  
  const data = await prisma.kabupaten.findMany({
    where: {
      AND: [
        provinsiId ? { provinsiId: parseInt(provinsiId) } : {},
        search ? { nama: { contains: search, mode: 'insensitive' } } : {},
      ]
    },
    orderBy: { nama: 'asc' },
    take: 50,
  });
  return successResponse('Kabupaten fetched', data);
}
