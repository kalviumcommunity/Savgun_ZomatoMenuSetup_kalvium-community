import { NextResponse } from 'next/server';
import { togglePricingRule } from '@/lib/db';

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const { isActive } = await request.json();
    
    if (isActive === undefined) {
      return NextResponse.json({ error: "Missing required field: isActive" }, { status: 400 });
    }
    
    const result = await togglePricingRule(id, isActive);
    
    if (result.error) {
      return NextResponse.json({ error: result.error.message || result.error }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, data: result.data });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request body", details: err instanceof Error ? err.message : String(err) }, { status: 400 });
  }
}
