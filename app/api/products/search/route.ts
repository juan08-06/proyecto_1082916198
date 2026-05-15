import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/dataService';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q') ?? undefined;
  const category = url.searchParams.get('category') ?? undefined;

  const products = await getProducts({ query, category });
  return NextResponse.json(products);
}
