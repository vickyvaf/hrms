import prisma from './prisma';

export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const createOtpSession = async (userId: string, otpCode: string) => {
  const expiresAt = new Date(Date.now() + 60 * 1000); // 60 seconds as per PRD
  
  return await prisma.otpSession.create({
    data: {
      userId,
      otpCode,
      expiresAt,
    },
  });
};

export const verifyOtp = async (userId: string, otpCode: string) => {
  const session = await prisma.otpSession.findFirst({
    where: {
      userId,
      otpCode,
      isUsed: false,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!session) return false;

  await prisma.otpSession.update({
    where: { id: session.id },
    data: { isUsed: true },
  });

  return true;
};
