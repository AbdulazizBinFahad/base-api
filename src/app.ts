import express, { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './docs/swagger';
import authRoutes from './routes/authRoutes';
import './types/auth';

const app = express();

// Parse JSON requests
app.use(express.json());

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Authentication routes
app.use('/api/auth', authRoutes);

// Root route
app.get('/', (req: Request, res: Response) => {
  res.send('Server is running...');
});

export default app;