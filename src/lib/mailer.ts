import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOtpEmail = async (email: string, otp: string) => {
  console.log('Using transporter with host:', process.env.EMAIL_HOST);
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"HRMS System" <noreply@hrms.com>',
    to: email,
    subject: 'Your HRMS Login OTP',
    text: `Your OTP for login is: ${otp}. It will expire in 60 seconds.`,
    html: `<p>Your OTP for login is: <b>${otp}</b>. It will expire in 60 seconds.</p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Nodemailer sendMail info:', info);
    return info;
  } catch (error) {
    console.error('Nodemailer sendMail error details:', error);
    throw error;
  }
};
