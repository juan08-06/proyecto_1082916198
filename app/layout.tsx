import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ToastProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Playa Alta Inventory',
  description: 'Control de inventario para el restaurante Playa Alta',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.className}>
      <body className="min-h-screen bg-[#FEF9F0] text-[#1C1917] antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
