import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { AnnouncementPriority, ServiceType, NotificationType } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const serviceType = searchParams.get('serviceType');
    const subCityId = searchParams.get('subCityId');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const where: any = {};
    if (!includeInactive) {
      where.isActive = true;
    }

    if (serviceType && serviceType !== 'ALL') {
      where.serviceType = { in: [serviceType as ServiceType, ServiceType.BOTH] };
    }

    if (subCityId && subCityId !== 'ALL') {
      where.OR = [
        { subCityId: null }, // citywide
        { subCityId: subCityId },
      ];
    }

    const announcements = await prisma.announcement.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        subCity: true,
        author: { select: { id: true, name: true } }
      }
    });

    return NextResponse.json({ announcements });

  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'DISPATCHER')) {
      return NextResponse.json({ error: 'Admin or Dispatcher access required' }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      content,
      serviceType = 'BOTH',
      priority = 'MEDIUM',
      subCityId,
      scheduledStart,
      scheduledEnd,
      isActive = true,
    } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        serviceType: serviceType as ServiceType,
        priority: priority as AnnouncementPriority,
        subCityId: subCityId || null,
        scheduledStart: scheduledStart ? new Date(scheduledStart) : null,
        scheduledEnd: scheduledEnd ? new Date(scheduledEnd) : null,
        isActive: Boolean(isActive),
        authorId: user.userId,
      },
      include: {
        subCity: true,
      }
    });

    // Notify registered residents about the new announcement
    try {
      const userFilter: any = { isActive: true };
      if (subCityId) {
        userFilter.subCityId = subCityId;
      }

      const usersToNotify = await prisma.user.findMany({
        where: userFilter,
        select: { id: true }
      });

      if (usersToNotify.length > 0) {
        await prisma.notification.createMany({
          data: usersToNotify.map(u => ({
            userId: u.id,
            title: `Announcement: ${announcement.title}`,
            message: announcement.content.length > 120 ? announcement.content.substring(0, 117) + '...' : announcement.content,
            type: NotificationType.ANNOUNCEMENT,
            linkUrl: '/announcements',
            isRead: false,
          }))
        });
      }
    } catch (notifErr) {
      console.error('Error dispatching announcement notifications:', notifErr);
    }

    return NextResponse.json({ message: 'Announcement created successfully', announcement }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating announcement:', error);
    return NextResponse.json({ error: error.message || 'Failed to create announcement' }, { status: 500 });
  }
}
