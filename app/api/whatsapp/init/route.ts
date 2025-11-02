import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

let qrCodeData: string | null = null;
let isReady = false;

export async function POST() {
  try {
    if (isReady) {
      return NextResponse.json({ status: 'ready', connected: true });
    }

    if (qrCodeData) {
      return NextResponse.json({ qr: qrCodeData });
    }

    setTimeout(() => {
      qrCodeData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    }, 1000);

    return NextResponse.json({
      status: 'initializing',
      message: 'WhatsApp client initializing...'
    });
  } catch (error) {
    return NextResponse.json({ error: 'Initialization failed' }, { status: 500 });
  }
}
