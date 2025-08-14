
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken, setAuthCookie } from '@/lib/auth';

export async function POST(req: Request) {
  const { loginId, password } = await req.json();
  if (!loginId || !password) return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { loginId } });
  if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  await prisma.user.update({ where: { id: user.id }, data: { isOnline: true }});
  const token = signToken({ id: user.id, role: user.role });
  const res = NextResponse.json({ ok: true, role: user.role });
  setAuthCookie(res, token);
  return res;
}
