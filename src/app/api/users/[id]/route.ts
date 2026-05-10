import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import bcrypt from 'bcrypt';
import { ModulLog, AksiLog } from '@prisma/client';

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user detail
 *     tags: [Users]
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
 *         description: User fetched successfully
 *   put:
 *     summary: Update user
 *     tags: [Users]
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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
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
 *         description: User deleted successfully
 */
export const GET = withAuth(
  async (req, { params }: any) => {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        pegawai: {
          select: {
            nama: true,
            nip: true,
            email: true,
            nomorHp: true,
          },
        },
      },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    return successResponse('User fetched successfully', user);
  },
  'SUPERADMIN', 'MANAGER_HRD', 'ADMIN_HRD'
);

export const PUT = withAuth(
  async (req, { params }: any, currentUser) => {
    try {
      const { id } = await params;
      const body = await req.json();
      const { username, role, isActive, password, email, nomorHp, nama } = body;

      // Access Control: Only SUPERADMIN or the user themselves
      if (currentUser.role !== 'SUPERADMIN' && currentUser.userId !== id) {
        return errorResponse('Forbidden', 403);
      }

      const existingUser = await prisma.user.findUnique({ where: { id } });
      if (!existingUser) {
        return errorResponse('User not found', 404);
      }

      // If not SUPERADMIN, cannot change role or isActive
      const data: any = {
        username,
        email,
        nomorHp,
        nama,
      };

      if (currentUser.role === 'SUPERADMIN') {
        data.role = role;
        data.isActive = isActive;
      }

      if (password) {
        const { validatePassword } = await import('@/lib/password-validator');
        if (!validatePassword(password)) {
          return errorResponse('Password does not meet complexity requirements', 400);
        }
        data.password = await bcrypt.hash(password, 10);
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data,
        include: {
          pegawai: true,
        },
      });

      const { createLog } = await import('@/lib/activity-log');
      await createLog({
        userId: currentUser.userId,
        username: currentUser.username,
        modul: ModulLog.USER,
        aksi: AksiLog.UPDATE,
        deskripsi: `Memperbarui user: ${username}`,
      });

      return successResponse('User updated successfully', updatedUser);
    } catch (error: any) {
      if (error.code === 'P2002') {
        const target = error.meta?.target?.[0] || 'data';
        return errorResponse(`${target.charAt(0).toUpperCase() + target.slice(1)} sudah digunakan oleh user lain`, 400);
      }
      return errorResponse(error.message || 'Failed to update user', 400);
    }
  },
  'SUPERADMIN', 'MANAGER_HRD', 'ADMIN_HRD'
);

export const DELETE = withAuth(
  async (req, { params }: any, currentUser) => {
    try {
      const { id } = await params;

      // Access Control: Only SUPERADMIN can delete, and cannot delete self
      if (currentUser.userId === id) {
        return errorResponse('Cannot delete your own account', 403);
      }

      const userToDelete = await prisma.user.findUnique({ where: { id } });
      
      if (!userToDelete) {
        return errorResponse('User not found', 404);
      }

      await prisma.user.delete({
        where: { id },
      });

      const { createLog } = await import('@/lib/activity-log');
      await createLog({
        userId: currentUser.userId,
        username: currentUser.username,
        modul: ModulLog.USER,
        aksi: AksiLog.DELETE,
        deskripsi: `Menghapus user: ${userToDelete.username}`,
      });

      return successResponse('User deleted successfully');
    } catch (error: any) {
      return errorResponse(error.message || 'Failed to delete user', 400);
    }
  },
  'SUPERADMIN', 'MANAGER_HRD', 'ADMIN_HRD'
);
