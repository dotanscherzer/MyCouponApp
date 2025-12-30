import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());

// CORS configuration - normalize origin by removing trailing slashes
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const normalizedFrontendUrl = frontendUrl.replace(/\/$/, '');

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    // Normalize the request origin by removing trailing slash
    const normalizedOrigin = origin.replace(/\/$/, '');
    if (normalizedOrigin === normalizedFrontendUrl) {
      callback(null, true);
    } else {
      console.error(`CORS error: Origin ${origin} (normalized: ${normalizedOrigin}) not allowed. Allowed: ${normalizedFrontendUrl}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import groupsRoutes from './routes/groups.routes';
import invitationsRoutes from './routes/invitations.routes';
import membersRoutes from './routes/members.routes';
import lookupRoutes from './routes/lookup.routes';
import adminRoutes from './routes/admin.routes';
import internalRoutes from './routes/internal/jobs.routes';

app.use('/api/auth', authRoutes);
app.use('/api', usersRoutes); // /api/me, /api/me/notifications
app.use('/api/groups', groupsRoutes);
app.use('/api', invitationsRoutes); // /api/groups/:groupId/invitations, /api/invitations/accept
app.use('/api', membersRoutes); // /api/groups/:groupId/members
app.use('/api/lookup', lookupRoutes); // /api/lookup/stores, /api/lookup/multi-coupons
app.use('/api/admin', adminRoutes); // /api/admin/stores, /api/admin/multi-coupons, /api/admin/unmapped-multi-events
app.use('/internal', internalRoutes); // /internal/jobs/daily

// Error handling middleware
import { errorHandler } from './middlewares/error-handler.middleware';
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    await connectDatabase();
    console.log('Database connected successfully');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
