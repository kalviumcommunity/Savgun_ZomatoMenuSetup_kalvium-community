import { NextResponse } from 'next/server';
import { getCategories } from '@/lib/db';

export async function GET() {
  const result = await getCategories();
  
  if (result.error) {
    return NextResponse.json({ error: result.error.message || result.error }, { status: 500 });
  }
  
  return NextResponse.json({ data: result.data, isMock: result.isMock });
}
