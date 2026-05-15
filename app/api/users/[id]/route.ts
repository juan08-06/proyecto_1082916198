import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/withAuth';
import { assertRole } from '@/lib/withRole';
import { getSeedUserById, updateSeedUserActive } from '@/lib/seedReader';
import { listUsers } from '@/lib/dataService';
import { z } from 'zod';

const UpdateUserSchema = z.object({
  active: z.boolean(),
});

interface Params {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: Params) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  assertRole(user, ['admin']);

  const users = await listUsers();
  const candidate = users.find((candidate) => candidate.id === params.id);
  if (!candidate) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }
  return NextResponse.json(candidate);
}

export async function PUT(request: Request, { params }: Params) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  assertRole(user, ['admin']);

  const body = await request.json();
  const payload = UpdateUserSchema.parse(body);

  const target = getSeedUserById(params.id);
  if (!target) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }

  await updateSeedUserActive(params.id, payload.active);
  return NextResponse.json({ success: true, active: payload.active });
}
