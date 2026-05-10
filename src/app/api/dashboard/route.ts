import { withAuth } from '@/lib/with-auth';
import prisma from '@/lib/prisma';
import { successResponse } from '@/lib/api-response';
import { JenisPegawai, GenderType } from '@prisma/client';

export const GET = withAuth(
  async (req, ctx, user) => {
    // All authorized roles (SUPERADMIN, MANAGER_HRD, ADMIN_HRD) can see dashboard stats
    // as per previous request for universal role access.

    // MANAGER_HRD logic
    // 1. Stats
    const total = await prisma.pegawai.count({ where: { deletedAt: null } });
    const kontrak = await prisma.pegawai.count({ where: { jenisPegawai: JenisPegawai.KONTRAK, deletedAt: null } });
    const tetap = await prisma.pegawai.count({ where: { jenisPegawai: JenisPegawai.TETAP, deletedAt: null } });
    const magang = await prisma.pegawai.count({ where: { jenisPegawai: JenisPegawai.MAGANG, deletedAt: null } });
    
    const pria = await prisma.pegawai.count({ where: { gender: GenderType.PRIA, deletedAt: null } });
    const wanita = await prisma.pegawai.count({ where: { gender: GenderType.WANITA, deletedAt: null } });

    // 2. Recent Pegawai
    const recentPegawai = await prisma.pegawai.findMany({
      where: { deletedAt: null },
      orderBy: { tanggalMasuk: 'desc' },
      take: 5,
      select: {
        id: true,
        nama: true,
        jabatan: true,
        tanggalMasuk: true,
      },
    });

    // 3. Map Data
    const mapData = await prisma.pegawai.findMany({
      where: { 
        deletedAt: null,
        latitude: { not: null },
        longitude: { not: null },
      },
      select: {
        id: true,
        nama: true,
        latitude: true,
        longitude: true,
      },
    });

    // Transform Decimal to number for frontend
    const mapDataFormatted = mapData.map(p => ({
      id: p.id,
      nama: p.nama,
      lat: Number(p.latitude),
      lng: Number(p.longitude),
    }));

    return successResponse('Dashboard data fetched', {
      welcome: `Selamat Datang ${user.username} - ${user.role}`,
      stats: {
        total, kontrak, tetap, magang, pria, wanita
      },
      recentPegawai,
      mapData: mapDataFormatted,
    });
  },
  'SUPERADMIN', 'MANAGER_HRD', 'ADMIN_HRD'
);
