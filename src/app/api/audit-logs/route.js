import { NextResponse } from 'next/server';
import { getAuditLogs, recordAuditLog } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit'), 10) : 20;
  
  const result = await getAuditLogs(limit);
  
  if (result.error) {
    return NextResponse.json({ error: result.error.message || result.error }, { status: 500 });
  }
  
  return NextResponse.json({ data: result.data, isMock: result.isMock });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await recordAuditLog(body);
    
    if (result.error) {
      return NextResponse.json({ error: result.error.message || result.error }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, data: result.data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request body", details: err instanceof Error ? err.message : String(err) }, { status: 400 });
  }
}
