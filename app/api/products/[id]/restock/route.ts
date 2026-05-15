import { NextResponse } from 'next/server';
import { restockProduct } from '@/lib/dataService';
import { getCurrentUser } from '@/lib/withAuth';
import { RestockRequestSchema } from '@/lib/validators';

interface Params {
  params: {
    id: string;
  };
}

export async function PATCH(request: Request, { params }: Params) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const body = await request.json();
  const payload = RestockRequestSchema.parse(body);
  const product = await restockProduct(params.id, payload.amount, {
    id: user.id,
    name: user.name,
    role: user.role,
  });

  return NextResponse.json(product);
}
