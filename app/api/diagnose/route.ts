import { NextResponse } from 'next/server';
import { getSystemMode, getProducts } from '@/lib/dataService';
import { getSeedUsers } from '@/lib/seedReader';

export async function GET() {
  const mode = getSystemMode();
  const products = await getProducts();
  const users = getSeedUsers();

  return NextResponse.json({
    mode,
    productsCount: products.length,
    seedUsers: users.map((user) => ({ email: user.email, role: user.role, active: user.active })),
    hasDatabase: Boolean(process.env.DATABASE_URL),
  });
}
