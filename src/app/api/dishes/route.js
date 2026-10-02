// ==========================================
// 1. IMPORTS & DEPENDENCIES
// ==========================================
import { NextResponse } from 'next/server';
import { getDishes, updateDishStock } from '@/lib/db';

// ==========================================
// 2. GET HANDLER: LIST DISHES
// ==========================================
// Retrieves dishes with optional filters for categoryId and stock status
export async function GET(request) {
  // Extract search parameters from URL
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('categoryId') || undefined;
  const status = searchParams.get('status') || undefined;

  // Query database with applied filters
  const result = await getDishes({ categoryId, status });

  // Return server error if query fails
  if (result.error) {
    return NextResponse.json({ error: result.error.message || result.error }, { status: 500 });
  }

  // Return formatted dish records
  return NextResponse.json({
    data: result.data,
    isMock: result.isMock,
  });
}

// ==========================================
// 3. PATCH HANDLER: UPDATE DISH STOCK
// ==========================================
// Updates the live inventory count for a specific dish
export async function PATCH(request) {
  try {
    // Extract update payload from request body
    const { dishId, liveStock, actor } = await request.json();

    // Validate required fields
    if (!dishId || liveStock === undefined) {
      return NextResponse.json({ error: "Missing required fields: dishId, liveStock" }, { status: 400 });
    }

    // Execute stock update in database
    const result = await updateDishStock(dishId, liveStock, actor);

    // Check for database update errors
    if (result.error) {
      return NextResponse.json({ error: result.error.message || result.error }, { status: 500 });
    }

    // Return updated record
    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (err) {
    // Handle invalid JSON or malformed input
    return NextResponse.json({ error: "Invalid request body", details: err instanceof Error ? err.message : String(err) }, { status: 400 });
  }
}
