export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Если у тебя есть свой helper setAuthCookie — можешь использовать.
// Здесь ставлю куку напрямую.
function setSessionCookie(res: NextResponse, payload: any) {
  const token = Buffer.from(JSON.stringify(payload)).toString('base64');
  res.cookies.set('lsbf_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: true,
    maxAge: 60 * 60 * 24 * 7 // 7 дней
  });
}

export async function POST(req: Request) {
  const { loginId, password } = await req.json().catch(() => ({} as any));
  if (!loginId || !password) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { loginId: String(loginId) },
    select: {
      id: true,
      role: true,
      loginId: true,
      loginPassword: true, // «видимый» пароль для USER-ов
      passwordHash: true   // bcrypt-хэш для ADMIN (и, возможно, для кого-то ещё)
    }
  });

  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // 1) если есть loginPassword (для созданных в админке USER-ов) — сверяем в лоб
  let ok = !!user.loginPassword && password === user.loginPassword;

  // 2) если есть passwordHash — сверяем через bcrypt (админ)
  if (!ok && user.passwordHash) {
    try {
      ok = await bcrypt.compare(password, user.passwordHash);
    } catch {
      ok = false;
    }
  }

  if (!ok) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true, user: { id: user.id, role: user.role } });
  setSessionCookie(res, { id: user.id, role: user.role });
  return res;
}
