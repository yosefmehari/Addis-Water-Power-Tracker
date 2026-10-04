import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { OutageStatus, SeverityLevel, NotificationType } from '@prisma/client';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const outage = await prisma.outage.findUnique({
      where: { id },
      include: {
        subCity: true,
        woreda: true,
        area: true,
        createdBy: {
          select: { id: true, name: true, role: true }
        },
        verifiedBy: {
          select: { id: true, name: true, role: true }
        },
        updates: {
          orderBy: { createdAt: 'desc' },
          include: {
            author: { select: { id: true, name: true, role: true } }
          }
        },
        confirmations: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            user: { select: { id: true, name: true } }
          }
        },
        reports: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            problemType: true,
            description: true,
            createdAt: true,
            reporterName: true,
            status: true,
          }
        },
        _count: {
          select: {
            reports: true,
            confirmations: true,
            updates: true,
          }
        }
      }
    });

    if (!outage) {
      return NextResponse.json({ error: 'Outage not found' }, { status: 404 });
    }

    return NextResponse.json({ outage });

  } catch (error) {
    console.error('Error fetching outage:', error);
    return NextResponse.json({ error: 'Failed to fetch outage details' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'DISPATCHER')) {
      return NextResponse.json({ error: 'Admin or Dispatcher access required' }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    const {
      title,
      description,
      status,
      severity,
      estimatedRestoration,
      problemType,
      specificLocation,
      updateNote, // Optional note to add as an OutageUpdate
    } = body;

    const existing = await prisma.outage.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Outage not found' }, { status: 404 });
    }

    const isRestoring = status === 'RESTORED' && existing.status !== 'RESTORED';
    const restoredAt = isRestoring ? new Date() : (status && status !== 'RESTORED' ? null : undefined);

    const updated = await prisma.outage.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : undefined,
        description: description !== undefined ? description.trim() : undefined,
        status: status ? (status as OutageStatus) : undefined,
        severity: severity ? (severity as SeverityLevel) : undefined,
        problemType: problemType !== undefined ? problemType.trim() : undefined,
        specificLocation: specificLocation !== undefined ? specificLocation.trim() : undefined,
        estimatedRestoration: estimatedRestoration !== undefined ? (estimatedRestoration ? new Date(estimatedRestoration) : null) : undefined,
        restoredAt,
      },
      include: {
        subCity: true,
        woreda: true,
        area: true,
      }
    });

    // If an update note was provided or status changed, log an OutageUpdate entry
    if (updateNote || (status && status !== existing.status)) {
      await prisma.outageUpdate.create({
        data: {
          outageId: id,
          title: status !== existing.status ? `Status updated to ${status}` : 'Progress Update',
          message: updateNote || `Status changed from ${existing.status} to ${status}.`,
          updateType: status === 'RESTORED' ? 'RESTORED' : 'UPDATE',
          authorId: user.userId,
        }
      });
    }

    // Send notifications to users who confirmed or reported this outage
    if (status && status !== existing.status) {
      try {
        const affectedUsers = await prisma.affectedConfirmation.findMany({
          where: { outageId: id, userId: { not: null } },
          select: { userId: true },
          distinct: ['userId'],
        });

        const reporters = await prisma.outageReport.findMany({
          where: { outageId: id, userId: { not: null } },
          select: { userId: true },
          distinct: ['userId'],
        });

        const targetUserIds = new Set<string>();
        affectedUsers.forEach(u => u.userId && targetUserIds.add(u.userId));
        reporters.forEach(r => r.userId && targetUserIds.add(r.userId));

        if (targetUserIds.size > 0) {
          const notifType = status === 'RESTORED' 
            ? NotificationType.SERVICE_RESTORED 
            : NotificationType.STATUS_CHANGED;
          
          const notifTitle = status === 'RESTORED'
            ? `Service Restored: ${updated.title}`
            : `Outage Update: Status changed to ${status}`;

          await prisma.notification.createMany({
            data: Array.from(targetUserIds).map(userId => ({
              userId,
              title: notifTitle,
              message: `${updated.title} in ${updated.subCity.name} is now ${status}.`,
              type: notifType,
              linkUrl: `/outages/${id}`,
              isRead: false,
            }))
          });
        }
      } catch (notifErr) {
        console.error('Error sending status change notifications:', notifErr);
      }
    }

    return NextResponse.json({
      message: 'Outage updated successfully',
      outage: updated,
    });

  } catch (error: any) {
    console.error('Error updating outage:', error);
    return NextResponse.json({ error: error.message || 'Failed to update outage' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = params;

    await prisma.outage.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Outage deleted successfully' });

  } catch (error: any) {
    console.error('Error deleting outage:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete outage' }, { status: 500 });
  }
}
