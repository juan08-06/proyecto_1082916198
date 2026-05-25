import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Client as PgClient } from 'pg';
import {
  getSupabaseAnonKey,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
  getPostgresUrl,
} from './env';

let _adminClient: SupabaseClient | null = null;
let _anonClient: SupabaseClient | null = null;
let _adminChecked = false;
let _anonChecked = false;

export function getSupabaseClient(): SupabaseClient | null {
  if (_adminClient) return _adminClient;
  if (_adminChecked) return null;
  _adminChecked = true;

  const url = getSupabaseUrl();
  const key = getSupabaseServiceRoleKey();

  if (!url || !key) {
    console.warn('[supabase] service-role no configurado — retornando null (build-safe)');
    return null;
  }

  _adminClient = createClient(url, key, {
    auth: { persistSession: false },
  });
  return _adminClient;
}

export function getSupabaseAnonClient(): SupabaseClient | null {
  if (_anonClient) return _anonClient;
  if (_anonChecked) return null;
  _anonChecked = true;

  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();

  if (!url || !key) {
    console.warn('[supabase] anon no configurado — retornando null (build-safe)');
    return null;
  }

  _anonClient = createClient(url, key, {
    auth: { persistSession: false },
  });
  return _anonClient;
}

export function requireSupabaseClient(): SupabaseClient {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase no configurado: faltan SUPABASE_URL o SERVICE_ROLE_KEY');
  }
  return client;
}

export async function executeSql(query: string): Promise<void> {
  const connString = getPostgresUrl();
  if (!connString) {
    throw new Error('POSTGRES_URL no configurado');
  }

  const client = new PgClient({
    connectionString: connString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  try {
    await client.query(query);
  } finally {
    await client.end();
  }
}

export const supabaseClient = {
  get instance(): SupabaseClient | null {
    return getSupabaseAnonClient();
  },
};

export const supabaseAdminClient = {
  get instance(): SupabaseClient | null {
    return getSupabaseClient();
  },
};
