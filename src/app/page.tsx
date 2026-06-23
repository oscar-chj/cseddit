"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCurrentUserId, getPosts, votePost } from "@/lib/mockDb"
import { formatTimeAgo, getPostTypeIcon } from "@/lib/postUtils"
import { Post } from "@/types"
import { ArrowDownIcon, ArrowUpIcon, ChatIcon } from "@phosphor-icons/react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function Dashboard() {
  const [posts, setPosts] = useState<Post[]>([])
  const [activeTab, setActiveTab] = useState<"latest" | "trending">("latest")
  const [visibleCount, setVisibleCount] = useState(5)
  const [mounted, setMounted] = useState(false)
  const [currentUserId, setCurrentUserId] = useState("")

  useEffect(() => {
    const allPosts = getPosts()
    setTimeout(() => {
      setMounted(true)
      setPosts(allPosts)
      setCurrentUserId(getCurrentUserId())
    }, 0)
  }, [])

  const handleVote = (
    postId: string,
    type: "up" | "down",
    authorId: string
  ) => {
    if (currentUserId === "anonymous") {
      toast.error("Anonymous users cannot vote")
      return
    }
    if (authorId === currentUserId) {
      toast.error("You cannot vote on your own question")
      return
    }
    votePost(postId, currentUserId, type)
    const allPosts = getPosts()
    setPosts(allPosts)
    toast("Vote recorded")
  }

  if (!mounted) {
    return (
      <div className="mx-auto max-w-7xl animate-pulse space-y-8 px-4 py-6 sm:px-6">
        <div className="h-6 w-48 rounded-none bg-muted" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-none bg-muted" />
          ))}
        </div>
        <div className="h-10 w-full rounded-none bg-muted" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-none bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  // Filter posts
  const featuredPosts = posts.filter((p) => p.isFeatured).slice(0, 3)
  const feedPosts = [...posts]

  if (activeTab === "latest") {
    feedPosts.sort((a, b) => b.timestamp - a.timestamp)
  } else {
    feedPosts.sort((a, b) => {
      const scoreA = a.upvotes.length - a.downvotes.length
      const scoreB = b.upvotes.length - b.downvotes.length
      return scoreB - scoreA
    })
  }

  const displayedPosts = feedPosts.slice(0, visibleCount)

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6">
      {/* Featured Section */}
      <div>
        <h2 className="mb-4 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
          Featured Questions
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {featuredPosts.map((post) => {
            const score = post.upvotes.length - post.downvotes.length
            return (
              <Card
                key={post.id}
                className="flex flex-col justify-between rounded-none border-border transition-colors hover:border-blue-500/50"
              >
                <CardHeader className="p-4 pb-2">
                  <div className="mb-2 flex items-center justify-between">
                    {post.authorId !== "anonymous" ? (
                      <Link
                        href={`/profiles/${post.authorId}`}
                        className="flex items-center gap-2 hover:text-blue-600 group"
                      >
                        <Avatar className="h-6 w-6 cursor-pointer">
                          <AvatarFallback className="bg-blue-100 text-[10px] text-blue-800">
                            {post.authorAvatar}
                          </AvatarFallback>
                        </Avatar>
                        <span className="max-w-[120px] truncate text-xs font-medium text-muted-foreground group-hover:text-blue-600 group-hover:underline">
                          {post.authorName}
                        </span>
                      </Link>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-blue-100 text-[10px] text-blue-800">
                            {post.authorAvatar}
                          </AvatarFallback>
                        </Avatar>
                        <span className="max-w-[120px] truncate text-xs font-medium text-muted-foreground">
                          {post.authorName}
                        </span>
                      </div>
                    )}
                    <Badge
                      variant="secondary"
                      className="border-none bg-blue-50 px-2 text-[10px] font-normal text-blue-700 hover:bg-blue-50"
                    >
                      {post.tags[0]}
                    </Badge>
                  </div>
                  <CardTitle className="line-clamp-2 flex items-center gap-1.5 text-sm font-bold transition-colors hover:text-blue-600">
                    {getPostTypeIcon(post.postType)}
                    <Link href={`/posts/${post.id}`}>{post.title}</Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="mt-auto flex items-center justify-between p-4 pt-0 text-xs text-muted-foreground">
                  <span>{formatTimeAgo(post.timestamp)}</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-medium text-foreground">
                      <ArrowUpIcon className="h-3.5 w-3.5 text-blue-600" />
                      {score}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Main feed list */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 border-b border-border pb-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold text-foreground">
            Recent Discussions
          </h2>
          <Tabs
            defaultValue="latest"
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as "latest" | "trending")}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid h-9 w-full grid-cols-2 sm:w-[200px]">
              <TabsTrigger
                value="latest"
                className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                Latest
              </TabsTrigger>
              <TabsTrigger
                value="trending"
                className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                Trending
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Chronological feed post cards */}
        <div className="divide-y divide-border overflow-hidden rounded-none border bg-card">
          {displayedPosts.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No discussions found.
            </div>
          ) : (
            displayedPosts.map((post) => {
              const score = post.upvotes.length - post.downvotes.length
              return (
                <div
                  key={post.id}
                  className="flex flex-col gap-4 p-5 transition-colors hover:bg-muted/30 md:flex-row md:items-start"
                >
                  {/* Scores Sidebar (Desktop) */}
                  <div className="hidden min-w-[40px] flex-col items-center justify-center gap-1.5 rounded-none bg-transparent py-1 text-center md:flex">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleVote(post.id, "up", post.authorId)}
                      className={`h-7 w-7 rounded-none ${
                        post.upvotes.includes(currentUserId)
                          ? "bg-blue-50/50 text-blue-600"
                          : "text-muted-foreground hover:text-blue-600"
                      }`}
                    >
                      <ArrowUpIcon
                        className="h-4 w-4"
                        weight={
                          post.upvotes.includes(currentUserId)
                            ? "bold"
                            : "regular"
                        }
                      />
                    </Button>
                    <span className="text-xs font-bold text-foreground">
                      {score}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleVote(post.id, "down", post.authorId)}
                      className={`h-7 w-7 rounded-none ${
                        post.downvotes.includes(currentUserId)
                          ? "bg-red-50/50 text-red-600"
                          : "text-muted-foreground hover:text-red-600"
                      }`}
                    >
                      <ArrowDownIcon
                        className="h-4 w-4"
                        weight={
                          post.downvotes.includes(currentUserId)
                            ? "bold"
                            : "regular"
                        }
                      />
                    </Button>
                  </div>

                  {/* Main content body */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {post.authorId !== "anonymous" ? (
                        <Link
                          href={`/profiles/${post.authorId}`}
                          className="flex items-center gap-2 hover:text-blue-600 group"
                        >
                          <Avatar className="h-5 w-5 cursor-pointer">
                            <AvatarFallback className="bg-blue-100 text-[8px] text-blue-800">
                              {post.authorAvatar}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-semibold text-foreground group-hover:text-blue-600 group-hover:underline">
                            {post.authorName}
                          </span>
                        </Link>
                      ) : (
                        <>
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="bg-blue-100 text-[8px] text-blue-800">
                              {post.authorAvatar}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-semibold text-foreground">
                            {post.authorName}
                          </span>
                        </>
                      )}
                      <span>•</span>
                      <span>{formatTimeAgo(post.timestamp)}</span>
                      {post.isFeatured && (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center gap-0.5 rounded-none bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-600">
                            Featured
                          </span>
                        </>
                      )}
                    </div>

                    <Link href={`/posts/${post.id}`} className="group block">
                      <h3 className="flex items-center gap-1.5 text-base font-bold text-foreground transition-colors group-hover:text-blue-600">
                        {getPostTypeIcon(post.postType)}
                        {post.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {post.content}
                      </p>
                    </Link>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      {/* Tags */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {post.authorDepartment && (
                          <Badge
                            className="rounded-none bg-blue-50 text-blue-700 hover:bg-blue-50 border-none text-xs font-normal"
                          >
                            Dept: {post.authorDepartment}
                          </Badge>
                        )}
                        {post.authorYearOfStudy && (
                          <Badge
                            className="rounded-none bg-purple-50 text-purple-700 hover:bg-purple-50 border-none text-xs font-normal"
                          >
                            Year: {post.authorYearOfStudy}
                          </Badge>
                        )}
                        {post.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="border-border text-xs font-normal text-muted-foreground transition-colors hover:bg-blue-50 hover:text-blue-600"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Vote summary for mobile */}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground md:hidden">
                        <div className="flex h-7 items-center overflow-hidden rounded-none bg-transparent">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              handleVote(post.id, "up", post.authorId)
                            }
                            className={`h-7 w-7 rounded-none ${
                              post.upvotes.includes(currentUserId)
                                ? "bg-blue-50/50 text-blue-600"
                                : "text-muted-foreground"
                            }`}
                          >
                            <ArrowUpIcon
                              className="h-3.5 w-3.5"
                              weight={
                                post.upvotes.includes(currentUserId)
                                  ? "bold"
                                  : "regular"
                              }
                            />
                          </Button>
                          <span className="px-2 text-xs font-bold text-foreground">
                            {score}
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              handleVote(post.id, "down", post.authorId)
                            }
                            className={`h-7 w-7 rounded-none ${
                              post.downvotes.includes(currentUserId)
                                ? "bg-red-50/50 text-red-600"
                                : "text-muted-foreground"
                            }`}
                          >
                            <ArrowDownIcon
                              className="h-3.5 w-3.5"
                              weight={
                                post.downvotes.includes(currentUserId)
                                  ? "bold"
                                  : "regular"
                              }
                            />
                          </Button>
                        </div>
                        <span className="flex items-center gap-1">
                          <ChatIcon className="h-3.5 w-3.5" />
                          Answer
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Load more button */}
        {feedPosts.length > visibleCount && (
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVisibleCount((prev) => prev + 5)}
              className="rounded-none border-border transition-colors hover:bg-blue-50 hover:text-blue-600"
            >
              Load more
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
