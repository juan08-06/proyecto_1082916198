import { NextResponse } from 'next/server';
import { getLowStockProducts } from '@/lib/dataService';

export async function GET() {
  const alerts = await getLowStockProducts();
  return NextResponse.json(alerts);
}
