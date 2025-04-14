import { Request, Response } from 'express';
import User from '../models/User';

/**
 * @desc Get current logged-in user's profile
 * @route GET /api/users/me
 * @access Private
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select('-password -verificationCode');
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    res.status(200).json(user);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Update name or email of the current user
 * @route PUT /api/users/update
 * @access Private
 */
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.user?.id,
      { $set: { name, email } },
      { new: true, runValidators: true }
    ).select('-password -verificationCode');

    res.status(200).json(updated);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Change password of the current user
 * @route PUT /api/users/password
 * @access Private
 */
export const updatePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(400).json({ message: 'Current password is incorrect.' });
      return;
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Delete the current user's account
 * @route DELETE /api/users/me
 * @access Private
 */
export const deleteMyAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    await User.findByIdAndDelete(req.user?.id);
    res.status(200).json({ message: 'Account deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get all users (admin only)
 * @route GET /api/users/
 * @access Private/Admin
 */
export const getAllUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password -verificationCode');
    res.status(200).json(users);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Delete a specific user by ID (admin only)
 * @route DELETE /api/users/:id
 * @access Private/Admin
 */
export const deleteUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};