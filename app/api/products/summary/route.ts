import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/dataService';

export async function GET() {
  const products = await getProducts();
  const alertCount = products.filter((product) => product.quantity <= product.minStock).length;
  const categoryCount = new Set(products.map((product) => product.category)).size;

  return NextResponse.json({
    totalProducts: products.length,
    alertCount,
    categoryCount,
  });
}
