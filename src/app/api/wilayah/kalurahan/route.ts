import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse } from '@/lib/api-response';

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
