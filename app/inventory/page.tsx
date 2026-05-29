import InventoryShell from '@/components/InventoryShell';
import { getProducts, getSystemMode } from '@/lib/dataService';
import { requireAuth } from '@/lib/withAuth';

export default async function InventoryPage() {
  const user = await requireAuth();
  const products = await getProducts();
  const systemMode = getSystemMode();

  return <InventoryShell user={user} initialProducts={products} systemMode={systemMode} />;
}
