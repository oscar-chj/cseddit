import { ChartBarIcon, ImageIcon, LinkIcon } from "@phosphor-icons/react"
import React from "react"

export function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function getPostTypeIcon(postType?: string): React.ReactNode {
  if (postType === "image")
    return <ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
  if (postType === "link")
    return <LinkIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
  if (postType === "poll")
    return <ChartBarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
  return null
}
