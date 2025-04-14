import { Router } from 'express';
import {
  getMe,
  updateUser,
  updatePassword,
  deleteMyAccount,
  getAllUsers,
  deleteUserById,
} from '../controllers/userController';
import { authorize } from '../middleware/authMiddleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile & management APIs
 */

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current logged-in user's data
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User data returned
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authorize(), getMe);

/**
 * @swagger
 * /api/users/update:
 *   put:
 *     summary: Update user's name or email
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 *       401:
 *         description: Unauthorized
 */
router.put('/update', authorize(), updateUser);

/**
 * @swagger
 * /api/users/password:
 *   put:
 *     summary: Change current user's password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated
 *       400:
 *         description: Incorrect current password
 *       401:
 *         description: Unauthorized
 */
router.put('/password', authorize(), updatePassword);

/**
 * @swagger
 * /api/users/me:
 *   delete:
 *     summary: Delete own account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted
 *       401:
 *         description: Unauthorized
 */
router.delete('/me', authorize(), deleteMyAccount);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get list of all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       403:
 *         description: Access denied
 */
router.get('/', authorize('admin'), getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user by ID (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted
 *       403:
 *         description: Access denied
 */
router.delete('/:id', authorize('admin'), deleteUserById);

export default router;