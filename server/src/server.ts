import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/index.js';
import apiRouter from './routes/index.js';
import { initSocketServer } from './socket/index.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import prisma from './lib/prisma.js';

export const app = express();
export const httpServer = http.createServer(app);

// Security & Parsing Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors(config.cors));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (config.env !== 'test') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api', apiRouter);

// Fallback & Error Handling Middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize Real-Time Socket.IO Server
export const io = initSocketServer(httpServer, config.cors.origin);

// Start server if not running in test mode
if (process.env.NODE_ENV !== 'test') {
  const PORT = config.port;
  httpServer.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 ZAVORA Server Running on http://localhost:${PORT}`);
    console.log(`📡 Socket.IO Gateway Ready`);
    console.log(`🔗 API Base: http://localhost:${PORT}/api`);
    console.log(`🛡️  Environment: ${config.env}`);
    console.log(`====================================================`);
  });

  const handleShutdown = async () => {
    console.log('\nShutting down Zavora server gracefully...');
    await prisma.$disconnect();
    httpServer.close(() => {
      console.log('Server closed. Goodbye!');
      process.exit(0);
    });
  };

  process.on('SIGINT', handleShutdown);
  process.on('SIGTERM', handleShutdown);
}

export default app;
