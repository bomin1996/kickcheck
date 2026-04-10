import { NextRequest, NextResponse } from 'next/server';
import { getPriceHistory } from '@/lib/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  const productId = Number(params.productId);
  if (isNaN(productId)) {
    return NextResponse.json({ error: 'Invalid productId' }, { status: 400 });
  }

  const days = Number(request.nextUrl.searchParams.get('days') || '30');
  const data = await getPriceHistory(productId, days);

  return NextResponse.json(data);
}
