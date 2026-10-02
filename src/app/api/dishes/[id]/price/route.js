// ==========================================
// 1. IMPORTS & DEPENDENCIES
// ==========================================
import { NextResponse } from 'next/server';
import { updateDishPrice } from '@/lib/db';

// ==========================================
// 2. PATCH HANDLER: UPDATE DISH PRICE
// ==========================================
// Updates base price for a dish and appends an audit log entry
export async function PATCH(request, { params }) {
  try {
    // Extract dish ID from route parameters
    const { id } = params;
    // Extract price change details from payload
    const { dishName, oldPrice, newPrice, actor, actorRole } = await request.json();
    
    // Validate required price field
    if (newPrice === undefined) {
      return NextResponse.json({ error: "Missing required field: newPrice" }, { status: 400 });
    }
    
    // Execute price update and record audit log
    const result = await updateDishPrice(id, dishName, oldPrice, newPrice, actor, actorRole);
    
    // Check for database update errors
    if (result.error) {
      return NextResponse.json({ error: result.error.message || result.error }, { status: 500 });
    }
    
    // Return updated dish data
    return NextResponse.json({ success: true, data: result.data });
  } catch (err) {
    // Handle invalid request body
    return NextResponse.json({ error: "Invalid request body", details: err instanceof Error ? err.message : String(err) }, { status: 400 });
  }
}
