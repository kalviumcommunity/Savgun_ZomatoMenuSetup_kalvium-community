"use client";

import { useRouter } from "next/navigation";
import ZomatoLoginModal from "@/components/ZomatoLoginModal";

export default function LoginPage() {
  const router = useRouter();

  return (
    <ZomatoLoginModal
      isOpen={true}
      onClose={() => router.push("/")}
    />
  );
}
