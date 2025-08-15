export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

// GET /api/chat?with=123 — сообщения между мной и собеседником
// GET /api/chat        — последние 50 моих вход/исход
export async function GET(req: Request) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const withId = Number(url.searchParams.get('with') || 0);

  const where = withId
    ? { OR: [{ fromId: me.id, toId: withId }, { fromId: withId, toId: me.id }] }
    : { OR: [{ fromId: me.id }, { toId: me.id }] };

  const messages = await prisma.message.findMany({
    where,
    orderBy: { id: 'asc' },
    take: 200
  });

  return NextResponse.json({ messages });
}

// POST /api/chat  body: { toId:number, text:string }
export async function POST(req: Request) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = await req.json().catch(() => ({} as any));
  const toId = Number(payload?.toId);
  const text = String(payload?.text ?? '').trim();
  if (!toId || !text) return NextResponse.json({ error: 'Missing' }, { status: 400 });

  const msg = await prisma.message.create({ data: { fromId: me.id, toId, text } });
  return NextResponse.json({ message: msg });
}
