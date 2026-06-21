"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserId } from "@/lib/mockDb";

export default function ProfileRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const currentUserId = getCurrentUserId();
    router.replace(`/profiles/${currentUserId}`);
  }, [router]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 text-center space-y-4">
      <p className="text-muted-foreground text-sm">Redirecting to your profile...</p>
    </div>
  );
}
