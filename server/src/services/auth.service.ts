import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import { AppError } from '../middleware/error.middleware.js';
import { HTTP_STATUS } from '../constants/index.js';
import { signToken } from '../utils/jwt.utils.js';
import { AuthUserPayload, Role } from '../types/index.js';
import { AuditService } from './audit.service.js';

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: Role;
}

export interface LoginDto {
  email: string;
  password: string;
}

export class AuthService {
  public static async register(dto: RegisterDto, ipAddress?: string, userAgent?: string) {
    const existing = await prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new AppError('An account with this email already exists', HTTP_STATUS.CONFLICT);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);
    // Customer registration by default on public customer website
    const role: Role = 'CUSTOMER';

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email.toLowerCase().trim(),
          passwordHash,
          name: dto.name.trim(),
          phone: dto.phone?.trim() || null,
          role,
        },
      });

      await tx.customerProfile.create({
        data: {
          userId: user.id,
        },
      });

      await tx.cart.create({
        data: {
          userId: user.id,
        },
      });

      return user;
    });

    const payload: AuthUserPayload = {
      userId: result.id,
      email: result.email,
      role: 'CUSTOMER',
      name: result.name,
    };

    const token = signToken(payload);

    await AuditService.log({
      userId: result.id,
      action: 'USER_REGISTER',
      resource: 'User',
      resourceId: result.id,
      ipAddress,
      userAgent,
      metadata: { role: 'CUSTOMER' },
    });

    return {
      user: {
        id: result.id,
        email: result.email,
        name: result.name,
        phone: result.phone,
        role: 'CUSTOMER' as Role,
        avatarUrl: result.avatarUrl,
      },
      token,
    };
  }

  public static async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
      include: {
        restaurantManager: true,
        deliveryBoy: true,
      },
    });

    if (!user) {
      throw new AppError('Invalid email or password credentials', HTTP_STATUS.UNAUTHORIZED);
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Please contact support.', HTTP_STATUS.FORBIDDEN);
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password credentials', HTTP_STATUS.UNAUTHORIZED);
    }

    // Normalize canonical roles
    let userRole = user.role as Role;
    if ((userRole as string) === 'RESTAURANT' || (userRole as string) === 'RESTAURANT_ADMIN') {
      userRole = 'RESTAURANT_MANAGER';
    } else if ((userRole as string) === 'DELIVERY_PARTNER') {
      userRole = 'DELIVERY_BOY';
    } else if ((userRole as string) === 'ADMIN') {
      userRole = 'SUPER_ADMIN';
    }

    const restaurantId = user.restaurantManager?.restaurantId;
    const deliveryBoyId = user.deliveryBoy?.id;

    const payload: AuthUserPayload = {
      userId: user.id,
      email: user.email,
      role: userRole,
      name: user.name,
      restaurantId,
      deliveryBoyId,
      deliveryPartnerId: deliveryBoyId,
    };

    const token = signToken(payload);

    await AuditService.log({
      userId: user.id,
      action: 'USER_LOGIN',
      resource: 'User',
      resourceId: user.id,
      ipAddress,
      userAgent,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: userRole,
        avatarUrl: user.avatarUrl,
        restaurantId,
        deliveryBoyId,
        deliveryPartnerId: deliveryBoyId,
      },
      token,
    };
  }

  public static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        restaurantManager: true,
        deliveryBoy: true,
        customerProfile: true,
      },
    });

    if (!user) {
      throw new AppError('User profile not found', HTTP_STATUS.NOT_FOUND);
    }

    let userRole = user.role as Role;
    if ((userRole as string) === 'RESTAURANT' || (userRole as string) === 'RESTAURANT_ADMIN') {
      userRole = 'RESTAURANT_MANAGER';
    } else if ((userRole as string) === 'DELIVERY_PARTNER') {
      userRole = 'DELIVERY_BOY';
    } else if ((userRole as string) === 'ADMIN') {
      userRole = 'SUPER_ADMIN';
    }

    const restaurantId = user.restaurantManager?.restaurantId;
    const deliveryBoyId = user.deliveryBoy?.id;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: userRole,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
      restaurantId,
      deliveryBoyId,
      deliveryPartnerId: deliveryBoyId,
      customerProfile: user.customerProfile,
      createdAt: user.createdAt,
    };
  }

  public static async updateProfile(
    userId: string,
    data: { name?: string; phone?: string; avatarUrl?: string }
  ) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name?.trim(),
        phone: data.phone?.trim(),
        avatarUrl: data.avatarUrl?.trim(),
      },
      include: {
        restaurantManager: true,
        deliveryBoy: true,
      },
    });

    let userRole = updated.role as Role;
    if ((userRole as string) === 'RESTAURANT' || (userRole as string) === 'RESTAURANT_ADMIN') {
      userRole = 'RESTAURANT_MANAGER';
    } else if ((userRole as string) === 'DELIVERY_PARTNER') {
      userRole = 'DELIVERY_BOY';
    } else if ((userRole as string) === 'ADMIN') {
      userRole = 'SUPER_ADMIN';
    }

    const restaurantId = updated.restaurantManager?.restaurantId;
    const deliveryBoyId = updated.deliveryBoy?.id;

    return {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      phone: updated.phone,
      role: userRole,
      avatarUrl: updated.avatarUrl,
      restaurantId,
      deliveryBoyId,
      deliveryPartnerId: deliveryBoyId,
    };
  }
}
