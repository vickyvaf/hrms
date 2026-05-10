import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { validateCaptcha } from '@/lib/captcha';
import { generateOtp, createOtpSession } from '@/lib/otp';
import { sendOtpEmail } from '@/lib/mailer';
import { signToken } from '@/lib/jwt';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    const { identifier, password, captchaAnswer, sessionKey } = await req.json();

    // 1. Validate Captcha
    const isCaptchaValid = await validateCaptcha(sessionKey, captchaAnswer);
    if (!isCaptchaValid) {
      return errorResponse('Invalid or expired captcha', 400);
    }

    // 2. Find User (username, email, or nomorHp)
    console.log('Finding user with identifier:', identifier);
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: identifier },
          { email: identifier },
          { nomorHp: identifier },
        ],
      },
      include: { pegawai: true },
    });

    if (!user || !user.isActive) {
      return errorResponse('Invalid credentials or inactive account', 401);
    }

    // 3. Validate Password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isPasswordValid);
    if (!isPasswordValid) {
      return errorResponse('Invalid credentials', 401);
    }

    // 4. Generate & Send OTP
    const otp = generateOtp();
    console.log(`Generated OTP for ${user.email}: ${otp}`);
    await createOtpSession(user.id, otp);
    
    try {
      console.log(`Attempting to send email to ${user.email}...`);
      await sendOtpEmail(user.email, otp);
      console.log('Email sent successfully');
    } catch (err) {
      console.error('Email send failed:', err);
      // In production, we might want to fail here. 
      // For dev/testing, we can return the OTP in the response if needed, 
      // but here we follow the PRD.
    }

    // 5. Generate Temp Token (short-lived)
    const tempToken = signToken({ userId: user.id, isTemp: true }, '5m');

    return successResponse('OTP sent to your email', { tempToken });
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('An error occurred during login', 500);
  }
}
