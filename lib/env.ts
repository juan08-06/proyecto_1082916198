function pick(...names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name];
    if (value && value.length > 0) return value;
  }
  return undefined;
}

export function getSupabaseUrl(): string | undefined {
  return pick(
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_PLAYAALTA_PLAYAALTASUPABASE_URL',
    'NEXT_PUBLIC_PLAYAALTA_SUPABASE_URL',
    'PLAYAALTA_SUPABASE_URL',
  );
}

export function getSupabaseAnonKey(): string | undefined {
  return pick(
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_PLAYAALTA_PLAYAALTASUPABASE_ANON_KEY',
    'NEXT_PUBLIC_PLAYAALTA_SUPABASE_ANON_KEY',
    'PLAYAALTA_SUPABASE_ANON_KEY',
  );
}

export function getSupabaseServiceRoleKey(): string | undefined {
  return pick(
    'SUPABASE_SERVICE_ROLE_KEY',
    'PLAYAALTA_SUPABASE_SERVICE_ROLE_KEY',
  );
}

export function getPostgresUrl(): string | undefined {
  const raw = pick(
    'DATABASE_URL',
    'POSTGRES_URL',
    'PLAYAALTA_POSTGRES_URL',
    'PLAYAALTA_POSTGRES_PRISMA_URL',
    'PLAYAALTA_POSTGRES_URL_NON_POOLING',
  );
  if (!raw) return undefined;
  // pg v8 interpreta sslmode=require como verify-full y falla con el
  // certificado intermedio de Supabase. uselibpqcompat=true restablece la
  // semántica clásica de libpq.
  return raw.includes('uselibpqcompat=')
    ? raw
    : raw + (raw.includes('?') ? '&' : '?') + 'uselibpqcompat=true';
}

export function getJwtSecret(): string | undefined {
  return pick(
    'JWT_SECRET',
    'PLAYAALTA_SUPABASE_JWT_SECRET',
  );
}

export function getSystemMode(): 'live' | 'seed' {
  const explicit = process.env.SYSTEM_MODE;
  if (explicit === 'live' || explicit === 'seed') return explicit;
  return getPostgresUrl() ? 'live' : 'seed';
}
