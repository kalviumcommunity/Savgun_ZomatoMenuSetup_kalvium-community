import { NextResponse } from 'next/server';
import { updateDishPrice } from '@/lib/db';

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const { dishName, oldPrice, newPrice, actor, actorRole } = await request.json();
    
    if (newPrice === undefined) {
      return NextResponse.json({ error: "Missing required field: newPrice" }, { status: 400 });
    }
    
    const result = await updateDishPrice(id, dishName, oldPrice, newPrice, actor, actorRole);
    
    if (result.error) {
      return NextResponse.json({ error: result.error.message || result.error }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, data: result.data });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request body", details: err instanceof Error ? err.message : String(err) }, { status: 400 });
  }
}
