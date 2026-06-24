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

export function renderStyledText(text: string): React.ReactNode {
  const lines = text.split("\n")
  const result: React.ReactNode[] = []

  let currentList: { type: "ul" | "ol"; items: React.ReactNode[] } | null = null

  const flushList = (key: number) => {
    if (currentList) {
      if (currentList.type === "ul") {
        result.push(
          <ul key={`ul-${key}`} className="list-disc pl-5 my-2 space-y-1 text-sm text-foreground">
            {currentList.items.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        )
      } else {
        result.push(
          <ol key={`ol-${key}`} className="list-decimal pl-5 my-2 space-y-1 text-sm text-foreground">
            {currentList.items.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ol>
        )
      }
      currentList = null
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Check if line is a bullet item
    const bulletMatch = line.match(/^[\-\*]\s+(.*)$/)
    if (bulletMatch) {
      if (currentList && currentList.type !== "ul") {
        flushList(i)
      }
      if (!currentList) {
        currentList = { type: "ul", items: [] }
      }
      currentList.items.push(parseInlineStyles(bulletMatch[1]))
      continue
    }

    // Check if line is a numbered item
    const numberMatch = line.match(/^\d+\.\s+(.*)$/)
    if (numberMatch) {
      if (currentList && currentList.type !== "ol") {
        flushList(i)
      }
      if (!currentList) {
        currentList = { type: "ol", items: [] }
      }
      currentList.items.push(parseInlineStyles(numberMatch[1]))
      continue
    }

    // If it's not a list item, flush any active lists
    flushList(i)

    // Render plain text line (with inline formatting) as a paragraph or line break
    if (line.trim() === "") {
      result.push(<div key={`br-${i}`} className="h-2" />)
    } else {
      result.push(
        <p key={`p-${i}`} className="my-1.5 leading-relaxed text-sm text-foreground">
          {parseInlineStyles(line)}
        </p>
      )
    }
  }

  // Flush any trailing list
  flushList(lines.length)

  return <div className="space-y-1">{result}</div>
}

function parseInlineStyles(text: string): React.ReactNode[] {
  if (!text) return []

  const tokens: { pattern: RegExp; wrapper: (content: React.ReactNode, key: string) => React.ReactNode }[] = [
    {
      pattern: /\*\*(.*?)\*\*/,
      wrapper: (content, key) => <strong key={key} className="font-bold text-foreground">{content}</strong>,
    },
    {
      pattern: /\*(.*?)\*/,
      wrapper: (content, key) => <em key={key} className="italic text-foreground">{content}</em>,
    },
    {
      pattern: /<u>(.*?)<\/u>/i,
      wrapper: (content, key) => <span key={key} className="underline text-foreground">{content}</span>,
    },
    {
      pattern: /`(.*?)`/,
      wrapper: (content, key) => (
        <code key={key} className="bg-muted px-1.5 py-0.5 rounded-sm text-xs font-mono font-semibold border border-border text-foreground">
          {content}
        </code>
      ),
    },
  ]

  // Find the match that starts earliest in the text
  let earliestMatch: {
    index: number
    length: number
    content: string
    wrapper: (content: React.ReactNode, key: string) => React.ReactNode
  } | null = null

  for (const token of tokens) {
    const match = text.match(token.pattern)
    if (match && match.index !== undefined) {
      if (earliestMatch === null || match.index < earliestMatch.index) {
        earliestMatch = {
          index: match.index,
          length: match[0].length,
          content: match[1],
          wrapper: token.wrapper,
        }
      }
    }
  }

  if (earliestMatch) {
    const before = text.substring(0, earliestMatch.index)
    const after = text.substring(earliestMatch.index + earliestMatch.length)
    const uniqueKey = `k-${text.length}-${earliestMatch.index}`
    return [
      ...parseInlineStyles(before),
      earliestMatch.wrapper(parseInlineStyles(earliestMatch.content), uniqueKey),
      ...parseInlineStyles(after),
    ]
  }

  return [text]
}
