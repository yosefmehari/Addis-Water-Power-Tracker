import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { ServiceType, ReportStatus, NotificationType } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
      where.status = status as ReportStatus;
    }

    if (subCityId && subCityId !== 'ALL') {
      where.subCityId = subCityId;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { description: { contains: q, mode: 'insensitive' } },
        { problemType: { contains: q, mode: 'insensitive' } },
        { specificLocation: { contains: q, mode: 'insensitive' } },
        { reporterName: { contains: q, mode: 'insensitive' } },
        { reporterPhone: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [reports, totalCount] = await Promise.all([
      prisma.outageReport.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          subCity: true,
          woreda: true,
          area: true,
          outage: {
            select: { id: true, title: true, status: true }
          },
          user: {
            select: { id: true, name: true, email: true }
          }
        }
      }),
      prisma.outageReport.count({ where })
    ]);

    return NextResponse.json({
      reports,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      }
    });

  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    // Rate limit: max 10 submissions per 10 minutes per IP
    const limit = checkRateLimit(`report_submit:${ip}`, 10, 600000);
    if (!limit.success) {
      return NextResponse.json(
        { error: 'You have submitted several reports recently. Please wait before submitting another.' },
        { status: 429 }
      );
    }

    const user = await getUserFromRequest(req);
    const body = await req.json();
    const {
      serviceType,
      problemType,
      description,
      subCityId,
      woredaId,
      areaId,
      specificLocation,
      address,
      startedAt,
      photoUrl,
      reporterName,
      reporterPhone,
      reporterEmail,
      latitude,
      longitude,
    } = body;

    if (!serviceType || !problemType || !description || !subCityId || !specificLocation) {
      return NextResponse.json(
        { error: 'Service type, problem type, description, sub-city, and location are required.' },
        { status: 400 }
      );
    }

    // Duplicate detection: check if duplicate report was made in last 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const potentialDuplicate = await prisma.outageReport.findFirst({
      where: {
        serviceType: serviceType as ServiceType,
        subCityId,
        woredaId: woredaId || undefined,
        createdAt: { gte: fifteenMinutesAgo },
        OR: [
          { ipAddress: ip },
          { specificLocation: { contains: specificLocation.trim(), mode: 'insensitive' } },
        ]
      }
    });

    // Resolve GPS coordinates from sub-city or payload
    let lat = latitude ? parseFloat(latitude) : null;
    let lng = longitude ? parseFloat(longitude) : null;

    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      const sc = await prisma.subCity.findUnique({ where: { id: subCityId } });
      if (sc) {
        // Add tiny jitter so pins don't overlap perfectly
        lat = sc.latitude + (Math.random() - 0.5) * 0.008;
        lng = sc.longitude + (Math.random() - 0.5) * 0.008;
      } else {
        lat = 9.0300;
        lng = 38.7400;
      }
    }

    // Check if there is already an active Outage in this area for this service type to link to!
    const existingActiveOutage = await prisma.outage.findFirst({
      where: {
        serviceType: serviceType as ServiceType,
        subCityId,
        status: { in: ['ACTIVE', 'INVESTIGATING', 'VERIFIED'] }
      }
    });

    const report = await prisma.outageReport.create({
      data: {
        serviceType: serviceType as ServiceType,
        problemType: problemType.trim(),
        description: description.trim(),
        subCityId,
        woredaId: woredaId || null,
        areaId: areaId || null,
        specificLocation: specificLocation.trim(),
        address: address ? address.trim() : null,
        startedAt: startedAt ? new Date(startedAt) : new Date(),
        photoUrl: photoUrl || null,
        reporterName: reporterName ? reporterName.trim() : (user?.name || null),
        reporterPhone: reporterPhone ? reporterPhone.trim() : null,
        reporterEmail: reporterEmail ? reporterEmail.trim().toLowerCase() : (user?.email || null),
        userId: user?.userId || null,
        ipAddress: ip,
        status: ReportStatus.PENDING,
        latitude: lat,
        longitude: lng,
        outageId: existingActiveOutage ? existingActiveOutage.id : null,
      },
      include: {
        subCity: true,
        woreda: true,
        area: true,
      }
    });

    // If linked to active outage, increment its count
    if (existingActiveOutage) {
      await prisma.outage.update({
        where: { id: existingActiveOutage.id },
        data: { affectedReportsCount: { increment: 1 } }
      });
    }

    // If submitted by logged in user, notify them
    if (user?.userId) {
      await prisma.notification.create({
        data: {
          userId: user.userId,
          title: 'Report Submitted Successfully',
          message: `Your ${serviceType.toLowerCase()} report in ${report.subCity.name} is received. Status: Pending verification.`,
          type: NotificationType.SYSTEM,
          linkUrl: `/profile`,
        }
      });
    }

    return NextResponse.json({
      message: 'Report submitted successfully. Status: Pending verification',
      status: 'Pending verification',
      isDuplicateWarning: !!potentialDuplicate,
      report,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error submitting report:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit report' }, { status: 500 });
  }
}
