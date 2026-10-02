// ==========================================
// 1. IMPORTS & DEPENDENCIES
// ==========================================
import { NextResponse } from 'next/server';
import { getPricingRules, createPricingRule } from '@/lib/db';

// ==========================================
// 2. GET HANDLER: FETCH PRICING RULES
// ==========================================
// Retrieves all dynamic pricing rules and linked dish metadata
export async function GET() {
  const result = await getPricingRules();
  
  // Handle database query errors
  if (result.error) {
    return NextResponse.json({ error: result.error.message || result.error }, { status: 500 });
  }
  
  // Return list of pricing rules
  return NextResponse.json({ data: result.data, isMock: result.isMock });
}

// ==========================================
// 3. POST HANDLER: CREATE PRICING RULE
// ==========================================
// Inserts a new pricing rule into the database
export async function POST(request) {
  try {
    // Parse pricing rule payload
    const body = await request.json();
    const result = await createPricingRule(body);
    
    // Handle database insertion errors
    if (result.error) {
      return NextResponse.json({ error: result.error.message || result.error }, { status: 500 });
    }
    
    // Return created rule with 201 Created status
    return NextResponse.json({ success: true, data: result.data }, { status: 201 });
  } catch (err) {
    // Handle invalid JSON payload
    return NextResponse.json({ error: "Invalid request body", details: err instanceof Error ? err.message : String(err) }, { status: 400 });
  }
}
