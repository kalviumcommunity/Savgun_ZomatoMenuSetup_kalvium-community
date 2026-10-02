// ==========================================
// 1. IMPORTS & DEPENDENCIES
// ==========================================
import { NextResponse } from 'next/server';
import { togglePricingRule } from '@/lib/db';

// ==========================================
// 2. PATCH HANDLER: TOGGLE PRICING RULE
// ==========================================
// Toggles the is_active status of a pricing rule
export async function PATCH(request, { params }) {
  try {
    // Extract rule ID from path params
    const { id } = params;
    // Extract new activation flag from body
    const { isActive } = await request.json();
    
    // Validate required boolean flag
    if (isActive === undefined) {
      return NextResponse.json({ error: "Missing required field: isActive" }, { status: 400 });
    }
    
    // Update rule status in database
    const result = await togglePricingRule(id, isActive);
    
    // Handle database update errors
    if (result.error) {
      return NextResponse.json({ error: result.error.message || result.error }, { status: 500 });
    }
    
    // Return updated rule record
    return NextResponse.json({ success: true, data: result.data });
  } catch (err) {
    // Handle invalid JSON or malformed input
    return NextResponse.json({ error: "Invalid request body", details: err instanceof Error ? err.message : String(err) }, { status: 400 });
  }
}
