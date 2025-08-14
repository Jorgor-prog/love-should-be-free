export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { action } = await req.json();
  if (!['pause','start'].includes(action)) {
    return NextResponse.json({ error: 'Bad action' }, { status: 400 });
  }

  await prisma.codeConfig.update({
    where: { userId: me.id },
    data: { paused: action === 'pause' }
  });

  return NextResponse.json({ ok: true, paused: action === 'pause' });
}
