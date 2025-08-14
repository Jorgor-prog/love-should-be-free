
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: Request) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const withId = Number(searchParams.get('with'));
  if (!withId) return NextResponse.json({ error: 'Missing with' }, { status: 400 });
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { fromId: me.id, toId: withId },
        { fromId: withId, toId: me.id }
      ]
    },
    orderBy: { createdAt: 'asc' }
  });
  return NextResponse.json({ messages });
}

export async function POST(req: Request) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { toId, body } = await req.json();
  if (!toId || !body) return NextResponse.json({ error: 'Missing' }, { status: 400 });
  const msg = await prisma.message.create({ data: { fromId: me.id, toId, body } });
  return NextResponse.json({ message: msg });
}
