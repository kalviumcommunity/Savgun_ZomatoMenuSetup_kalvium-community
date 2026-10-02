// ==========================================
// 1. IMPORTS & DEPENDENCIES
// ==========================================
import { NextResponse } from 'next/server';
import { getCategories } from '@/lib/db';

// ==========================================
// 2. GET HANDLER: FETCH CATEGORIES
// ==========================================
// Retrieves all dish categories ordered by sort sequence
export async function GET() {
  // Query categories from database
  const result = await getCategories();
  
  // Return error response on failure
  if (result.error) {
    return NextResponse.json({ error: result.error.message || result.error }, { status: 500 });
  }
  
  // Return list of categories
  return NextResponse.json({ data: result.data, isMock: result.isMock });
}
