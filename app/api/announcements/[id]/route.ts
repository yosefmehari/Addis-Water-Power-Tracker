import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { AnnouncementPriority, ServiceType } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 });
    }

    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: {
        subCity: true,
        author: {
          select: { id: true, name: true, role: true }
        }
      }
    });

    if (!announcement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    return NextResponse.json({ announcement });
  } catch (error: any) {
    console.error('Error fetching announcement:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch announcement' }, { status: 500 });
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

    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
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

    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 });
    }

    await prisma.announcement.delete({ where: { id } });
    return NextResponse.json({ message: 'Announcement deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting announcement:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete announcement' }, { status: 500 });
  }
}
