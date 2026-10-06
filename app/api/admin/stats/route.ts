import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { startOfDay, subDays, startOfWeek } from 'date-fns';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    // Allow public home page to fetch general stats if not admin, but full metrics if admin
    const isAdmin = user && (user.role === 'ADMIN' || user.role === 'DISPATCHER');

    const now = new Date();
    const todayStart = startOfDay(now);
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const sevenDaysAgo = subDays(now, 7);

    const [
      totalUsers,
      totalReports,
      activeWaterOutages,
      activePowerOutages,
      restoredOutages,
      pendingReports,
      reportsToday,
      reportsThisWeek,
      totalOutages,
      allSubCities,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.outageReport.count(),
      prisma.outage.count({
        where: { serviceType: 'WATER', status: { in: ['ACTIVE', 'INVESTIGATING', 'VERIFIED'] } }
      }),
      prisma.outage.count({
        where: { serviceType: 'ELECTRICITY', status: { in: ['ACTIVE', 'INVESTIGATING', 'VERIFIED'] } }
      }),
      prisma.outage.count({
        where: { status: 'RESTORED' }
      }),
      prisma.outageReport.count({
        where: { status: 'PENDING' }
      }),
      prisma.outageReport.count({
        where: { createdAt: { gte: todayStart } }
      }),
      prisma.outageReport.count({
        where: { createdAt: { gte: weekStart } }
      }),
      prisma.outage.count(),
      prisma.subCity.findMany({
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              outages: true,
              reports: true,
            }
          }
        }
      })
    ]);

    // Outages by sub-city
    const outagesBySubCity = allSubCities.map(sc => ({
      name: sc.name,
      outages: sc._count.outages,
      reports: sc._count.reports,
    })).sort((a, b) => b.outages - a.outages);

    // Reports per day (past 7 days)
    const recentReports = await prisma.outageReport.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true, serviceType: true }
    });

    const dailyReportMap: Record<string, { date: string; water: number; electricity: number; total: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = subDays(now, i);
      const dateKey = d.toISOString().split('T')[0];
      const displayDay = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      dailyReportMap[dateKey] = { date: displayDay, water: 0, electricity: 0, total: 0 };
    }

    recentReports.forEach(r => {
      const dateKey = r.createdAt.toISOString().split('T')[0];
      if (dailyReportMap[dateKey]) {
        dailyReportMap[dateKey].total += 1;
        if (r.serviceType === 'WATER') dailyReportMap[dateKey].water += 1;
        if (r.serviceType === 'ELECTRICITY') dailyReportMap[dateKey].electricity += 1;
      }
    });

    const reportsPerDay = Object.values(dailyReportMap);

    // Service type distribution
    const serviceDistribution = [
      { name: 'Water', value: activeWaterOutages, color: '#0284c7' },
      { name: 'Electricity', value: activePowerOutages, color: '#f59e0b' },
    ];

    // Status breakdown
    const statusBreakdown = [
      { name: 'Active Outages', count: activeWaterOutages + activePowerOutages, color: '#ef4444' },
      { name: 'Restored Outages', count: restoredOutages, color: '#10b981' },
      { name: 'Pending Verification', count: pendingReports, color: '#8b5cf6' },
    ];

    // Average duration calculation for restored outages
    const restoredOutageList = await prisma.outage.findMany({
      where: { status: 'RESTORED', restoredAt: { not: null } },
      select: { startedAt: true, restoredAt: true }
    });

    let totalDurationHours = 0;
    restoredOutageList.forEach(o => {
      if (o.restoredAt) {
        const diffMs = o.restoredAt.getTime() - o.startedAt.getTime();
        totalDurationHours += Math.max(0.5, diffMs / (1000 * 60 * 60));
      }
    });
    const avgDurationHours = restoredOutageList.length > 0 
      ? Number((totalDurationHours / restoredOutageList.length).toFixed(1))
      : 3.5;

    return NextResponse.json({
      metrics: {
        totalUsers,
        totalReports,
        activeOutages: activeWaterOutages + activePowerOutages,
        activeWaterOutages,
        activePowerOutages,
        restoredOutages,
        pendingReports,
        reportsToday,
        reportsThisWeek,
        totalOutages,
        avgDurationHours,
      },
      charts: {
        outagesBySubCity,
        reportsPerDay,
        serviceDistribution,
        statusBreakdown,
      }
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}
