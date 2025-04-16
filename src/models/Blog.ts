import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IComment {
  _id: Types.ObjectId;
  content: string;
  author: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBlog extends Document {
  _id: Types.ObjectId;
  title: string;
  content: string;
  author: Types.ObjectId;
  comments: IComment[];
  tags: string[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 1000,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const blogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
      required: true,
      minlength: 4,
      maxlength: 200,
      index: true,
    },
    content: {
      type: String,
      required: true,
      minlength: 10,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    comments: [commentSchema],
    tags: [{
      type: String,
      minlength: 2,
      maxlength: 20,
    }],
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Add indexes for better query performance
blogSchema.index({ tags: 1 });
blogSchema.index({ createdAt: -1 });
blogSchema.index({ isPublished: 1 });

const Blog = mongoose.model<IBlog>('Blog', blogSchema);
export default Blog; 