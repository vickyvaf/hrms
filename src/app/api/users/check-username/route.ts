import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import prisma from '@/lib/prisma';
import { successResponse } from '@/lib/api-response';

/**
 * @swagger
 * /api/users/check-username:
 *   get:
 *     summary: Check if a username is available
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: excludeId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Availability checked successfully
 */
export const GET = withAuth(
  async (req) => {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');
    const excludeId = searchParams.get('excludeId');

    if (!username) {
      return successResponse('Username is required', { available: false });
    }

    const existing = await prisma.user.findFirst({
      where: {
        username: { equals: username, mode: 'insensitive' },
        NOT: excludeId ? { id: excludeId } : undefined,
      },
    });

    return successResponse('Availability checked', {
      available: !existing,
    });
  },
  'SUPERADMIN', 'MANAGER_HRD', 'ADMIN_HRD'
);
