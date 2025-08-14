export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

// Отправка сообщения
export async function POST(req: Request) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Поддержим оба варианта на вход: { toId, body } ИЛИ { toId, text }
  const payload = await req.json().catch(() => ({} as any));
  const toIdRaw = payload?.toId;
  const textInput = payload?.text ?? payload?.body;

  const toId = Number(toIdRaw);
  const text = typeof textInput === 'string' ? textInput : '';

  if (!toId || !text) {
    return NextResponse.json({ error: 'Missing' }, { status: 400 });
  }

  const msg = await prisma.message.create({
    data: { fromId: me.id, toId, text } // <-- используем поле text
  });

  return NextResponse.json({ message: msg });
}

// Получение последних сообщений (необязательно, но удобно для отладки)
export async function GET(req: Request) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const withUser = Number(url.searchParams.get('with') || 0);

  const where = withUser
    ? {
        OR: [
          { fromId: me.id, toId: withUser },
          { fromId: withUser, toId: me.id }
        ]
      }
    : {
        OR: [{ fromId: me.id }, { toId: me.id }]
      };

  const messages = await prisma.message.findMany({
    where,
    orderBy: { id: 'desc' },
    take: 50
  });

  return NextResponse.json({ messages });
}
