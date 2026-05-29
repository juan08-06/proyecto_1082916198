import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { assertRole } from '@/lib/withRole';
import { createProduct, getProducts } from '@/lib/dataService';
import { getCurrentUser } from '@/lib/withAuth';
import { CreateProductSchema } from '@/lib/validators';

async function handleApiError(error: unknown) {
  if (error instanceof Response) {
    const message = (await error.text()) || error.statusText || 'Solicitud invalida';
    return NextResponse.json({ error: message }, { status: error.status });
  }

  if (error instanceof ZodError) {
    return NextResponse.json({ error: 'Datos invalidos para el producto.' }, { status: 400 });
  }

  return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q') ?? undefined;
  const category = url.searchParams.get('category') ?? undefined;

  const products = await getProducts({ query, category });
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    assertRole(user, ['admin']);

    const body = await request.json();
    const payload = CreateProductSchema.parse(body);
    const product = await createProduct(payload);

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
