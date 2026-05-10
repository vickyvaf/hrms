import { generatePresensiTemplate } from '@/lib/excel-parser';
import { NextResponse } from 'next/server';

/**
 * @swagger
 * /api/presensi/template:
 *   get:
 *     summary: Download attendance import template
 *     tags: [Presensi]
 *     responses:
 *       200:
 *         description: Excel template file
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */
export async function GET() {
  const buffer = generatePresensiTemplate();
  
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="template_presensi.xlsx"',
    },
  });
}
