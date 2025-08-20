import { getDB } from '@/lib/orama';
import { NextResponse } from 'next/server';

export async function GET() {
  const db = await getDB();
  const allDocs = Object.values(db.data.docs);

  return NextResponse.json(allDocs);
}
