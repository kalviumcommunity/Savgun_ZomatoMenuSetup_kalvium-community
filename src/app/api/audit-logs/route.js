// ==========================================
// 1. IMPORTS & DEPENDENCIES
// ==========================================
import { NextResponse } from 'next/server';
import { getAuditLogs, recordAuditLog } from '@/lib/db';

// ==========================================
// 2. GET HANDLER: FETCH AUDIT LOGS
// ==========================================
// Retrieves recent audit log entries with an optional query parameter `limit`
export async function GET(request) {
  // Parse query parameters from request URL
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit'), 10) : 20;
  
  // Fetch logs from database
  const result = await getAuditLogs(limit);
  
  // Return error response if query fails
  if (result.error) {
    return NextResponse.json({ error: result.error.message || result.error }, { status: 500 });
  }
  
  // Return audit log list
  return NextResponse.json({ data: result.data, isMock: result.isMock });
}

// ==========================================
// 3. POST HANDLER: RECORD AUDIT LOG
// ==========================================
// Creates and stores a new audit log record
export async function POST(request) {
  try {
    // Parse JSON payload from request body
    const body = await request.json();
    const result = await recordAuditLog(body);
    
    // Return database insertion error if encountered
    if (result.error) {
      return NextResponse.json({ error: result.error.message || result.error }, { status: 500 });
    }
    
    // Return success response with newly created log
    return NextResponse.json({ success: true, data: result.data }, { status: 201 });
  } catch (err) {
    // Handle invalid JSON or malformed payload
    return NextResponse.json({ error: "Invalid request body", details: err instanceof Error ? err.message : String(err) }, { status: 400 });
  }
}
