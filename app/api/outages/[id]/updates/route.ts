import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

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
      return NextResponse.json({ error: 'Outage ID is required' }, { status: 400 });
    }
    const body = await req.json();
    const { title, message, updateType = 'UPDATE' } = body;

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

    const outage = await prisma.outage.findUnique({ where: { id } });
    if (!outage) {
      return NextResponse.json({ error: 'Outage not found' }, { status: 404 });
    }

    const update = await prisma.outageUpdate.create({
      data: {
        outageId: id,
        title: title.trim(),
        message: message.trim(),
        updateType,
        authorId: user.userId,
      },
      include: {
        author: {
          select: { id: true, name: true, role: true }
        }
      }
    });

    return NextResponse.json({ message: 'Update posted to timeline', update }, { status: 201 });

  } catch (error) {
    console.error('Error adding outage update:', error);
    return NextResponse.json({ error: 'Failed to post update' }, { status: 500 });
  }
}
