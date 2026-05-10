import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { createLog } from '@/lib/activity-log';
import { ModulLog, AksiLog, JabatanType, DepartemenType, JenisPegawai, GenderType, StatusKawin } from '@prisma/client';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * @swagger
 * /api/pegawai/{id}:
 *   get:
 *     summary: Get employee detail
 *     tags: [Pegawai]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pegawai detail fetched
 *       404:
 *         description: Pegawai not found
 *   put:
 *     summary: Update employee
 *     tags: [Pegawai]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nama:
 *                 type: string
 *               email:
 *                 type: string
 *               foto:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Pegawai updated successfully
 *   delete:
 *     summary: Delete employee (soft delete)
 *     tags: [Pegawai]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pegawai deleted successfully
 */
export const GET = withAuth(
  async (req, ctx, user) => {
    const { id } = await ctx.params;

    const data = await prisma.pegawai.findUnique({
      where: { id },
      include: { pendidikan: true },
    });

    if (!data || data.deletedAt) {
      return errorResponse('Pegawai not found', 404);
    }

    // Fetch regional names for labels
    const [tempatLahir, kecamatan, kalurahan] = await Promise.all([
      prisma.kabupaten.findUnique({ where: { id: data.tempatLahirId } }),
      prisma.kecamatan.findUnique({ where: { id: data.kecamatanId } }),
      prisma.kalurahan.findUnique({ where: { id: data.kalurahanId } }),
    ]);

    const enrichedData = {
      ...data,
      tempatLahirNama: tempatLahir?.nama || '',
      kecamatanNama: kecamatan?.nama || '',
      kalurahanNama: kalurahan?.nama || '',
      // Object formats for Detail page
      tempatLahir: tempatLahir ? { nama: tempatLahir.nama } : null,
      kecamatan: kecamatan ? { nama: kecamatan.nama } : null,
      kalurahan: kalurahan ? { nama: kalurahan.nama } : null,
    };

    return successResponse('Pegawai detail fetched', enrichedData);
  },
  'ADMIN_HRD', 'MANAGER_HRD'
);

export const PUT = withAuth(
  async (req, ctx, user) => {
    try {
      const { id } = await ctx.params;
      const formData = await req.formData();
      const foto = formData.get('foto') as File | null;
      
      const existing = await prisma.pegawai.findUnique({ where: { id } });
      if (!existing) return errorResponse('Pegawai not found', 404);

      let fotoUrl = existing.fotoUrl;
      if (foto && foto.size > 0) {
        const bytes = await foto.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `${uuidv4()}-${foto.name}`;
        const uploadPath = path.join(process.cwd(), 'public/uploads', fileName);
        await writeFile(uploadPath, buffer);
        fotoUrl = `/uploads/${fileName}`;
      }

      const updateData: any = {
        nip: formData.get('nip') as string,
        nama: formData.get('nama') as string,
        email: formData.get('email') as string,
        nomorHp: formData.get('nomorHp') as string,
        fotoUrl,
        jabatan: formData.get('jabatan') as JabatanType,
        departemen: formData.get('departemen') as DepartemenType,
        jenisPegawai: formData.get('jenisPegawai') as JenisPegawai,
        gender: formData.get('gender') as GenderType,
        statusKawin: formData.get('statusKawin') as StatusKawin,
        jumlahAnak: parseInt(formData.get('jumlahAnak') as string || '0'),
        tanggalLahir: new Date(formData.get('tanggalLahir') as string),
        tempatLahirId: formData.get('tempatLahirId') as string || '',
        tanggalMasuk: new Date(formData.get('tanggalMasuk') as string),
        provinsi: formData.get('provinsi') as string,
        kabupatenNama: formData.get('kabupatenNama') as string,
        kecamatanId: formData.get('kecamatanId') as string || '',
        kalurahanId: formData.get('kalurahanId') as string || '',
        alamatDetail: formData.get('alamatDetail') as string,
        latitude: formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : null,
        longitude: formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : null,
        isActive: formData.get('isActive') === 'true',
      };

      const updated = await prisma.pegawai.update({
        where: { id },
        data: {
          ...updateData,
          pendidikan: {
            deleteMany: {},
            create: JSON.parse(formData.get('pendidikan') as string || '[]'),
          }
        },
      });

      await createLog({
        userId: user.userId,
        username: user.username,
        modul: ModulLog.PEGAWAI,
        aksi: AksiLog.UPDATE,
        deskripsi: `Memperbarui data pegawai: ${updated.nama} (${updated.nip})`,
      });

      return successResponse('Pegawai updated successfully', updated);
    } catch (error: any) {
      return errorResponse(error.message || 'Failed to update pegawai', 500);
    }
  },
  'ADMIN_HRD'
);

export const DELETE = withAuth(
  async (req, ctx, user) => {
    const { id } = await ctx.params;

    // Check if this pegawai belongs to a SUPERADMIN
    const pegawaiWithUser = await prisma.pegawai.findUnique({
      where: { id },
      include: { users: true }
    });

    if (pegawaiWithUser?.users.some(u => u.role === 'SUPERADMIN')) {
      return errorResponse('Cannot delete pegawai associated with SUPERADMIN', 403);
    }

    const deleted = await prisma.pegawai.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await createLog({
      userId: user.userId,
      username: user.username,
      modul: ModulLog.PEGAWAI,
      aksi: AksiLog.DELETE,
      deskripsi: `Menghapus (soft delete) pegawai: ${deleted.nama} (${deleted.nip})`,
    });

    return successResponse('Pegawai deleted successfully');
  },
  'ADMIN_HRD'
);
