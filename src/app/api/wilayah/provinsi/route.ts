import prisma from '@/lib/prisma';
import { successResponse } from '@/lib/api-response';

export async function GET() {
  const data = await prisma.provinsi.findMany({ orderBy: { nama: 'asc' } });
  return successResponse('Provinsi fetched', data);
}
