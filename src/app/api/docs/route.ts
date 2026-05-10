import { createSwaggerSpec } from 'next-swagger-doc';
import { NextResponse } from 'next/server';

export async function GET() {
  const spec = createSwaggerSpec({
    apiFolder: 'src/app/api', // define api folder under app dir
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'HRMS API Docs',
        version: '1.0',
      },
      tags: [
        { name: 'Auth', description: 'Authentication endpoints' },
        { name: 'Dashboard', description: 'Dashboard statistics and data' },
        { name: 'Pegawai', description: 'Employee management' },
        { name: 'Presensi', description: 'Attendance management' },
        { name: 'Tunjangan', description: 'Transport allowance management' },
        { name: 'Users', description: 'User management' },
        { name: 'Wilayah', description: 'Regional data' },
        { name: 'Logs', description: 'Activity logs' },
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [
        {
          BearerAuth: [],
        },
      ],
    },
  });

  return NextResponse.json(spec);
}
