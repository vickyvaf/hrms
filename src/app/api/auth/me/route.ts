import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User data fetched
 *       401:
 *         description: Unauthorized
 */
export const GET = withAuth(async (req, ctx, user) => {
  const userData = await prisma.user.findUnique({
    where: { id: user.userId },
    include: {
      pegawai: {
        select: {
          nama: true,
          email: true,
          fotoUrl: true,
        },
      },
    },
  });

  if (!userData) {
    return errorResponse('User not found', 404);
  }

  return successResponse('User data fetched', {
    id: userData.id,
    username: userData.username,
    email: userData.email,
    role: userData.role,
    nama: userData.pegawai?.nama || 'Unknown',
    fotoUrl: userData.pegawai?.fotoUrl || null,
  });
});
