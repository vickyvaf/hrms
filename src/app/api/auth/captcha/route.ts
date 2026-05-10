import { NextResponse } from 'next/server';
import { generateCaptcha } from '@/lib/captcha';
import { successResponse, errorResponse } from '@/lib/api-response';

/**
 * @swagger
 * /api/auth/captcha:
 *   get:
 *     summary: Generate a new captcha
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Captcha generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     image:
 *                       type: string
 *                       description: Base64 image string
 *                     sessionKey:
 *                       type: string
 *                       description: Session key for captcha validation
 */
export async function GET() {
  try {
    const { image, sessionKey } = await generateCaptcha();
    return successResponse('Captcha generated successfully', { image, sessionKey });
  } catch (error) {
    console.error('Captcha error:', error);
    return errorResponse('Failed to generate captcha', 500);
  }
}
