import prisma from '../lib/prisma.js';

export interface CreateAuditLogParams {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

export class AuditService {
  public static async log(params: CreateAuditLogParams): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: params.userId,
          action: params.action,
          resource: params.resource,
          resourceId: params.resourceId,
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
          metadataJson: params.metadata ? JSON.stringify(params.metadata) : null,
        },
      });
    } catch (err) {
      console.error('Failed to write audit log:', err);
    }
  }

  public static async getLogs(page = 1, limit = 20, action?: string, resource?: string) {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};

    if (action) where.action = { contains: action };
    if (resource) where.resource = { contains: resource };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { logs, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
