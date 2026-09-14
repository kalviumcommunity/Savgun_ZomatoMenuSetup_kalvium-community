import { NextResponse } from 'next/server';
import { getDishes, updateDishStock } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('categoryId') || undefined;
  const status = searchParams.get('status') || undefined;

  const result = await getDishes({ categoryId, status });

  if (result.error) {
    return NextResponse.json({ error: result.error.message || result.error }, { status: 500 });
  }

  return NextResponse.json({
    data: result.data,
    isMock: result.isMock,
  });
}

export async function PATCH(request) {
  try {
    const { dishId, liveStock, actor } = await request.json();

    if (!dishId || liveStock === undefined) {
      return NextResponse.json({ error: "Missing required fields: dishId, liveStock" }, { status: 400 });
    }

    const result = await updateDishStock(dishId, liveStock, actor);

    if (result.error) {
      return NextResponse.json({ error: result.error.message || result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request body", details: err instanceof Error ? err.message : String(err) }, { status: 400 });
  }
}
