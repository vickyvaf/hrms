import { createCanvas } from 'canvas';
import prisma from './prisma';
import { v4 as uuidv4 } from 'uuid';

export const generateCaptcha = async () => {
  const width = 120;
  const height = 40;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#f3f4f6';
  ctx.fillRect(0, 0, width, height);

  // Random text
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let captchaText = '';
  for (let i = 0; i < 6; i++) {
    captchaText += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  // Draw text
  ctx.font = 'bold 24px sans-serif';
  ctx.fillStyle = '#1f2937';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillText(captchaText, width / 2, height / 2);

  // Add some noise (lines)
  ctx.strokeStyle = '#9ca3af';
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * width, Math.random() * height);
    ctx.lineTo(Math.random() * width, Math.random() * height);
    ctx.stroke();
  }

  const sessionKey = uuidv4();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await prisma.captchaSession.create({
    data: {
      sessionKey,
      answer: captchaText.toLowerCase(),
      expiresAt,
    },
  });

  return {
    image: canvas.toDataURL(),
    sessionKey,
  };
};

export const validateCaptcha = async (sessionKey: string, answer: string) => {
  const session = await prisma.captchaSession.findUnique({
    where: { sessionKey },
  });

  if (!session || session.isUsed || session.expiresAt < new Date()) {
    return false;
  }

  if (session.answer !== answer.toLowerCase()) {
    return false;
  }

  await prisma.captchaSession.update({
    where: { id: session.id },
    data: { isUsed: true },
  });

  return true;
};
