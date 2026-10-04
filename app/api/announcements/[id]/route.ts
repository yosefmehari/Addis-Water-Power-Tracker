import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { AnnouncementPriority, ServiceType } from '@prisma/client';

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
    const { title, content, serviceType, priority, subCityId, scheduledStart, scheduledEnd, isActive } = body;

    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : undefined,
        content: content !== undefined ? content.trim() : undefined,
        serviceType: serviceType ? (serviceType as ServiceType) : undefined,
        priority: priority ? (priority as AnnouncementPriority) : undefined,
        subCityId: subCityId !== undefined ? (subCityId || null) : undefined,
        scheduledStart: scheduledStart !== undefined ? (scheduledStart ? new Date(scheduledStart) : null) : undefined,
        scheduledEnd: scheduledEnd !== undefined ? (scheduledEnd ? new Date(scheduledEnd) : null) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
      include: { subCity: true }
    });

    return NextResponse.json({ message: 'Announcement updated successfully', announcement });
  } catch (error: any) {
    console.error('Error updating announcement:', error);
    return NextResponse.json({ error: error.message || 'Failed to update announcement' }, { status: 500 });
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
    await prisma.announcement.delete({ where: { id } });
    return NextResponse.json({ message: 'Announcement deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting announcement:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete announcement' }, { status: 500 });
  }
}
