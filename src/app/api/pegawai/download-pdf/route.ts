import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import prisma from '@/lib/prisma';
import { generatePegawaiListPDF } from '@/lib/pdf-generator';
import { errorResponse } from '@/lib/api-response';
import { createLog } from '@/lib/activity-log';
import { ModulLog, AksiLog } from '@prisma/client';

export const GET = withAuth(
  async (req, ctx, user) => {
    try {
      const data = await prisma.pegawai.findMany({
        where: { deletedAt: null },
        orderBy: { nama: 'asc' },
      });

      const dataWithMasaKerja = data.map(p => {
        const diff = Date.now() - new Date(p.tanggalMasuk).getTime();
        const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
        return { ...p, masaKerja: years };
      });

      const pdfBuffer = await generatePegawaiListPDF(dataWithMasaKerja);

      await createLog({
        userId: user.userId,
        username: user.username,
        modul: ModulLog.PEGAWAI,
        aksi: AksiLog.DOWNLOAD,
        deskripsi: `Download PDF daftar semua pegawai`,
      });

      return new NextResponse(new Uint8Array(pdfBuffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="daftar-pegawai.pdf"`,
        },
      });
    } catch (error: any) {
      console.error('Download bulk PDF error:', error);
      return errorResponse(`Failed to generate PDF list: ${error.message}`, 500);
    }
  },
  'MANAGER_HRD', 'ADMIN_HRD'
);
