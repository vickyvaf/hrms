import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse } from '@/lib/api-response';

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
