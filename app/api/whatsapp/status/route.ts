import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    connected: true,
    status: 'ready',
    message: 'WhatsApp agent IA actif'
  });
}
