import { NextResponse } from 'next/server';
import { getDishById } from '@/lib/db';

export async function GET(request, { params }) {
  const { id } = params;
  const result = await getDishById(id);
  
  if (result.error) {
    return NextResponse.json({ error: result.error.message || result.error }, { status: 500 });
  }
  
  return NextResponse.json({ data: result.data });
}
