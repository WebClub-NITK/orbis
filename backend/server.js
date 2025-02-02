import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import sessionConfig from './src/config/session.js';
import errorHandler from './src/middleware/error.js';
import prisma from './src/config/database.js';


// Import routes
import authRoutes from './src/routes/auth.js';
import eventRoutes from './src/routes/events.js';
import teamRoutes from './src/routes/teams.js';
import projectRoutes from './src/routes/projects.js';
import profileRoutes from './src/routes/profiles.js';

const app = express();
const PORT = process.env.PORT || 4000;



// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(sessionConfig);

// Routes
app.use('/api', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api', projectRoutes);
app.use('/api', profileRoutes);

// Error handling
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('Starting graceful shutdown...');
  
  // Close server
  server.close(() => {
    console.log('Express server closed');
  });

  try {
    // Disconnect Prisma
    await prisma.$disconnect();
    console.log('Database connection closed');
    
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

