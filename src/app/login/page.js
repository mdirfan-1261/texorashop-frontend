"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

export default function LoginRedirectPage() {
  const router = useRouter();
  const { isLoggedIn, openAuthModal } = useUser();

  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/account");
    } else {
      router.replace("/");
      openAuthModal();
    }
  }, [isLoggedIn, router, openAuthModal]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
    </div>
  );
}