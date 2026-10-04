import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { ReportStatus, OutageStatus, SeverityLevel, NotificationType } from '@prisma/client';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'DISPATCHER')) {
      return NextResponse.json({ error: 'Admin or Dispatcher access required' }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json().catch(() => ({}));
    const {
      promoteToOutage = true,
      existingOutageId,
      severity = 'MEDIUM',
      title,
      estimatedRestoration,
    } = body;

    const report = await prisma.outageReport.findUnique({
      where: { id },
      include: { subCity: true, woreda: true, area: true }
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    let linkedOutageId = existingOutageId || report.outageId;

    if (promoteToOutage && !linkedOutageId) {
      // Create new Outage from this report
      const outageTitle = title || `${report.serviceType === 'WATER' ? 'Water Supply Disruption' : 'Power Outage'} in ${report.subCity.name} (${report.specificLocation})`;

      const newOutage = await prisma.outage.create({
        data: {
          title: outageTitle,
          serviceType: report.serviceType,
          problemType: report.problemType,
          description: report.description,
          severity: severity as SeverityLevel,
          status: OutageStatus.ACTIVE,
          subCityId: report.subCityId,
          woredaId: report.woredaId,
          areaId: report.areaId,
          specificLocation: report.specificLocation,
          latitude: report.latitude,
          longitude: report.longitude,
          startedAt: report.startedAt,
          estimatedRestoration: estimatedRestoration ? new Date(estimatedRestoration) : null,
          verifiedById: user.userId,
          verifiedAt: new Date(),
          affectedReportsCount: 1,
        }
      });

      linkedOutageId = newOutage.id;

      // Create initial update
      await prisma.outageUpdate.create({
        data: {
          outageId: newOutage.id,
          title: 'Outage Confirmed by Municipal Dispatch',
          message: `Dispatcher verified report. Field crew alerted for ${report.subCity.name}.`,
          updateType: 'INVESTIGATING',
          authorId: user.userId,
        }
      });
    } else if (linkedOutageId) {
      // Increment affected counter on linked outage
      await prisma.outage.update({
        where: { id: linkedOutageId },
        data: { affectedReportsCount: { increment: 1 } }
      });
    }

    // Update the report to VERIFIED
    const updatedReport = await prisma.outageReport.update({
      where: { id },
      data: {
        status: ReportStatus.VERIFIED,
        outageId: linkedOutageId,
      }
    });

    // Notify the reporting citizen if registered
    if (report.userId) {
      await prisma.notification.create({
        data: {
          userId: report.userId,
          title: 'Report Verified by Municipal Dispatcher',
          message: `Your ${report.serviceType.toLowerCase()} report in ${report.subCity.name} has been verified and logged into the active tracker.`,
          type: NotificationType.OUTAGE_VERIFIED,
          linkUrl: linkedOutageId ? `/outages/${linkedOutageId}` : '/profile',
        }
      });
    }

    return NextResponse.json({
      message: 'Report verified successfully',
      report: updatedReport,
      outageId: linkedOutageId,
    });

  } catch (error: any) {
    console.error('Error verifying report:', error);
    return NextResponse.json({ error: error.message || 'Failed to verify report' }, { status: 500 });
  }
}
