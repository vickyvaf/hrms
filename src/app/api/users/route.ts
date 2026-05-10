import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import bcrypt from 'bcrypt';
import { ModulLog, AksiLog } from '@prisma/client';

export const GET = withAuth(
  async (req, ctx, user) => {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role');

    const skip = (page - 1) * limit;

    const where: any = {
      AND: [],
    };

    if (search) {
      where.AND.push({
        OR: [
          { username: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { pegawai: { nama: { contains: search, mode: 'insensitive' } } },
        ],
      });
    }

    if (role) {
      where.AND.push({ role });
    }

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          pegawai: {
            select: {
              nama: true,
              nip: true,
              jabatan: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return successResponse('Users fetched successfully', data, { page, limit, total });
  },
  'SUPERADMIN', 'MANAGER_HRD', 'ADMIN_HRD'
);

export const POST = withAuth(
  async (req, ctx, user) => {
    try {
      const body = await req.json();
      const { pegawaiId, nama, username, email, nomorHp, password, role, isActive } = body;

      const { validatePassword } = await import('@/lib/password-validator');
      if (!validatePassword(password)) {
        return errorResponse('Password does not meet complexity requirements (min 8 char, uppercase, lowercase, special char, no space)', 400);
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await prisma.user.create({
        data: {
          pegawai: pegawaiId ? { connect: { id: pegawaiId } } : undefined,
          nama: nama || null,
          username,
          email,
          nomorHp,
          password: hashedPassword,
          role,
          isActive: isActive ?? true,
        },
        include: {
          pegawai: true,
        },
      });

      const { createLog } = await import('@/lib/activity-log');
      await createLog({
        userId: user.userId,
        username: user.username,
        modul: ModulLog.USER,
        aksi: AksiLog.CREATE,
        deskripsi: `Membuat user baru: ${username}`,
      });

      return successResponse('User created successfully', newUser);
    } catch (error: any) {
      if (error.code === 'P2002') {
        const target = error.meta?.target?.[0] || 'data';
        return errorResponse(`${target.charAt(0).toUpperCase() + target.slice(1)} sudah digunakan oleh user lain`, 400);
      }
      return errorResponse(error.message || 'Failed to create user', 400);
    }
  },
  'SUPERADMIN'
);
