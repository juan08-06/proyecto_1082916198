import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/withAuth';
import { assertRole } from '@/lib/withRole';
import { listAuditMonth } from '@/lib/dataService';

export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  assertRole(user, ['admin']);

  const url = new URL(request.url);
  const month = url.searchParams.get('month') ?? new Date().toISOString().slice(0, 7);
  const entries = await listAuditMonth(month.replace('-', ''));
  return NextResponse.json(entries);
}
