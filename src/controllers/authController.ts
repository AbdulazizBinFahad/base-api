import { Request, Response } from 'express';
import crypto from 'crypto';
import User from '../models/User';
import { generateToken } from '../utils/jwt';
import { sendVerificationEmail } from '../utils/mailer';

// Register
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: 'All fields are required.' });
      return;
    }

    // name: English letters, numbers, underscores, and hyphens only, 4-20 chars
    if (!/^[a-zA-Z0-9_-]{4,20}$/.test(name)) {
      res.status(400).json({ message: 'Name must be 4-20 characters long and can include letters, numbers, underscores, and hyphens only.' });
      return;
    }

    // email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ message: 'Invalid email address.' });
      return;
    }

    // password: min 8 chars, uppercase, lowercase, number, special char
    if (
      password.length < 8 ||
      !/[a-z]/.test(password) ||
      !/[A-Z]/.test(password) ||
      !/\d/.test(password) ||
      !/[^\w\s]/.test(password)
    ) {
      res.status(400).json({
        message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.',
      });
      return;
    }

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

// Verify Email
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

// Login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }

    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    if (!user.isVerified) {
      res.status(403).json({ message: 'Please verify your email first.' });
      return;
    }

    const token = generateToken({ id: user._id.toString(), email: user.email });

    res.status(200).json({ token });
  } catch (err: any) {
    console.error('❌ Login error:', err.message);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

// Forgot Password
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Email is required.' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    const resetCode = crypto.randomBytes(32).toString('hex');
    user.verificationCode = resetCode;
    await user.save();

    await sendVerificationEmail(user.email, resetCode); // reuse same mailer for simplicity

    res.status(200).json({ message: 'Reset link has been sent to your email.' });
  } catch (err: any) {
    console.error('❌ Forgot password error:', err.message);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

// Reset Password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, newPassword } = req.body;

    if (!code || !newPassword) {
      res.status(400).json({ message: 'Reset code and new password are required.' });
      return;
    }

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