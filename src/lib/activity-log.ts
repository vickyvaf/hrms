import prisma from './prisma';
import { ModulLog, AksiLog } from '@prisma/client';

export const createLog = async ({
  userId,
  username,
  modul,
  aksi,
  deskripsi,
  ipAddress,
  userAgent,
}: {
  userId?: string;
  username: string;
  modul: ModulLog;
  aksi: AksiLog;
  deskripsi: string;
  ipAddress?: string;
  userAgent?: string;
}) => {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        username,
        modul,
        aksi,
        deskripsi,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.error('Failed to create activity log:', error);
  }
};
