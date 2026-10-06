import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subCityId = searchParams.get('subCityId');

    const woredas = await prisma.woreda.findMany({
      where: subCityId ? { subCityId } : undefined,
      orderBy: { name: 'asc' },
      include: {
        subCity: true,
        areas: true,
        _count: {
          select: { areas: true, outages: true }
        }
      }
    });

    return NextResponse.json({ woredas });
  } catch (error) {
    console.error('Error fetching woredas:', error);
    return NextResponse.json({ error: 'Failed to fetch woredas' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'DISPATCHER')) {
      return NextResponse.json({ error: 'Unauthorized admin access required' }, { status: 403 });
    }

    const { name, subCityId, code, latitude, longitude } = await req.json();

    if (!name || !subCityId) {
      return NextResponse.json({ error: 'Name and subCityId are required' }, { status: 400 });
    }

    const woreda = await prisma.woreda.create({
      data: {
        name: name.trim(),
        subCityId,
        code: code ? code.trim() : null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      },
      include: {
        subCity: true,
      }
    });

    return NextResponse.json({ message: 'Woreda created successfully', woreda }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating woreda:', error);
    return NextResponse.json({ error: error.message || 'Failed to create woreda' }, { status: 500 });
  }
}
