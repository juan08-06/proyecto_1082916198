'use client';

import { useEffect, useState } from 'react';
import type { Product } from '@/lib/types';

interface AlertBannerProps {
  refreshKey: number;
}

export default function AlertBanner({ refreshKey }: AlertBannerProps) {
  const [alerts, setAlerts] = useState<Product[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAlerts() {
      try {
        const response = await fetch('/api/products/alerts', {
          signal: controller.signal,
          cache: 'no-store',
        });

        if (!response.ok) {
          setAlerts([]);
          return;
        }

        const data = await response.json();
        setAlerts(data || []);
      } catch {
        setAlerts([]);
      }
    }

    loadAlerts();

    return () => controller.abort();
  }, [refreshKey]);

  if (alerts.length === 0) return null;

  return (
    <section className="rounded-[28px] border border-[#D97706] bg-[#FFFBEB] p-5 text-[#92400E] shadow-sm">
      <p className="font-semibold text-sm">⚠️ Productos con stock bajo:</p>
      <p className="mt-2 text-sm leading-6">
        {alerts.map((product, index) => (
          <span key={product.id}>
            {product.name} ({product.quantity} {product.unit}){index < alerts.length - 1 ? ', ' : ''}
          </span>
        ))}
      </p>
    </section>
  );
}
