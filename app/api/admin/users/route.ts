export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  const me = await getSessionUser();
  if (!me || me.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const users = await prisma.user.findMany({
    orderBy: { id: 'desc' },
    select: {
      id: true,
      loginId: true,
      role: true,
      profile: { select: { nameOnSite: true, idOnSite: true, residence: true, photoUrl: true } }
    }
  });

  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const me = await getSessionUser();
  if (!me || me.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(()=>({}));
  const internalName = body?.adminNoteName || '';

  // генерим логин/пароль
  const rand = (n:number)=>Array.from({length:n},()=>Math.floor(Math.random()*10)).join('');
  const loginId = rand(8);
  const password = rand(8);

  const user = await prisma.user.create({
    data: {
      loginId,
      password,           // чтобы админ видел текущий пароль
      role: 'USER',
      adminNoteName: internalName,
      profile: { create: {} },
      codeConfig: { create: { code: '', emitIntervalSec: 22, paused: false } }
    },
    select: { id:true, loginId:true, password:true }
  });

  return NextResponse.json({ user });
}
