import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const subCities = await prisma.subCity.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            woredas: true,
            outages: true,
            reports: true,
          }
        }
      }
    });
    return NextResponse.json({ subCities });
  } catch (error) {
    console.error('Error fetching sub-cities:', error);
    return NextResponse.json({ error: 'Failed to fetch sub-cities' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'DISPATCHER')) {
      return NextResponse.json({ error: 'Unauthorized admin access required' }, { status: 403 });
    }

    const { name, amharicName, code, latitude, longitude, description } = await req.json();

    if (!name || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: 'Name, latitude, and longitude are required' }, { status: 400 });
    }

    const subCity = await prisma.subCity.create({
      data: {
        name: name.trim(),
        amharicName: amharicName ? amharicName.trim() : null,
        code: code ? code.trim() : null,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        description: description ? description.trim() : null,
      }
    });

    return NextResponse.json({ message: 'Sub-City created successfully', subCity }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating sub-city:', error);
    return NextResponse.json({ error: error.message || 'Failed to create sub-city' }, { status: 500 });
  }
}
