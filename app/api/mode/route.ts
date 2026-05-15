import { NextResponse } from 'next/server';
import { getSystemMode } from '@/lib/dataService';

export async function GET() {
  return NextResponse.json({ mode: getSystemMode() });
}
