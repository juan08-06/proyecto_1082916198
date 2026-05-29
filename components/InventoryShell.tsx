'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Product, UserRole } from '@/lib/types';
import AlertBanner from './AlertBanner';
import SummaryPanel from './SummaryPanel';
import SearchBar from './SearchBar';
import CategoryFilter from './CategoryFilter';
import ProductCard from './ProductCard';
import Sidebar from './Sidebar';
import SeedModeBanner from './SeedModeBanner';
import ProductForm from './ProductForm';
import RestockModal from './RestockModal';

interface InventoryShellProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  initialProducts: Product[];
  systemMode: 'seed' | 'live';
}

export default function InventoryShell({ user, initialProducts, systemMode }: InventoryShellProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [restockTarget, setRestockTarget] = useState<Product | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const query = new URLSearchParams();
        if (searchTerm.trim()) query.set('q', searchTerm.trim());
        if (selectedCategory && selectedCategory !== 'Todas') query.set('category', selectedCategory);

        const url = `/api/products${query.toString() ? `?${query.toString()}` : ''}`;
        const response = await fetch(url, { cache: 'no-store' });

        if (!response.ok) {
          throw new Error('No se pudieron cargar los productos.');
        }

        const data = (await response.json()) as Product[];
        setProducts(data);
      } catch (error) {
        setErrorMessage((error as Error).message || 'Error al cargar los productos.');
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, [searchTerm, selectedCategory, refreshKey]);

  const alertProducts = useMemo(
    () => products.filter((product) => product.quantity <= product.minStock),
    [products]
  );

  const categoryCount = useMemo(
    () => new Set(products.map((product) => product.category)).size,
    [products]
  );

  const openCreateProduct = () => {
    setFormMode('create');
    setActiveProduct(null);
    setIsFormOpen(true);
  };

  const openEditProduct = (product: Product) => {
    setFormMode('edit');
    setActiveProduct(product);
    setIsFormOpen(true);
  };

  const openRestockModal = (product: Product) => {
    setRestockTarget(product);
  };

  const closeModals = () => {
    setIsFormOpen(false);
    setActiveProduct(null);
    setRestockTarget(null);
  };

  const refreshProducts = () => setRefreshKey((current) => current + 1);

  const extractErrorMessage = async (response: Response, fallback: string) => {
    try {
      const data = await response.json() as { error?: string };
      if (data?.error) return data.error;
    } catch {
      // ignore json parsing errors and fallback to text
    }

    try {
      const text = await response.text();
      if (text) return text;
    } catch {
      // ignore text parsing errors and keep fallback
    }

    return fallback;
  };

  const handleSaveProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      const method = formMode === 'create' ? 'POST' : 'PUT';
      const endpoint = formMode === 'create' ? '/api/products' : `/api/products/${activeProduct?.id}`;
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorMessage = await extractErrorMessage(response, 'No se pudo guardar el producto.');
        throw new Error(errorMessage);
      }

      closeModals();
      refreshProducts();
    } catch (error) {
      throw new Error((error as Error).message || 'No se pudo guardar el producto.');
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    const confirmed = window.confirm(`¿Eliminar ${product.name}? Esta acción no se puede deshacer.`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorMessage = await extractErrorMessage(response, 'No se pudo eliminar el producto.');
        throw new Error(errorMessage);
      }

      refreshProducts();
    } catch (error) {
      setErrorMessage((error as Error).message || 'No se pudo eliminar el producto.');
    }
  };

  const handleRestockProduct = async (amount: number) => {
    if (!restockTarget) return;

    try {
      const response = await fetch(`/api/products/${restockTarget.id}/restock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorMessage = await extractErrorMessage(response, 'No se pudo registrar la entrada.');
        throw new Error(errorMessage);
      }

      closeModals();
      refreshProducts();
    } catch (error) {
      setErrorMessage((error as Error).message || 'No se pudo registrar la entrada.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FEF9F0] py-8">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 xl:grid-cols-[280px_1fr]">
        <Sidebar role={user.role} />

        <main className="space-y-6">
          <div className="space-y-6 rounded-[32px] border border-[#E7E5E4] bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-[#EA580C]">Inventario</p>
                <h1 className="mt-2 text-4xl font-semibold text-[#1C1917]">Hola, {user.name}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#78716C]">
                  Controla el stock del restaurante con una sola pantalla. Busca, filtra y revisa las alertas desde el primer vistazo.
                </p>
              </div>
              <div className="rounded-3xl border border-[#E7E5E4] bg-[#FEF3C7] px-5 py-4 text-sm font-semibold text-[#92400E] shadow-sm">
                role: {user.role}
              </div>
            </div>

            {systemMode === 'seed' ? (
              <SeedModeBanner message="El modo seed está activo y muestra los 6 productos demo con Sal en alerta." />
            ) : null}
          </div>

          <AlertBanner refreshKey={refreshKey} />

          <SummaryPanel totalProducts={products.length} alertCount={alertProducts.length} categoryCount={categoryCount} />

          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <SearchBar value={searchTerm} onSearch={setSearchTerm} />
            {user.role === 'admin' ? (
              <button
                type="button"
                onClick={openCreateProduct}
                className="inline-flex items-center justify-center rounded-full bg-[#EA580C] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#C2410C]"
              >
                ➕ Agregar Producto
              </button>
            ) : null}
          </div>

          <CategoryFilter selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

          {errorMessage ? (
            <div className="rounded-[28px] border border-[#FECACA] bg-[#FEF2F2] p-4 text-sm text-[#B91C1C]">
              {errorMessage}
            </div>
          ) : null}

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isAdmin={user.role === 'admin'}
                onEdit={openEditProduct}
                onDelete={handleDeleteProduct}
                onRestock={openRestockModal}
              />
            ))}
          </div>

          {isLoading ? (
            <div className="rounded-[28px] border border-[#E7E5E4] bg-white p-8 text-center text-[#78716C]">
              Cargando productos...
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-[28px] border border-[#E7E5E4] bg-white p-8 text-center text-[#78716C]">
              No se encontraron productos con los criterios actuales.
            </div>
          ) : null}

          {isFormOpen ? (
            <ProductForm
              product={activeProduct ?? undefined}
              onClose={closeModals}
              onSave={handleSaveProduct}
            />
          ) : null}

          {restockTarget ? (
            <RestockModal
              product={restockTarget}
              onClose={closeModals}
              onSave={handleRestockProduct}
            />
          ) : null}
        </main>
      </div>
    </div>
  );
}
