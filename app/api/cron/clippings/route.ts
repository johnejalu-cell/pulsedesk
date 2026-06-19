import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 300;

export async function GET(request: NextRequest) {
  // Verify this is called by Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/clippings/send`, {
      method: 'POST',
      headers: {
        'authorization': `Bearer ${process.env.CRON_SECRET}`,
        'content-type': 'application/json',
      },
    });

    const result = await response.json();
    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
