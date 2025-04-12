import dotenv from 'dotenv';
dotenv.config();

import connectDB from './config/db'; // ✅ هذا لازم يكون default
import app from './app';

const PORT = parseInt(process.env.PORT || '5000', 10);
const BASE_URL = process.env.BASE_URL || `http://localhost`;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on ${BASE_URL}:${PORT}`);
    });
  } catch (err: any) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();