export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ items: [], latestId: 0 });

  const msgs = await prisma.message.findMany({
    where: { toId: me.id },
    orderBy: { id: 'desc' },
    take: 100
  });

  const map: Record<number, { fromId:number; lastId:number; lastAt:string }> = {};
  let latestId = 0;
  for(const m of msgs){
    if(!map[m.fromId]) map[m.fromId] = { fromId:m.fromId, lastId:m.id, lastAt:m.createdAt.toISOString() };
    if(m.id > latestId) latestId = m.id;
  }
  return NextResponse.json({ items: Object.values(map), latestId });
}
