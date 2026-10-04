import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const payload = await getUserFromRequest(req);
    if (!payload) {
      return NextResponse.json({ user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        subCity: true,
        woreda: true,
        area: true,
        savedLocations: {
          include: { subCity: true, woreda: true, area: true }
        },
      }
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ user: null });
    }

    const unreadCount = await prisma.notification.count({
      where: { userId: user.id, isRead: false }
    });

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: {
        ...userWithoutPassword,
        unreadNotifications: unreadCount,
      }
    });

  } catch (error) {
    console.error('Error fetching current user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const payload = await getUserFromRequest(req);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, subCityId, woredaId, areaId, address, bio } = body;

    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        phone: phone !== undefined ? phone.trim() : undefined,
        subCityId: subCityId !== undefined ? subCityId : undefined,
        woredaId: woredaId !== undefined ? woredaId : undefined,
        areaId: areaId !== undefined ? areaId : undefined,
        address: address !== undefined ? address.trim() : undefined,
        bio: bio !== undefined ? bio.trim() : undefined,
      },
      include: {
        subCity: true,
        woreda: true,
        area: true,
      }
    });

    const { password: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: userWithoutPassword,
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
