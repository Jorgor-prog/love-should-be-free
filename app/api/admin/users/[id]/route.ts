export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(_: Request, { params }:{ params:{ id:string } }) {
  const me = await getSessionUser();
  if (!me || me.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = Number(params.id);
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      loginId: true,
      password: true, // важно: показываем админке
      role: true,
      adminNoteName: true,
      profile: { select: { nameOnSite: true, idOnSite: true, residence: true, photoUrl: true } },
      codeConfig: { select: { code: true, emitIntervalSec: true, paused: true } }
    }
  });

  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ user });
}

export async function PUT(req: Request, { params }:{ params:{ id:string } }) {
  const me = await getSessionUser();
  if (!me || me.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = Number(params.id);
  const body = await req.json().catch(()=> ({} as any));
  const { adminNoteName, code, emitIntervalSec, profile, paused, expiresAt } = body;

  if (adminNoteName !== undefined) {
    await prisma.user.update({ where: { id }, data: { adminNoteName } });
  }
  if (profile) {
    await prisma.profile.upsert({
      where: { userId: id },
      update: { nameOnSite: profile.nameOnSite||'', idOnSite: profile.idOnSite||'', residence: profile.residence||'' },
      create: { userId: id, nameOnSite: profile.nameOnSite||'', idOnSite: profile.idOnSite||'', residence: profile.residence||'' }
    });
  }
  if (code !== undefined || emitIntervalSec !== undefined || paused !== undefined || expiresAt !== undefined) {
    await prisma.codeConfig.upsert({
      where: { userId: id },
      update: {
        code: code !== undefined ? String(code) : undefined,
        emitIntervalSec: emitIntervalSec !== undefined ? Number(emitIntervalSec) : undefined,
        paused: paused !== undefined ? !!paused : undefined,
        // expiresAt можно добавить позже, если используешь
      },
      create: {
        userId: id,
        code: String(code || ''),
        emitIntervalSec: Number(emitIntervalSec || 22),
        paused: !!paused
      }
    });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }:{ params:{ id:string } }) {
  const me = await getSessionUser();
  if (!me || me.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = Number(params.id);
  await prisma.message.deleteMany({ where: { OR: [{ fromId: id }, { toId: id }] } });
  await prisma.profile.deleteMany({ where: { userId: id } });
  await prisma.codeConfig.deleteMany({ where: { userId: id } });
  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
