import { NextResponse } from 'next/server';
import { getSystemMode, getProducts } from '@/lib/dataService';
import { getSeedUsers } from '@/lib/seedReader';
import {
  getPostgresUrl,
  getSupabaseUrl,
  getSupabaseAnonKey,
  getSupabaseServiceRoleKey,
  getJwtSecret,
} from '@/lib/env';

export const dynamic = 'force-dynamic';

export async function GET() {
  const mode = getSystemMode();
  const products = await getProducts();
  const users = getSeedUsers();

  return NextResponse.json({
    mode,
    productsCount: products.length,
    seedUsers: users.map((user) => ({ email: user.email, role: user.role, active: user.active })),
    env: {
      hasPostgresUrl: Boolean(getPostgresUrl()),
      hasSupabaseUrl: Boolean(getSupabaseUrl()),
      hasSupabaseAnonKey: Boolean(getSupabaseAnonKey()),
      hasSupabaseServiceRoleKey: Boolean(getSupabaseServiceRoleKey()),
      hasJwtSecret: Boolean(getJwtSecret()),
    },
  });
}
