import { NextResponse } from 'next/server';
import { searchPatterns } from '@/lib/orama';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json(
      { success: false, error: 'Missing ?q= query parameter' },
      { status: 400 }
    );
  }

  try {
    const result = await searchPatterns(q);
    return NextResponse.json({
      success: true,
      hits: result.hits.map((hit) => hit.document),
    });
  } catch (err) {
    console.error('Search failed:', err);
    return NextResponse.json(
      { success: false, error: 'Search failed' },
      { status: 500 }
    );
  }
}
