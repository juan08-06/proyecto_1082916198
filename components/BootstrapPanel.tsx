'use client';

import { useState } from 'react';

export default function BootstrapPanel() {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleBootstrap() {
    setLoading(true);
    setStatus(null);

    const response = await fetch('/api/bootstrap', { method: 'POST' });
    const json = await response.json();
    setLoading(false);

    if (response.ok) {
      setStatus('Bootstrap ejecutado correctamente.');
    } else {
      setStatus(json.error || 'No se pudo ejecutar el bootstrap.');
    }
  }

  return (
    <div className="rounded-[28px] border border-[#E7E5E4] bg-white p-6 shadow-sm">
      <p className="text-sm uppercase tracking-[0.28em] text-[#78716C]">Acción de bootstrap</p>
      <p className="mt-3 text-sm leading-6 text-[#1C1917]">
        Aplicará 2 migrations y cargará: 1 usuario admin y 6 productos demo del restaurante.
      </p>
      <button
        type="button"
        onClick={handleBootstrap}
        disabled={loading}
        className="mt-5 inline-flex items-center justify-center rounded-full bg-[#EA580C] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#C2410C] disabled:cursor-not-allowed disabled:bg-[#F0AB7D]"
      >
        {loading ? 'Ejecutando...' : 'Ejecutar bootstrap'}
      </button>
      {status ? <p className="mt-4 text-sm text-[#1C1917]">{status}</p> : null}
    </div>
  );
}
