import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { ServiceType, OutageStatus, SeverityLevel, NotificationType } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const serviceType = searchParams.get('serviceType');
    const status = searchParams.get('status');
    const subCityId = searchParams.get('subCityId');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (serviceType && serviceType !== 'ALL') {
      where.serviceType = serviceType as ServiceType;
    }

    if (status && status !== 'ALL') {
      if (status === 'ACTIVE_ONLY') {
        where.status = { in: [OutageStatus.ACTIVE, OutageStatus.INVESTIGATING, OutageStatus.VERIFIED] };
      } else {
        where.status = status as OutageStatus;
      }
    }

    if (subCityId && subCityId !== 'ALL') {
      where.subCityId = subCityId;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { specificLocation: { contains: q, mode: 'insensitive' } },
        { problemType: { contains: q, mode: 'insensitive' } },
        { subCity: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [outages, totalCount] = await Promise.all([
      prisma.outage.findMany({
        where,
        orderBy: [
          { status: 'asc' }, // e.g. ACTIVE first
          { startedAt: 'desc' },
        ],
        skip,
        take: limit,
        include: {
          subCity: true,
          woreda: true,
          area: true,
          _count: {
            select: {
              reports: true,
              confirmations: true,
              updates: true,
            }
          }
        }
      }),
      prisma.outage.count({ where })
    ]);

    return NextResponse.json({
      outages,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      }
    });

  } catch (error) {
    console.error('Error fetching outages:', error);
    return NextResponse.json({ error: 'Failed to fetch outages' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'DISPATCHER')) {
      return NextResponse.json({ error: 'Unauthorized: Admin or Dispatcher role required' }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      serviceType,
      problemType,
      description,
      severity,
      status = 'ACTIVE',
      subCityId,
      woredaId,
      areaId,
      specificLocation,
      latitude,
      longitude,
      startedAt,
      estimatedRestoration,
    } = body;

    if (!title || !serviceType || !problemType || !description || !subCityId) {
      return NextResponse.json({ error: 'Missing required outage fields' }, { status: 400 });
    }

    // Default coordinates to sub-city if not provided
    let finalLat = latitude ? parseFloat(latitude) : null;
    let finalLng = longitude ? parseFloat(longitude) : null;

    if (finalLat === null || finalLng === null || isNaN(finalLat) || isNaN(finalLng)) {
      const subCity = await prisma.subCity.findUnique({ where: { id: subCityId } });
      if (subCity) {
        finalLat = subCity.latitude;
        finalLng = subCity.longitude;
      } else {
        finalLat = 9.0300;
        finalLng = 38.7400;
      }
    }

    const outage = await prisma.outage.create({
      data: {
        title: title.trim(),
        serviceType: serviceType as ServiceType,
        problemType: problemType.trim(),
        description: description.trim(),
        severity: (severity as SeverityLevel) || SeverityLevel.MEDIUM,
        status: (status as OutageStatus) || OutageStatus.ACTIVE,
        subCityId,
        woredaId: woredaId || null,
        areaId: areaId || null,
        specificLocation: specificLocation ? specificLocation.trim() : null,
        latitude: finalLat,
        longitude: finalLng,
        startedAt: startedAt ? new Date(startedAt) : new Date(),
        estimatedRestoration: estimatedRestoration ? new Date(estimatedRestoration) : null,
        createdById: user.userId,
        verifiedById: user.userId,
        verifiedAt: new Date(),
      },
      include: {
        subCity: true,
        woreda: true,
        area: true,
      }
    });

    // Notify registered users who live in this sub-city!
    try {
      const usersInSubCity = await prisma.user.findMany({
        where: { subCityId: outage.subCityId, isActive: true },
        select: { id: true }
      });

      if (usersInSubCity.length > 0) {
        await prisma.notification.createMany({
          data: usersInSubCity.map((u) => ({
            userId: u.id,
            title: `New ${outage.serviceType === 'WATER' ? 'Water' : 'Electricity'} Outage Reported in ${outage.subCity.name}`,
            message: `${outage.title}. Status: ${outage.status}.`,
            type: NotificationType.OUTAGE_NEARBY,
            linkUrl: `/outages/${outage.id}`,
            isRead: false,
          }))
        });
      }
    } catch (notifErr) {
      console.error('Failed to dispatch user notifications:', notifErr);
    }

    return NextResponse.json({ message: 'Outage published successfully', outage }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating outage:', error);
    return NextResponse.json({ error: error.message || 'Failed to create outage' }, { status: 500 });
  }
}
