import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import prisma from '@/lib/prisma';
import { generatePegawaiPDF } from '@/lib/pdf-generator';
import { errorResponse } from '@/lib/api-response';
import { createLog } from '@/lib/activity-log';
import { ModulLog, AksiLog } from '@prisma/client';

export const GET = withAuth(
  async (req, { params }: any, user) => {
    try {
      const { id } = await params;

      const pegawai = await prisma.pegawai.findUnique({
        where: { id },
        include: { pendidikan: true },
      });

      if (!pegawai || pegawai.deletedAt) {
        return errorResponse('Pegawai not found', 404);
      }

      const pdfBuffer = await generatePegawaiPDF(pegawai);

      await createLog({
        userId: user.userId,
        username: user.username,
        modul: ModulLog.PEGAWAI,
        aksi: AksiLog.DOWNLOAD,
        deskripsi: `Download PDF pegawai: ${pegawai.nama} (${pegawai.nip})`,
      });

      return new NextResponse(new Uint8Array(pdfBuffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="pegawai-${pegawai.nip}.pdf"`,
        },
      });
    } catch (error: any) {
      console.error('Download PDF error:', error);
      return errorResponse(`Failed to generate PDF: ${error.message}`, 500);
    }
  },
  'MANAGER_HRD', 'ADMIN_HRD'
);
