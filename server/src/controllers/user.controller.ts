import { Response } from 'express';
import prisma from '../lib/prisma.js';
import { AuthenticatedRequest } from '../types/index.js';
import { HTTP_STATUS } from '../constants/index.js';
import { AppError } from '../middleware/error.middleware.js';

export class UserController {
  public static async getAddresses(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: addresses,
    });
  }

  public static async addAddress(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const { label, recipientName, phone, streetAddress, landmark, city, state, postalCode, latitude, longitude, isDefault } = req.body;

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId,
        label: label || 'Home',
        recipientName: recipientName || req.user?.name,
        phone,
        streetAddress,
        landmark,
        city: city || 'Bengaluru',
        state: state || 'Karnataka',
        postalCode: postalCode || '560001',
        latitude: latitude || 12.9716,
        longitude: longitude || 77.5946,
        isDefault: isDefault || false,
      },
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Address added successfully',
      data: address,
    });
  }

  public static async updateAddress(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { label, recipientName, phone, streetAddress, landmark, city, state, postalCode, latitude, longitude, isDefault } = req.body;

    const existing = await prisma.address.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new AppError('Address not found', HTTP_STATUS.NOT_FOUND);
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id },
      data: {
        label,
        recipientName,
        phone,
        streetAddress,
        landmark,
        city,
        state,
        postalCode,
        latitude,
        longitude,
        isDefault,
      },
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Address updated successfully',
      data: address,
    });
  }

  public static async deleteAddress(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const { id } = req.params;

    const existing = await prisma.address.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new AppError('Address not found', HTTP_STATUS.NOT_FOUND);
    }

    await prisma.address.delete({ where: { id } });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Address deleted successfully',
    });
  }
}
