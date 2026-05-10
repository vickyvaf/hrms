import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { createLog } from '@/lib/activity-log';
import { ModulLog, AksiLog, JabatanType, JenisPegawai, DepartemenType, GenderType, StatusKawin } from '@prisma/client';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const GET = withAuth(
  async (req, ctx, user) => {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const jabatan = (searchParams.get('jabatan')?.split(',').filter(Boolean) || []) as JabatanType[];
    const jenis = (searchParams.get('jenis')?.split(',').filter(Boolean) || []) as JenisPegawai[];
    const masaKerjaOp = searchParams.get('masaKerjaOp') || '>';
    const masaKerjaVal = parseInt(searchParams.get('masaKerjaVal') || '0');
    const withoutUser = searchParams.get('withoutUser') === 'true';

    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
      AND: [],
    };

    if (search) {
      where.AND.push({
        OR: [
          { nama: { contains: search, mode: 'insensitive' } },
          { nip: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    if (jabatan.length > 0) {
      where.AND.push({ jabatan: { in: jabatan } });
    }

    if (jenis.length > 0) {
      where.AND.push({ jenisPegawai: { in: jenis } });
    }

    // Masa Kerja filter: this usually requires calculating from tanggalMasuk
    // For simplicity in SQL, we can calculate the date threshold
    if (masaKerjaVal > 0) {
      const thresholdDate = new Date();
      thresholdDate.setFullYear(thresholdDate.getFullYear() - masaKerjaVal);
      
      if (masaKerjaOp === '>') {
        where.AND.push({ tanggalMasuk: { lt: thresholdDate } });
      } else if (masaKerjaOp === '<') {
        where.AND.push({ tanggalMasuk: { gt: thresholdDate } });
      } else {
        // approx equal within the year
        const startOfYear = new Date(thresholdDate);
        startOfYear.setMonth(0, 1);
        const endOfYear = new Date(thresholdDate);
        endOfYear.setMonth(11, 31);
        where.AND.push({ tanggalMasuk: { gte: startOfYear, lte: endOfYear } });
      }
    }

    if (withoutUser) {
      where.AND.push({ users: { none: {} } });
    }

    const [data, total] = await Promise.all([
      prisma.pegawai.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.pegawai.count({ where }),
    ]);

    // Calculate masa kerja for frontend
    const dataWithMasaKerja = data.map(p => {
      const diff = Date.now() - new Date(p.tanggalMasuk).getTime();
      const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
      return { ...p, masaKerja: years };
    });

    return successResponse('Pegawai list fetched', dataWithMasaKerja, { page, limit, total });
  },
  'ADMIN_HRD', 'MANAGER_HRD'
);

export const POST = withAuth(
  async (req, ctx, user) => {
    try {
      const formData = await req.formData();
      const foto = formData.get('foto') as File | null;
      
      let fotoUrl = '';
      if (foto && foto.size > 0) {
        const bytes = await foto.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `${uuidv4()}-${foto.name}`;
        const uploadPath = path.join(process.cwd(), 'public/uploads', fileName);
        await writeFile(uploadPath, buffer);
        fotoUrl = `/uploads/${fileName}`;
      }

      const pegawaiData = {
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
        tempatLahirId: parseInt(formData.get('tempatLahirId') as string || '0'),
        tanggalMasuk: new Date(formData.get('tanggalMasuk') as string),
        provinsi: formData.get('provinsi') as string,
        kabupatenNama: formData.get('kabupatenNama') as string,
        kecamatanId: parseInt(formData.get('kecamatanId') as string || '0'),
        kalurahanId: parseInt(formData.get('kalurahanId') as string || '0'),
        alamatDetail: formData.get('alamatDetail') as string,
        latitude: formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : null,
        longitude: formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : null,
      };

      const newPegawai = await prisma.pegawai.create({
        data: {
          ...pegawaiData,
          pendidikan: {
            create: JSON.parse(formData.get('pendidikan') as string || '[]'),
          }
        },
      });

      await createLog({
        userId: user.userId,
        username: user.username,
        modul: ModulLog.PEGAWAI,
        aksi: AksiLog.CREATE,
        deskripsi: `Membuat pegawai baru: ${newPegawai.nama} (${newPegawai.nip})`,
      });

      return successResponse('Pegawai created successfully', newPegawai);
    } catch (error: any) {
      console.error('Create pegawai error:', error);
      return errorResponse(error.message || 'Failed to create pegawai', 500);
    }
  },
  'ADMIN_HRD'
);
