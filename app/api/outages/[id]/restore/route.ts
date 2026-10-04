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
    const limit = checkRateLimit(`restore_vote:${ip}:${id}`, 5, 60000);
    if (!limit.success) {
      return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
    }

    const user = await getUserFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { note } = body;

    const outage = await prisma.outage.findUnique({ where: { id } });
    if (!outage) {
      return NextResponse.json({ error: 'Outage not found' }, { status: 404 });
    }

    if (outage.status === 'RESTORED') {
      return NextResponse.json({ message: 'This outage is already marked as restored.' });
    }

    await prisma.affectedConfirmation.create({
      data: {
        outageId: id,
        userId: user ? user.userId : null,
        ipAddress: ip,
        comment: note ? `Reported restored: ${note}` : 'User reported service has returned in their area.',
        isStillAffected: false,
      }
    });

    const updated = await prisma.outage.update({
      where: { id },
      data: {
        restoredVotesCount: { increment: 1 }
      }
    });

    return NextResponse.json({
      message: 'Thank you! Your restoration report has been recorded.',
      restoredVotesCount: updated.restoredVotesCount,
    });

  } catch (error) {
    console.error('Error reporting restoration:', error);
    return NextResponse.json({ error: 'Failed to record restoration report' }, { status: 500 });
  }
}
