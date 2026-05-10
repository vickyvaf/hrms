import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, signToken } from '@/lib/jwt';
import { verifyOtp } from '@/lib/otp';
import { successResponse, errorResponse } from '@/lib/api-response';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { tempToken, otpCode, rememberMe } = await req.json();

    // 1. Verify Temp Token
    const decoded = verifyToken(tempToken);
    if (!decoded || !decoded.isTemp) {
      return errorResponse('Invalid or expired temporary token', 401);
    }

    // 2. Verify OTP
    const isOtpValid = await verifyOtp(decoded.userId, otpCode);
    if (!isOtpValid) {
      return errorResponse('Invalid or expired OTP', 400);
    }

    // 3. Get User for Payload
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    // 4. Generate Final Token
    const expiresIn = rememberMe ? '30d' : '8h';
    const finalToken = signToken({ userId: user.id, role: user.role }, expiresIn);

    // 5. Create Log
    const { createLog } = await import('@/lib/activity-log');
    await createLog({
      userId: user.id,
      username: user.username,
      modul: 'LOGIN',
      aksi: 'LOGIN',
      deskripsi: `User ${user.username} berhasil login`,
    });

    return successResponse('Login successful', { token: finalToken, role: user.role });
  } catch (error) {
    console.error('OTP verification error:', error);
    return errorResponse('An error occurred during verification', 500);
  }
}
