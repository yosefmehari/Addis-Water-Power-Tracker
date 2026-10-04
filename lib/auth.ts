import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'addis-water-power-secret-key-2026-prod-token';
const TOKEN_NAME = 'awpt_token';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  name?: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (err) {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getUserFromRequest(request?: Request): Promise<TokenPayload | null> {
  // Check authorization header first if available
  if (request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = verifyToken(token);
      if (payload) return payload;
    }
  }

  // Check cookie store
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(TOKEN_NAME)?.value;
    if (token) {
      return verifyToken(token);
    }
  } catch (e) {
    // cookies() might not be available in some contexts
  }

  return null;
}

export async function getFullUserFromRequest(request?: Request) {
  const payload = await getUserFromRequest(request);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      subCity: true,
      woreda: true,
      area: true,
    }
  });

  if (!user || !user.isActive) return null;
  return user;
}

export function setTokenCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export function clearTokenCookie() {
  const cookieStore = cookies();
  cookieStore.delete(TOKEN_NAME);
}
