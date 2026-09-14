import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export async function GET() {
  const configured = isSupabaseConfigured();

  if (!configured) {
    return NextResponse.json({
      status: "unconfigured",
      message: "Supabase environment variables are not yet configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local",
      supabaseUrlSet: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      supabaseKeySet: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    }, { status: 200 });
  }

  try {
    const { data, error, count } = await supabase
      .from("dishes")
      .select("id, name, live_stock, zomato_status", { count: "exact" })
      .limit(5);

    if (error) {
      return NextResponse.json({
        status: "error",
        message: "Connected to Supabase, but encountered an error querying the dishes table.",
        error: error.message,
        hint: "Make sure you have run supabase/schema.sql in your Supabase SQL Editor.",
      }, { status: 500 });
    }

    return NextResponse.json({
      status: "healthy",
      message: "Successfully connected to Supabase PostgreSQL database!",
      dishesCount: count,
      sampleData: data,
    }, { status: 200 });
  } catch (err) {
    return NextResponse.json({
      status: "connection_failed",
      message: "Failed to connect to Supabase endpoint.",
      error: err instanceof Error ? err.message : String(err),
    }, { status: 500 });
  }
}
