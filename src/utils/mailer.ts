import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.BASE_URL || 'http://localhost';
const PORT = parseInt(process.env.PORT || '5000', 10);
const COMPANY_NAME = process.env.COMPANY_NAME || 'Your Company';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
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
  const link = `${BASE_URL}:${PORT}/api/auth/verify-email/${verificationCode}`;

  const mailOptions = {
    from: `"${COMPANY_NAME}" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Verify Your Email',
    html: `
      <p>Welcome to ${COMPANY_NAME}!</p>
      <p>Please click the link below to verify your email address:</p>
      <a href="${link}">${link}</a>
      <p>If you did not request this, you can safely ignore this email.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Sends a password reset email to the user.
 * @param to - Recipient email address
 * @param resetCode - Unique verification code
 */
export const sendPasswordResetEmail = async (to: string, resetCode: string): Promise<void> => {
  const link = `${BASE_URL}:${PORT}/reset-password?code=${resetCode}`;

  const mailOptions = {
    from: `"${COMPANY_NAME} Support" <${process.env.RESET_EMAIL_USER || process.env.EMAIL_USER}>`,
    to,
    subject: 'Reset Your Password',
    html: `
      <p>You requested to reset your password for ${COMPANY_NAME}.</p>
      <p>Click the link below to continue:</p>
      <a href="${link}">${link}</a>
      <p>If you didn't request this, you can ignore this message.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};