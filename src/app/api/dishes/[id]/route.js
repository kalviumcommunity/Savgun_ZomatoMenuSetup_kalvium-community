// ==========================================
// 1. IMPORTS & DEPENDENCIES
// ==========================================
import { NextResponse } from 'next/server';
import { getDishById } from '@/lib/db';

// ==========================================
// 2. GET HANDLER: FETCH SINGLE DISH
// ==========================================
// Retrieves details of a specific dish by its unique ID
export async function GET(request, { params }) {
  // Extract ID from dynamic route parameters
  const { id } = params;
  const result = await getDishById(id);
  
  // Handle database errors
  if (result.error) {
    return NextResponse.json({ error: result.error.message || result.error }, { status: 500 });
  }
  
  // Return dish data
  return NextResponse.json({ data: result.data });
}
