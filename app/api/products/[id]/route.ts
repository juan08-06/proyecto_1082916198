import { NextResponse } from 'next/server';
import { assertRole } from '@/lib/withRole';
import { deleteProduct, getProductById, updateProduct } from '@/lib/dataService';
import { getCurrentUser } from '@/lib/withAuth';
import { UpdateProductSchema } from '@/lib/validators';

interface Params {
  params: {
    id: string;
  };
}

export async function GET(_request: Request, { params }: Params) {
  const product = await getProductById(params.id);
  if (!product) {
    return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
  }
  return NextResponse.json(product);
}

export async function PUT(request: Request, { params }: Params) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  assertRole(user, ['admin']);

  const body = await request.json();
  const payload = UpdateProductSchema.parse(body);
  const product = await updateProduct(params.id, payload);

  return NextResponse.json(product);
}

export async function DELETE(request: Request, { params }: Params) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  assertRole(user, ['admin']);

  await deleteProduct(params.id);
  return NextResponse.json({ success: true });
}
