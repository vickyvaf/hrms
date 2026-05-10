import { NextResponse } from 'next/server';
import { generateCaptcha } from '@/lib/captcha';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET() {
  try {
    const { image, sessionKey } = await generateCaptcha();
    return successResponse('Captcha generated successfully', { image, sessionKey });
  } catch (error) {
    console.error('Captcha error:', error);
    return errorResponse('Failed to generate captcha', 500);
  }
}
