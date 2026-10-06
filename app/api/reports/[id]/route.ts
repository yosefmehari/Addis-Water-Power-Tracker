import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { ReportStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: 'Report ID is required' }, { status: 400 });
    }

    const report = await prisma.outageReport.findUnique({
      where: { id },
      include: {
        subCity: true,
        woreda: true,
        area: true,
        outage: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
      }
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json({ error: 'Failed to fetch report' }, { status: 500 });
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
      return NextResponse.json({ error: 'Report ID is required' }, { status: 400 });
    }
    const body = await req.json().catch(() => ({}));
    const { status, rejectionReason, problemType, description, specificLocation } = body;

    const report = await prisma.outageReport.update({
      where: { id },
      data: {
        status: status ? (status as ReportStatus) : undefined,
        rejectionReason: rejectionReason !== undefined ? rejectionReason : undefined,
        problemType: problemType ? problemType.trim() : undefined,
        description: description ? description.trim() : undefined,
        specificLocation: specificLocation ? specificLocation.trim() : undefined,
      },
      include: {
        subCity: true,
        woreda: true,
        area: true,
      }
    });

    return NextResponse.json({ message: 'Report updated successfully', report });
  } catch (error: any) {
    console.error('Error updating report:', error);
    return NextResponse.json({ error: error.message || 'Failed to update report' }, { status: 500 });
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
      return NextResponse.json({ error: 'Report ID is required' }, { status: 400 });
    }
    await prisma.outageReport.delete({ where: { id } });
    return NextResponse.json({ message: 'Report deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting report:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete report' }, { status: 500 });
  }
}
