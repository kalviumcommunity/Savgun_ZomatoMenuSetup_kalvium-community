import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== "https://your-project-id.supabase.co" &&
    supabaseAnonKey !== "your-anon-key-here"
);

if (!isConfigured && typeof window !== "undefined") {
  console.warn(
    "[Supabase] Environment variables NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are not configured yet. Please configure them in .env.local"
  );
}

// Client instance for public / authenticated browser requests
export const supabase = createClient(
  supabaseUrl || "https://placeholder-project.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
);

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => isConfigured;

// Admin Client (Only usable in Server Components / API Routes with Service Role Key)
export const getSupabaseAdmin = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey || serviceRoleKey === "your-service-role-key-here") {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for admin database operations"
    );
  }
  return createClient(supabaseUrl, serviceRoleKey);
};

export default supabase;
