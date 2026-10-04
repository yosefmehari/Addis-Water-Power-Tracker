import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ locations: [] });
    }

    const locations = await prisma.userLocation.findMany({
      where: { userId: user.userId },
      include: {
        subCity: true,
        woreda: true,
        area: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ locations });
  } catch (error) {
    console.error('Error fetching user locations:', error);
    return NextResponse.json({ error: 'Failed to fetch saved locations' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { label, subCityId, woredaId, areaId, address, isPrimary } = body;

    if (!label || !subCityId) {
      return NextResponse.json({ error: 'Label and sub-city are required' }, { status: 400 });
    }

    if (isPrimary) {
      // Unset previous primary
      await prisma.userLocation.updateMany({
        where: { userId: user.userId, isPrimary: true },
        data: { isPrimary: false }
      });
    }

    const newLoc = await prisma.userLocation.create({
      data: {
        userId: user.userId,
        label: label.trim(),
        subCityId,
        woredaId: woredaId || null,
        areaId: areaId || null,
        address: address ? address.trim() : null,
        isPrimary: Boolean(isPrimary),
      },
      include: {
        subCity: true,
        woreda: true,
        area: true,
      }
    });

    return NextResponse.json({ message: 'Location saved successfully', location: newLoc }, { status: 201 });
  } catch (error: any) {
    console.error('Error saving user location:', error);
    return NextResponse.json({ error: error.message || 'Failed to save location' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Location ID is required' }, { status: 400 });
    }

    await prisma.userLocation.deleteMany({
      where: { id, userId: user.userId }
    });

    return NextResponse.json({ message: 'Location removed' });
  } catch (error) {
    console.error('Error deleting user location:', error);
    return NextResponse.json({ error: 'Failed to delete location' }, { status: 500 });
  }
}
