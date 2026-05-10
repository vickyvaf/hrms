import { generatePresensiTemplate } from '@/lib/excel-parser';
import { NextResponse } from 'next/server';

export async function GET() {
  const buffer = generatePresensiTemplate();
  
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="template_presensi.xlsx"',
    },
  });
}
