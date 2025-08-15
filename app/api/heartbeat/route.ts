// app/api/heartbeat/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function POST() {
  // если не авторизован — тихо игнорируем
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ ok: true });

  // помечаем онлайн; updatedAt обновится автоматически (@updatedAt в схеме)
  await prisma.user.update({
    where: { id: me.id },
    data: { isOnline: true }
  });

  return NextResponse.json({ ok: true });
}
