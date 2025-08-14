
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

const COOKIE = 'lsbf_token';

export function signToken(payload: any) {
  const secret = process.env.JWT_SECRET || 'dev_secret';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
  const secret = process.env.JWT_SECRET || 'dev_secret';
  try { return jwt.verify(token, secret) as any; } catch { return null; }
}

export async function getSessionUser() {
  const c = cookies();
  const token = c.get(COOKIE)?.value;
  if (!token) return null;
  const data = verifyToken(token);
  if (!data) return null;
  const user = await prisma.user.findUnique({ where: { id: data.id }, include: { profile: true, codeConfig: true } });
  return user;
}

export function setAuthCookie(res: NextResponse, token: string) {
  res.cookies.set(COOKIE, token, { httpOnly: true, sameSite: 'lax', path: '/' });
}

export function clearAuthCookie(res: NextResponse) {
  res.cookies.set(COOKIE, '', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 0 });
}
