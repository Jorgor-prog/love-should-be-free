export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  const me = await getSessionUser();
  if (!me || me.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const users = await prisma.user.findMany({
    where: { role: 'USER' }, // <-- админа не показываем
    orderBy: { id: 'desc' },
    select: {
      id: true,
      loginId: true,
      adminNoteName: true,
      profile: { select: { nameOnSite: true, idOnSite: true, residence: true, photoUrl: true } },
      codeConfig: { select: { emitIntervalSec: true, paused: true } }
    }
  });

  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const me = await getSessionUser();
  if (!me || me.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(()=>({}));
  const internalName = String(body?.adminNoteName || '').trim();

  // Пароль: буквы + цифры, 10 символов
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const rand = (n:number)=>Array.from({length:n},()=>charset[Math.floor(Math.random()*charset.length)]).join('');
  const loginId = rand(8);
  const password = rand(10);

  const created = await prisma.user.create({
    data: {
      loginId,
      loginPassword: password,
      role: 'USER',
      adminNoteName: internalName,     // <-- сохраняем как Internal name
      profile: { create: {} },
      codeConfig: { create: { code: '', emitIntervalSec: 22, paused: false } }
    },
    select: { id:true, loginId:true, loginPassword:true }
  });

  return NextResponse.json({ user: { id: created.id, loginId: created.loginId, password: created.loginPassword } });
}
