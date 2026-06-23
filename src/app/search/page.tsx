"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCurrentUserId, getPosts, getUsers, votePost } from "@/lib/mockDb"
import { formatTimeAgo, getPostTypeIcon } from "@/lib/postUtils"
import { Post, User } from "@/types"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChatIcon,
  StarIcon,
  ThumbsUpIcon,
} from "@phosphor-icons/react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { toast } from "sonner"

function SearchResultsContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [posts, setPosts] = useState<Post[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [activeTab, setActiveTab] = useState<"posts" | "users">("posts")
  const [mounted, setMounted] = useState(false)
  const [currentUserId, setCurrentUserId] = useState("")

  useEffect(() => {
    const allPosts = getPosts()
    const allUsers = getUsers()
    setTimeout(() => {
      setMounted(true)
      setPosts(allPosts)
      setUsers(allUsers)
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
      <div className="mx-auto max-w-7xl animate-pulse space-y-6 px-4 py-6 sm:px-6">
        <div className="h-6 w-64 rounded-none bg-muted" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-none bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  // Filter posts based on query matching title or content or tags
  const lowercaseQuery = query.toLowerCase().trim()
  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(lowercaseQuery) ||
      post.content.toLowerCase().includes(lowercaseQuery) ||
      post.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
  )

  // Filter users based on query matching name, username, title, bio, or department
  const filteredUsers = users.filter((user) => {
    return (
      user.name.toLowerCase().includes(lowercaseQuery) ||
      user.username.toLowerCase().includes(lowercaseQuery) ||
      user.title.toLowerCase().includes(lowercaseQuery) ||
      user.bio.toLowerCase().includes(lowercaseQuery) ||
      user.department.toLowerCase().includes(lowercaseQuery)
    )
  })

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">
          {query ? `Search results for "${query}"` : "All Discussions"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {activeTab === "posts"
            ? `Found ${filteredPosts.length} ${
                filteredPosts.length === 1 ? "result" : "results"
              }`
            : `Found ${filteredUsers.length} ${
                filteredUsers.length === 1 ? "profile" : "profiles"
              }`}
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as "posts" | "users")}
        className="w-full space-y-6"
      >
        <TabsList className="grid h-9 w-full grid-cols-2 sm:w-[320px]">
          <TabsTrigger
            value="posts"
            className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Discussions ({filteredPosts.length})
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Profiles ({filteredUsers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-0">
          <div className="divide-y divide-border overflow-hidden rounded-none border bg-card">
            {filteredPosts.length === 0 ? (
              <div className="space-y-2 p-12 text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  We couldn&apos;t find any matches.
                </p>
                <p className="text-xs text-muted-foreground">
                  Try checking your spelling or searching for generic keywords.
                </p>
                <div className="pt-2">
                  <Link href="/">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-none border-border transition-colors hover:bg-blue-50 hover:text-blue-600"
                    >
                      Go back to Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              filteredPosts.map((post) => {
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
                              variant="outline"
                              className="rounded-none bg-blue-50 text-blue-700 hover:bg-blue-50 border-none text-xs font-normal"
                            >
                              Dept: {post.authorDepartment}
                            </Badge>
                          )}
                          {post.authorYearOfStudy && (
                            <Badge
                              variant="outline"
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
                            Reply
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="users" className="mt-0">
          {filteredUsers.length === 0 ? (
            <div className="rounded-none border border-border bg-card space-y-2 p-12 text-center">
              <p className="text-sm font-medium text-muted-foreground">
                We couldn&apos;t find any matching profiles.
              </p>
              <p className="text-xs text-muted-foreground">
                Try checking your spelling or searching for different keywords.
              </p>
              <div className="pt-2">
                <Link href="/">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-none border-border transition-colors hover:bg-blue-50 hover:text-blue-600"
                  >
                    Go back to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="border border-border bg-card p-4 rounded-none hover:border-blue-500/50 transition-colors flex gap-4 items-start"
                >
                  <Avatar className="h-10 w-10 flex shrink-0 items-center justify-center border border-border">
                    <AvatarFallback className="bg-blue-100 text-lg font-semibold text-blue-800">
                      {user.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2 min-w-0">
                    <div>
                      <div className="flex flex-wrap items-baseline gap-1.5">
                        <Link
                          href={`/profiles/${user.id}`}
                          className="hover:text-blue-600 font-bold text-sm transition-colors truncate"
                        >
                          {user.name}
                        </Link>
                        <span className="text-xs text-muted-foreground truncate">
                          @{user.username}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium mt-0.5 truncate">
                        {user.title}
                      </p>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {user.bio}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {user.department && (
                        <Badge
                          variant="outline"
                          className="rounded-none bg-blue-50 text-blue-700 hover:bg-blue-50 border-none text-xs font-normal"
                        >
                          Dept: {user.department}
                        </Badge>
                      )}
                      {user.yearOfStudy && (
                        <Badge
                          variant="outline"
                          className="rounded-none bg-purple-50 text-purple-700 hover:bg-purple-50 border-none text-xs font-normal"
                        >
                          Year: {user.yearOfStudy}
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <StarIcon className="h-4 w-4 text-blue-600" weight="fill" />
                        <span>
                          Reputation: <strong className="text-foreground font-semibold">{user.reputation}</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUpIcon className="h-4 w-4 text-emerald-600" weight="fill" />
                        <span>
                          Likes: <strong className="text-foreground font-semibold">{user.likes}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function SearchResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl animate-pulse space-y-6 px-4 py-6 sm:px-6">
          <div className="h-6 w-64 rounded-none bg-muted" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-none bg-muted" />
            ))}
          </div>
        </div>
      }
    >
      <SearchResultsContent />
    </Suspense>
  )
}
