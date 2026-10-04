import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const subCities = await prisma.subCity.findMany({
      orderBy: { name: 'asc' },
      include: {
        woredas: {
          orderBy: { name: 'asc' },
          include: {
            areas: {
              orderBy: { name: 'asc' }
            }
          }
        },
        _count: {
          select: {
            outages: {
              where: { status: { in: ['ACTIVE', 'INVESTIGATING', 'VERIFIED'] } }
            }
          }
        }
      }
    });

    return NextResponse.json({ subCities });
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
  }
}
