'use client';

interface SeedModeBannerProps {
  message: string;
}

export default function SeedModeBanner({ message }: SeedModeBannerProps) {
  return (
    <div className="rounded-[28px] border border-[#F59E0B] bg-[#FEF3C7] px-6 py-4 text-[#92400E] shadow-sm">
      <p className="text-sm font-medium">Modo seed activo</p>
      <p className="mt-1 text-sm leading-6">{message}</p>
    </div>
  );
}
