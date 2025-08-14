export const runtime = 'nodejs';

import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: Request) {
  const me = await getSessionUser();
  if (!me) return new Response('Unauthorized', { status: 401 });

  const userId = me.role === 'ADMIN'
    ? Number(new URL(req.url).searchParams.get('userId') || me.id)
    : me.id;

  const u = await prisma.user.findUnique({ where: { id: userId }, include: { codeConfig:true } });
  if (!u?.codeConfig) return new Response('No code', { status: 404 });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data:string) => controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      const code = u.codeConfig.code || '';
      let idx = 0;

      send(JSON.stringify({ type:'meta', length: code.length }));

      while (idx < code.length) {
        const fresh = await prisma.codeConfig.findUnique({
          where: { userId },
          select: { emitIntervalSec: true, paused: true }
        });

        if (fresh?.paused) {
          await new Promise(r => setTimeout(r, 500)); // мягкая пауза
          continue;
        }

        const interval = Math.max(1, fresh?.emitIntervalSec || 22);
        send(JSON.stringify({ type:'char', value: code[idx] }));
        idx++;
        await new Promise(r => setTimeout(r, interval * 1000));
      }
      controller.close();
    }
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' }
  });
}
