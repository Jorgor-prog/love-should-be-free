export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { setAuthCookie } from '@/lib/auth'; // у тебя уже есть helper с кукой

export async function POST(req: Request) {
  const { loginId, password } = await req.json().catch(() => ({}));
  if (!loginId || !password) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { loginId: String(loginId) },
    select: {
      id: true, role: true, loginId: true,
      loginPassword: true, // видимый пароль
      passwordHash: true   // если вдруг у кого-то уже захеширован
    }
  });

  if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  // Принимаем вход, если:
  // 1) совпал видимый пароль loginPassword
  // 2) или (опционально) совпал с passwordHash — оставим простой compare, без bcrypt
  const ok =
    (user.loginPassword && password === user.loginPassword) ||
    (user.passwordHash && password === user.passwordHash);

  if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  // Ставим куку
  const res = NextResponse.json({ ok: true, user: { id: user.id, role: user.role } });
  setAuthCookie(res, JSON.stringify({ id: user.id, role: user.role })); // твой setAuthCookie кладёт токен/сессию в куку
  return res;
}
