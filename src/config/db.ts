import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI as string;

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected');
  } catch (err: any) {
    console.error('MongoDB Connection Failed:', err.message);
    process.exit(1);
  }
};

export default connectDB;