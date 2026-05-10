import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './jwt';
import prisma from './prisma';
import { Role } from '@prisma/client';
import { errorResponse } from './api-response';

export type AuthenticatedHandler = (
  req: NextRequest,
  ctx: any,
  user: { userId: string; role: Role; username: string }
) => Promise<NextResponse>;

export const withAuth = (
  handler: AuthenticatedHandler,
  ...allowedRoles: Role[]
) => {
  return async (req: NextRequest, ctx: any) => {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse('Unauthorized', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || decoded.isTemp) {
      return errorResponse('Unauthorized', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { pegawai: true },
    });

    if (!user || !user.isActive) {
      return errorResponse('User account is inactive or not found', 403);
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return errorResponse('Forbidden', 403);
    }

    return handler(req, ctx, {
      userId: user.id,
      role: user.role,
      username: user.username,
    });
  };
};
