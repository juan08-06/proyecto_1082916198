import InventoryShell from '@/components/InventoryShell';
import { getProducts } from '@/lib/dataService';
import { requireAuth } from '@/lib/withAuth';

export default async function InventoryPage() {
  const user = await requireAuth();
  const products = await getProducts();

  return <InventoryShell user={user} initialProducts={products} />;
}
