'use client';

import { useEffect } from 'react';

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#FEF9F0] px-4 py-16">
      <div className="mx-auto max-w-3xl rounded-[32px] border border-[#E7E5E4] bg-white p-10 text-center shadow-sm">
        <p className="text-sm uppercase tracking-[0.28em] text-[#EA580C]">Error</p>
        <h1 className="mt-4 text-3xl font-semibold text-[#1C1917]">Algo salió mal</h1>
        <p className="mt-4 text-sm leading-6 text-[#78716C]">Intenta recargar la página o vuelve más tarde. Si el problema persiste, contacta al administrador.</p>
        <button
          type="button"
          onClick={reset}
          className="mt-8 rounded-full bg-[#EA580C] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#C2410C]"
        >
          Recargar
        </button>
      </div>
    </main>
  );
}
