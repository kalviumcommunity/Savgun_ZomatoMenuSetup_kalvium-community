"use client";

// ==========================================
// 1. IMPORTS & DEPENDENCIES
// ==========================================
import { useRouter } from "next/navigation";
import ZomatoLoginModal from "@/components/ZomatoLoginModal";

// ==========================================
// 2. LOGIN PAGE COMPONENT
// ==========================================
// Displays the Zomato partner login modal and handles navigation
export default function LoginPage() {
  const router = useRouter();

  return (
    <ZomatoLoginModal
      isOpen={true}
      onClose={() => router.push("/")}
    />
  );
}
