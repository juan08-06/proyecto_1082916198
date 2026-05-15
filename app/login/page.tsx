'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@playaalta.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    setIsLoading(false);

    if (response.ok) {
      router.push('/inventory');
      return;
    }

    const data = await response.json();
    setError(data?.error || 'Credenciales incorrectas');
  }

  return (
    <main className={`${inter.className} min-h-screen bg-[#FEF9F0] py-10 px-4`}>
      <section className="mx-auto flex max-w-3xl flex-col gap-8 rounded-[32px] border border-orange-300 bg-white/95 p-8 shadow-xl shadow-orange-200/20 sm:p-10">
        <div className="flex flex-col gap-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border-2 border-orange-500 bg-orange-50 text-3xl text-orange-600">
            🌊
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-orange-600">Playa Alta Inventory</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">Iniciar sesión</h1>
            <p className="mt-2 text-sm text-slate-600">
              Accede con tu usuario de administrador para revisar el inventario del restaurante.
            </p>
          </div>
        </div>

        <form className="grid gap-6" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-700">Correo electrónico</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              required
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="password" className="text-sm font-medium text-slate-700">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              required
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-3xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
          >
            {isLoading ? 'Validando...' : 'Ingresar'}
          </button>
        </form>

        <div className="rounded-3xl border border-orange-100 bg-orange-50 p-4 text-sm text-slate-700">
          <p className="font-semibold text-orange-700">Nota</p>
          <p>El sistema está en modo seed. El administrador inicial está preconfigurado con los 6 productos demo.</p>
        </div>
      </section>
    </main>
  );
}
