import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { getClientIp, checkRateLimit } from '@/lib/rate-limit';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const ip = getClientIp(req);
    const limit = checkRateLimit(`confirm:${ip}:${id}`, 5, 60000);
    if (!limit.success) {
      return NextResponse.json({ error: 'You have submitted too many confirmations recently.' }, { status: 429 });
    }

    const user = await getUserFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { comment } = body;

    const outage = await prisma.outage.findUnique({ where: { id } });
    if (!outage) {
      return NextResponse.json({ error: 'Outage not found' }, { status: 404 });
    }

    // Check if this user already confirmed
    if (user?.userId) {
      const existing = await prisma.affectedConfirmation.findFirst({
        where: { outageId: id, userId: user.userId }
      });
      if (existing) {
        return NextResponse.json({ message: 'You have already confirmed you are affected by this outage.' }, { status: 200 });
      }
    }

    await prisma.affectedConfirmation.create({
      data: {
        outageId: id,
        userId: user ? user.userId : null,
        ipAddress: ip,
        comment: comment ? comment.trim() : null,
        isStillAffected: true,
      }
    });

    const updated = await prisma.outage.update({
      where: { id },
      data: {
        affectedReportsCount: { increment: 1 }
      }
    });

    return NextResponse.json({
      message: 'Thank you! Your confirmation has been added.',
      affectedCount: updated.affectedReportsCount,
    });

  } catch (error) {
    console.error('Error confirming outage:', error);
    return NextResponse.json({ error: 'Failed to confirm outage' }, { status: 500 });
  }
}
