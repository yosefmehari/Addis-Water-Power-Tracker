import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, signToken, setTokenCookie } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limit = checkRateLimit(`register:${ip}`, 10, 60000);
    if (!limit.success) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again shortly.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, email, password, phone, subCityId, woredaId, address } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email address already exists.' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone ? phone.trim() : null,
        subCityId: subCityId || null,
        woredaId: woredaId || null,
        address: address ? address.trim() : null,
        role: 'USER',
      },
      include: {
        subCity: true,
        woreda: true,
      }
    });

    // Create a welcome notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Welcome to Addis Water & Power Tracker',
        message: 'Stay updated with live water and electricity status across Addis Ababa.',
        type: 'SYSTEM',
        linkUrl: '/profile',
      }
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    setTokenCookie(token);

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: 'Account created successfully',
      user: userWithoutPassword,
      token,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during registration.' },
      { status: 500 }
    );
  }
}
