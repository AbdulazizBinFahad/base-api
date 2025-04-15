import { Request, Response } from 'express';
import crypto from 'crypto';
import User from '../models/User';
import { generateToken } from '../utils/jwt';
import { sendPasswordResetEmail, sendVerificationEmail } from '../utils/mailer';

/**
 * @desc Register new user
 * @route POST /api/auth/register
 * @access Public
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { name }] });

    if (existingUser) {
      res.status(400).json({ message: 'Email or name already in use.' });
      return;
    }

    const verificationCode = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      name,
      email,
      password,
      verificationCode,
    });

    await sendVerificationEmail(user.email, verificationCode);

    res.status(201).json({
      message: 'Account created. Please check your email to verify your account.',
    });
  } catch (err: any) {
    console.error('❌ Register error:', err.message);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

/**
 * @desc Verify email using the verification code
 * @route GET /api/auth/verify-email/:code
 * @access Public
 */
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.params;

    const user = await User.findOne({ verificationCode: code });

    if (!user) {
      res.status(400).json({ message: 'Invalid or expired verification code.' });
      return;
    }

    user.isVerified = true;
    user.verificationCode = null;
    await user.save();

    res.status(200).json({ message: 'Email successfully verified. You can now log in.' });
  } catch (err: any) {
    console.error('❌ Verification error:', err.message);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

/**
 * @desc Login user and return JWT token
 * @route POST /api/auth/login
 * @access Public
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    if (!user.isVerified) {
      res.status(403).json({ message: 'Please verify your email first.' });
      return;
    }

    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    res.status(200).json({ token });
  } catch (err: any) {
    console.error('❌ Login error:', err.message);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

/**
 * @desc Send password reset link to user's email
 * @route POST /api/auth/forgot-password
 * @access Public
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    const resetCode = crypto.randomBytes(32).toString('hex');
    user.verificationCode = resetCode;
    await user.save();

    await sendPasswordResetEmail(user.email, resetCode);

    res.status(200).json({ message: 'Reset link has been sent to your email.' });
  } catch (err: any) {
    console.error('❌ Forgot password error:', err.message);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

/**
 * @desc Reset password using the reset code
 * @route POST /api/auth/reset-password
 * @access Public
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, newPassword } = req.body;

    const user = await User.findOne({ verificationCode: code });
    if (!user) {
      res.status(400).json({ message: 'Invalid or expired reset code.' });
      return;
    }

    user.password = newPassword;
    user.verificationCode = null;
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (err: any) {
    console.error('❌ Reset password error:', err.message);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};