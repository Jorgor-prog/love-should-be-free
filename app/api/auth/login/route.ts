export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

function setSessionCookie(res: NextResponse, userId: number) {
  const token = Buffer.from(JSON.stringify({ id: userId })).toString('base64');
  res.cookies.set('lsbf_token', token, {
    httpOnly: true, sameSite: 'lax', path: '/', secure: true, maxAge: 60*60*24*7
  });
}

export async function POST(req: Request) {
  const { loginId, password } = await req.json().catch(() => ({} as any));
  if (!loginId || !password) return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { loginId: String(loginId) },
    select: { id:true, role:true, loginPassword:true, passwordHash:true }
  });
  if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  let ok = false;

  // Обычные пользователи: loginPassword (простой текст)
  if (user.loginPassword && password === user.loginPassword) ok = true;

  // Админ (и любые хэшированные): bcrypt hash
  if (!ok && user.passwordHash) ok = await bcrypt.compare(password, user.passwordHash);

  if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  // Ставим куку только с id, роль не кладём
  const res = NextResponse.json({ ok: true });
  setSessionCookie(res, user.id);
  return res;
}
