import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { getCurrentUser } from '@/lib/withAuth';
import { assertRole } from '@/lib/withRole';
import { createUser, listUsers } from '@/lib/dataService';
import { hashPassword } from '@/lib/auth';
import { z } from 'zod';

const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['admin', 'empleado']),
});

function generateTemporaryPassword() {
  return Buffer.from(randomBytes(9)).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  assertRole(user, ['admin']);

  const users = await listUsers();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  assertRole(user, ['admin']);

  const body = await request.json();
  const payload = CreateUserSchema.parse(body);

  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await hashPassword(temporaryPassword);

  const created = await createUser({
    name: payload.name.trim(),
    email: payload.email.toLowerCase().trim(),
    role: payload.role,
    passwordHash,
    mustChangePassword: true,
  });

  return NextResponse.json({
    id: created.id,
    name: created.name,
    email: created.email,
    role: created.role,
    active: created.active,
    temporaryPassword,
  }, { status: 201 });
}
