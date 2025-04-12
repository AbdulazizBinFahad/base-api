import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.BASE_URL || 'http://localhost';
const PORT = process.env.PORT || 5000;
const COMPANY_NAME = process.env.COMPANY_NAME || 'Your Company';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // Set to true if using port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends a verification email to the user.
 * @param to - Recipient email address
 * @param verificationCode - Unique verification code
 */
export const sendVerificationEmail = async (to: string, verificationCode: string): Promise<void> => {
  const verificationLink = `${BASE_URL}:${PORT}/api/auth/verify-email/${verificationCode}`;

  const mailOptions = {
    from: `"${COMPANY_NAME}" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Verify Your Email',
    html: `
      <p>Welcome to ${COMPANY_NAME}!</p>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationLink}">${verificationLink}</a>
      <p>If you did not request this, you can safely ignore this email.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};