import { NextResponse } from 'next/server';
import { runMigrations } from '@/lib/pgMigrate';
import { getPostgresUrl } from '@/lib/env';

export const dynamic = 'force-dynamic';

export async function POST() {
  if (!getPostgresUrl()) {
    return NextResponse.json(
      {
        status: 'seed',
        message: 'No hay DATABASE_URL configurada. El bootstrap solo está disponible en modo live.',
      },
      { status: 400 }
    );
  }

  try {
    await runMigrations();
    return NextResponse.json({ status: 'ok', message: 'Migrations aplicadas correctamente' });
  } catch (error: unknown) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
