import prisma from '../lib/prisma.js';
import { generateTransactionRef } from '../utils/orderNumber.utils.js';
import { AppError } from '../middleware/error.middleware.js';
import { HTTP_STATUS } from '../constants/index.js';

export class PaymentService {
  public static async processPayment(
    orderId: string,
    userId: string,
    amount: number,
    method: 'CASH_ON_DELIVERY' | 'ONLINE_DEMO_PAY'
  ) {
    const transactionRef = generateTransactionRef();

    const payment = await prisma.payment.create({
      data: {
        orderId,
        userId,
        amount,
        currency: 'INR',
        method,
        status: method === 'ONLINE_DEMO_PAY' ? 'PAID' : 'PENDING',
        transactionRef,
        paymentGatewayResponse: JSON.stringify({
          provider: 'QuickBite Safe Sandbox Mock Gateway',
          status: 'SUCCESS',
          authCode: `AUTH_${Math.floor(100000 + Math.random() * 900000)}`,
          processedAt: new Date().toISOString(),
        }),
      },
    });

    if (method === 'ONLINE_DEMO_PAY') {
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'PAID' },
      });
    }

    return payment;
  }

  public static async refundPayment(orderId: string, reason?: string) {
    const payment = await prisma.payment.findFirst({
      where: { orderId },
    });

    if (!payment) return null;

    return prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'REFUNDED',
        paymentGatewayResponse: JSON.stringify({
          provider: 'QuickBite Safe Sandbox Mock Gateway',
          status: 'REFUNDED',
          reason: reason || 'Order cancelled',
          refundedAt: new Date().toISOString(),
        }),
      },
    });
  }

  public static async markCashCollected(orderId: string) {
    const payment = await prisma.payment.findFirst({
      where: { orderId, method: 'CASH_ON_DELIVERY' },
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'PAID' },
      });
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'PAID' },
    });
  }
}
