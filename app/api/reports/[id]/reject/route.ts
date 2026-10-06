import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { ReportStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(
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
      return NextResponse.json({ error: 'Report ID is required' }, { status: 400 });
    }
    const body = await req.json().catch(() => ({}));
    const { reason = 'Report could not be verified or is duplicate/invalid.' } = body;

    const report = await prisma.outageReport.findUnique({ where: { id } });
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const updated = await prisma.outageReport.update({
      where: { id },
      data: {
        status: ReportStatus.REJECTED,
        rejectionReason: reason,
      }
    });

    // Notify user if registered
    if (report.userId) {
      await prisma.notification.create({
        data: {
          userId: report.userId,
          title: 'Report Update',
          message: `Your outage report was reviewed: ${reason}`,
          type: 'SYSTEM',
          linkUrl: '/profile',
        }
      });
    }

    return NextResponse.json({
      message: 'Report marked as rejected',
      report: updated,
    });

  } catch (error: any) {
    console.error('Error rejecting report:', error);
    return NextResponse.json({ error: error.message || 'Failed to reject report' }, { status: 500 });
  }
}
