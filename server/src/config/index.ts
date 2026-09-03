import dotenv from 'dotenv';
import path from 'path';

// Load .env file from server directory or root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwt: {
    secret: process.env.JWT_SECRET || 'zavora_production_quality_jwt_secret_token_dev_2025',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
  cors: {
    origin: [
      process.env.CLIENT_URL || 'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
    ],
    credentials: true,
  },
  platform: {
    defaultCommissionRate: 0.15, // 15% platform commission
    defaultDeliveryFee: 40.0,
    freeDeliveryThreshold: 500.0,
    taxRatePercentage: 5.0, // 5% GST/Tax
    maxDeliveryDistanceKm: 15.0,
    driverBasePayPerKm: 12.0,
    driverBasePickupPay: 25.0,
  },
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },
};
