import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      // Return success to avoid email enumeration
      return NextResponse.json({
        message: 'If an account exists with this email, password reset instructions have been generated.',
        demoResetToken: 'DEMO-RESET-TOKEN-123456',
      });
    }

    const resetToken = crypto.randomBytes(24).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetExpires,
      }
    });

    return NextResponse.json({
      message: 'Password reset link generated successfully.',
      resetToken, // Returned for dev testing convenience
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Failed to process forgot password request' }, { status: 500 });
  }
}
