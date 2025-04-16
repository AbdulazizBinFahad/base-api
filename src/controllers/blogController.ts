import { Request, Response } from 'express';
import Blog, { IBlog, IComment } from '../models/Blog';
import User from '../models/User';
import { TokenPayload } from '../types/auth';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

/**
 * @desc Create a new blog post
 * @route POST /api/blogs
 * @access Private
 */
export const createBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content, tags } = req.body;
    const author = req.user?._id;

    const blog = await Blog.create({
      title,
      content,
      author,
      tags,
    });

    res.status(201).json(blog);
  } catch (err: any) {
    console.error('❌ Create blog error:', err.message);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

/**
 * @desc Get all published blog posts
 * @route GET /api/blogs
 * @access Public
 */
export const getBlogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, tag } = req.query;
    const query: any = { isPublished: true };

    if (tag) {
      query.tags = tag;
    }

    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('author', 'name email')
      .populate('comments.author', 'name email');

    const total = await Blog.countDocuments(query);

    res.status(200).json({
      blogs,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
    });
  } catch (err: any) {
    console.error('❌ Get blogs error:', err.message);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

/**
 * @desc Get a single blog post
 * @route GET /api/blogs/:id
 * @access Public
 */
export const getBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'name email')
      .populate('comments.author', 'name email');

    if (!blog) {
      res.status(404).json({ message: 'Blog not found.' });
      return;
    }

    if (!blog.isPublished && blog.author.toString() !== req.user?._id.toString()) {
      res.status(403).json({ message: 'Access denied.' });
      return;
    }

    res.status(200).json(blog);
  } catch (err: any) {
    console.error('❌ Get blog error:', err.message);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

/**
 * @desc Update a blog post
 * @route PUT /api/blogs/:id
 * @access Private
 */
export const updateBlog = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, content, tags, isPublished } = req.body;
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      res.status(404).json({ message: 'Blog not found.' });
      return;
    }

    if (blog.author.toString() !== req.user.id.toString()) {
      res.status(403).json({ message: 'Access denied.' });
      return;
    }

    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.tags = tags || blog.tags;
    blog.isPublished = isPublished !== undefined ? isPublished : blog.isPublished;
    await blog.save();

    res.status(200).json(blog);
  } catch (err: any) {
    console.error('❌ Update blog error:', err.message);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

/**
 * @desc Delete a blog post
 * @route DELETE /api/blogs/:id
 * @access Private
 */
export const deleteBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      res.status(404).json({ message: 'Blog not found.' });
      return;
    }

    if (blog.author.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: 'Access denied.' });
      return;
    }

    await blog.deleteOne();
    res.status(200).json({ message: 'Blog deleted successfully.' });
  } catch (err: any) {
    console.error('❌ Delete blog error:', err.message);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

/**
 * @desc Add a comment to a blog post
 * @route POST /api/blogs/:id/comments
 * @access Private
 */
export const addComment = async (req: Request & { user?: TokenPayload }, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { content } = req.body;
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      res.status(404).json({ message: 'Blog not found.' });
      return;
    }

    if (!blog.isPublished && blog.author.toString() !== req.user.id.toString()) {
      res.status(403).json({ message: 'Access denied.' });
      return;
    }

    const comment: IComment = {
      _id: new mongoose.Types.ObjectId(),
      content,
      author: new mongoose.Types.ObjectId(req.user.id),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    blog.comments.push(comment);
    await blog.save();

    const populatedBlog = await Blog.findById(blog._id)
      .populate('comments.author', 'name email');

    if (!populatedBlog) {
      res.status(404).json({ message: 'Blog not found.' });
      return;
    }

    res.status(201).json(populatedBlog.comments[populatedBlog.comments.length - 1]);
  } catch (err: any) {
    console.error('❌ Add comment error:', err.message);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

/**
 * @desc Delete a comment from a blog post
 * @route DELETE /api/blogs/:id/comments/:commentId
 * @access Private
 */
export const deleteComment = async (req: Request & { user?: TokenPayload }, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      res.status(404).json({ message: 'Blog not found.' });
      return;
    }

    const commentIndex = blog.comments.findIndex(c => c._id.toString() === req.params.commentId);
    if (commentIndex === -1) {
      res.status(404).json({ message: 'Comment not found.' });
      return;
    }

    if (blog.comments[commentIndex].author.toString() !== req.user.id.toString() && blog.author.toString() !== req.user.id.toString()) {
      res.status(403).json({ message: 'Access denied.' });
      return;
    }

    blog.comments.splice(commentIndex, 1);
    await blog.save();

    res.status(200).json({ message: 'Comment deleted successfully.' });
  } catch (err: any) {
    console.error('❌ Delete comment error:', err.message);
    res.status(500).json({ message: 'Something went wrong.' });
  }
}; 