export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

// USER: вернём id админа как обязательного собеседника
// ADMIN: вернём список последних юзеров из сообщений
export async function GET() {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (me.role === 'USER') {
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' }, select: { id: true, loginId: true } });
    return NextResponse.json({ role: 'USER', admin });
  }

  // ADMIN
  const recent = await prisma.message.findMany({
    where: { OR: [{ fromId: me.id }, { toId: me.id }] },
    orderBy: { id: 'desc' },
    take: 300,
    select: { fromId: true, toId: true }
  });

  const set = new Set<number>();
  for (const m of recent) {
    if (m.fromId !== me.id) set.add(m.fromId);
    if (m.toId !== me.id) set.add(m.toId);
  }

  const users = await prisma.user.findMany({
    where: { id: { in: [...set] }, role: 'USER' },
    select: { id: true, adminNoteName: true, loginId: true }
  });

  return NextResponse.json({ role: 'ADMIN', users });
}
