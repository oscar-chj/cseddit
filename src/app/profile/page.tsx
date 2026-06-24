"use client"

import { getCurrentUserId } from "@/lib/mockDb"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ProfileRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    const currentUserId = getCurrentUserId()
    router.replace(`/profiles/${currentUserId}`)
  }, [router])

  return (
    <div className="mx-auto max-w-4xl space-y-4 px-4 py-12 text-center">
      <p className="text-sm text-muted-foreground">
        Redirecting to your profile…
      </p>
    </div>
  )
}
