import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

type SessionUser = { id: number; role: 'ADMIN' | 'USER'; loginId: string };

export async function getSessionUser(): Promise<SessionUser | null> {
  const raw = cookies().get('lsbf_token')?.value;
  if (!raw) return null;
  let payload: any;
  try { payload = JSON.parse(Buffer.from(raw, 'base64').toString('utf8')); }
  catch { return null; }
  const id = Number(payload?.id);
  if (!id) return null;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true, loginId: true }
  });
  return user as SessionUser | null;
}

// опционально, если где-то нужно строго проверять роль
export async function requireAdmin() {
  const u = await getSessionUser();
  if (!u || u.role !== 'ADMIN') return null;
  return u;
}

export async function requireUser() {
  const u = await getSessionUser();
  if (!u) return null;
  return u;
}
