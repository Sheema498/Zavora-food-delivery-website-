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
  // If registering as Delivery Partner
  vehicleType?: 'BICYCLE' | 'MOTORBIKE' | 'SCOOTER' | 'CAR';
  vehicleNumber?: string;
  licenseNumber?: string;
  // If registering as Restaurant Owner
  restaurantName?: string;
  restaurantAddress?: string;
  restaurantPhone?: string;
  cuisineTypes?: string;
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
    const role: Role = dto.role || 'CUSTOMER';

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

      let restaurantId: string | undefined;
      let deliveryPartnerId: string | undefined;

      if (role === 'CUSTOMER') {
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
      } else if (role === 'DELIVERY_PARTNER') {
        const dp = await tx.deliveryPartnerProfile.create({
          data: {
            userId: user.id,
            vehicleType: dto.vehicleType || 'MOTORBIKE',
            vehicleNumber: dto.vehicleNumber || 'KA-01-EXP-001',
            licenseNumber: dto.licenseNumber || 'DL-2024-001',
            currentLatitude: 12.9716,
            currentLongitude: 77.5946,
            isOnline: true,
          },
        });
        deliveryPartnerId = dp.id;
      } else if (role === 'RESTAURANT') {
        const restName = dto.restaurantName || `${dto.name}'s Kitchen`;
        const slug =
          restName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '') +
          '-' +
          Math.floor(1000 + Math.random() * 9000);

        const rest = await tx.restaurant.create({
          data: {
            name: restName,
            slug,
            description: 'Artisanal dishes prepared fresh with premium quality ingredients.',
            phone: dto.restaurantPhone || dto.phone || '9876543210',
            email: dto.email.toLowerCase().trim(),
            address: dto.restaurantAddress || '100ft Road, Indiranagar',
            city: 'Bengaluru',
            state: 'Karnataka',
            postalCode: '560001',
            latitude: 12.9784,
            longitude: 77.6408,
            cuisineTypes: dto.cuisineTypes || 'Multi-Cuisine, Fast Food',
            priceRange: '₹₹',
            avgPrepTimeMinutes: 20,
            deliveryFee: 40.0,
            commissionRate: 0.15,
            isOpen: true,
          },
        });

        await tx.restaurantStaff.create({
          data: {
            userId: user.id,
            restaurantId: rest.id,
            role: 'OWNER',
          },
        });

        // Create default initial category
        await tx.foodCategory.create({
          data: {
            restaurantId: rest.id,
            name: "Chef's Specials",
            slug: 'chef-specials',
            displayOrder: 1,
          },
        });

        restaurantId = rest.id;
      }

      return { user, restaurantId, deliveryPartnerId };
    });

    const userRole = result.user.role as Role;

    const payload: AuthUserPayload = {
      userId: result.user.id,
      email: result.user.email,
      role: userRole,
      name: result.user.name,
      restaurantId: result.restaurantId,
      deliveryPartnerId: result.deliveryPartnerId,
    };

    const token = signToken(payload);

    await AuditService.log({
      userId: result.user.id,
      action: 'USER_REGISTER',
      resource: 'User',
      resourceId: result.user.id,
      ipAddress,
      userAgent,
      metadata: { role: result.user.role },
    });

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        phone: result.user.phone,
        role: userRole,
        avatarUrl: result.user.avatarUrl,
        restaurantId: result.restaurantId,
        deliveryPartnerId: result.deliveryPartnerId,
      },
      token,
    };
  }

  public static async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
      include: {
        restaurantStaff: true,
        deliveryPartnerProfile: true,
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

    const restaurantId = user.restaurantStaff[0]?.restaurantId;
    const deliveryPartnerId = user.deliveryPartnerProfile?.id;
    const userRole = user.role as Role;

    const payload: AuthUserPayload = {
      userId: user.id,
      email: user.email,
      role: userRole,
      name: user.name,
      restaurantId,
      deliveryPartnerId,
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
        deliveryPartnerId,
      },
      token,
    };
  }

  public static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        restaurantStaff: true,
        deliveryPartnerProfile: true,
        customerProfile: true,
      },
    });

    if (!user) {
      throw new AppError('User profile not found', HTTP_STATUS.NOT_FOUND);
    }

    const restaurantId = user.restaurantStaff[0]?.restaurantId;
    const deliveryPartnerId = user.deliveryPartnerProfile?.id;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role as Role,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
      restaurantId,
      deliveryPartnerId,
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
        restaurantStaff: true,
        deliveryPartnerProfile: true,
      },
    });

    const restaurantId = updated.restaurantStaff[0]?.restaurantId;
    const deliveryPartnerId = updated.deliveryPartnerProfile?.id;

    return {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      phone: updated.phone,
      role: updated.role as Role,
      avatarUrl: updated.avatarUrl,
      restaurantId,
      deliveryPartnerId,
    };
  }
}
