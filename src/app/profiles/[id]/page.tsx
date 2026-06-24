"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  getAnswersByUser,
  getCurrentUserId,
  getPosts,
  getUserById,
  updateUserProfile,
} from "@/lib/mockDb"
import { formatTimeAgo } from "@/lib/postUtils"
import { Answer, Post, User } from "@/types"
import {
  ArrowLeftIcon,
  BookOpenIcon,
  ChatTeardropTextIcon,
  StarIcon,
  ThumbsUpIcon,
} from "@phosphor-icons/react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

export default function UserProfilePage() {
  const params = useParams()
  const profileId = params.id as string

  const [user, setUser] = useState<User | null>(null)
  const [userPosts, setUserPosts] = useState<Post[]>([])
  const [userAnswers, setUserAnswers] = useState<
    (Answer & { postTitle: string })[]
  >([])
  const [mounted, setMounted] = useState(false)
  const [currentUserId, setCurrentUserId] = useState("")

  const loadData = useCallback(() => {
    const targetUser = getUserById(profileId)
    const loggedInId = getCurrentUserId()
    setCurrentUserId(loggedInId)

    if (targetUser) {
      setUser(targetUser)
      const allPosts = getPosts()
      const filtered = allPosts.filter((p) => p.authorId === targetUser.id)
      setUserPosts(filtered)
      setUserAnswers(getAnswersByUser(targetUser.id))
    }
  }, [profileId])

  useEffect(() => {
    setTimeout(() => {
      setMounted(true)
      loadData()
    }, 0)
  }, [loadData])

  const handleToggleAnonymity = (checked: boolean) => {
    if (!user) return
    const updated = updateUserProfile(user.id, { anonymousByDefault: checked })
    if (updated) {
      setUser(updated)
      toast(
        checked
          ? "Anonymous by default enabled"
          : "Anonymous by default disabled"
      )
    }
  }

  if (!mounted) {
    return (
      <div className="mx-auto max-w-4xl animate-pulse space-y-6 px-4 py-6">
        <div className="h-48 bg-muted" />
        <div className="h-32 bg-muted" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-foreground">User not found</h1>
        <p className="text-sm text-muted-foreground">
          The contributor profile you are trying to view does not exist.
        </p>
        <div className="pt-2">
          <Button asChild>
            <Link href="/">
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const isOwnProfile = user.id === currentUserId

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-6">
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          <span>Back to Discussions</span>
        </Link>
      </div>

      {/* Profile Header Card */}
      <Card className="overflow-hidden border-border bg-card">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:gap-8">
            {/* Left Column: Avatar & Badges */}
            <div className="flex min-w-[150px] flex-col items-center gap-4">
              <Avatar className="flex h-24 w-24 items-center justify-center border border-border shadow-sm">
                <AvatarFallback className="text-4xl font-semibold">
                  {user.avatar}
                </AvatarFallback>
              </Avatar>

              {/* Badges Shelf */}
              <div className="space-y-1.5 text-center">
                <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  Earned Badges
                </span>
                <div className="flex items-center justify-center gap-1.5 border border-border bg-muted/40 px-3 py-1.5 rounded-md">
                  {user.badges.map((badge, idx) => (
                    <span
                      key={idx}
                      className="cursor-help text-lg transition-transform hover:scale-125"
                      title={`Earned badge ${badge}`}
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Name, Title, Bio, Settings */}
            <div className="w-full flex-1 space-y-4 text-center md:text-left">
              <div className="space-y-1.5">
                <div className="flex flex-col justify-center gap-2 md:flex-row md:items-center md:justify-start">
                  <h1 className="text-xl leading-tight font-bold text-foreground sm:text-2xl">
                    {user.name}
                  </h1>
                  <span className="self-center text-xs text-muted-foreground">
                    @{user.username}
                  </span>
                </div>

                {/* Department & Year of Study Tags */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 md:justify-start">
                  <Badge
                    variant="secondary"
                    className="px-2 text-[10px] font-normal"
                  >
                    Dept: {user.department}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-border px-2 text-[10px] font-normal"
                  >
                    Year: {user.yearOfStudy}
                  </Badge>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground">
                {user.bio || "No biography provided."}
              </p>

              {/* Stats Counters */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2 sm:gap-6 md:justify-start">
                <div className="flex items-center gap-2 border border-border bg-muted/30 px-3.5 py-2 rounded-md">
                  <StarIcon className="h-5 w-5 text-primary" weight="fill" />
                  <div className="text-left">
                    <span className="block text-sm leading-none font-bold text-foreground">
                      {user.reputation}
                    </span>
                    <span className="text-[10px] font-medium text-muted-foreground">
                      Reputation
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 border border-border bg-muted/30 px-3.5 py-2 rounded-md">
                  <ThumbsUpIcon
                    className="h-5 w-5 text-primary"
                    weight="fill"
                  />
                  <div className="text-left">
                    <span className="block text-sm leading-none font-bold text-foreground">
                      {user.likes}
                    </span>
                    <span className="text-[10px] font-medium text-muted-foreground">
                      Likes
                    </span>
                  </div>
                </div>
              </div>

              {/* Default Anonymity Setting Toggle */}
              {isOwnProfile && (
                <div className="flex items-center justify-center gap-3 border-t border-border pt-4 md:justify-start">
                  <Switch
                    id="default-anonymity"
                    checked={user.anonymousByDefault}
                    onCheckedChange={handleToggleAnonymity}
                  />
                  <Label
                    htmlFor="default-anonymity"
                    className="cursor-pointer text-xs font-semibold"
                  >
                    Publish questions anonymously by default
                  </Label>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User's Created Posts Feed */}
      <div className="space-y-4">
        <h2 className="flex items-center gap-2 border-b border-border pb-2 text-base font-bold text-foreground">
          <BookOpenIcon className="h-5 w-5 text-primary" />
          Questions ({userPosts.length})
        </h2>

        {userPosts.length === 0 ? (
          <div className="border border-dashed rounded-lg p-8 text-center text-sm text-muted-foreground">
            {isOwnProfile
              ? "You haven't asked any questions yet."
              : "No questions asked by this contributor yet."}
          </div>
        ) : (
          <div className="divide-y divide-border overflow-hidden border rounded-lg bg-card">
            {userPosts.map((post) => {
              const postScore = post.upvotes.length - post.downvotes.length
              return (
                <div
                  key={post.id}
                  className="flex items-start justify-between gap-4 p-4 transition-colors hover:bg-muted/30 sm:p-5"
                >
                  <div className="flex-1 space-y-1.5">
                    <Link
                      href={`/posts/${post.id}`}
                      className="block text-sm font-bold text-foreground transition-colors hover:text-primary sm:text-base"
                    >
                      {post.title}
                    </Link>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>Asked {formatTimeAgo(post.timestamp)}</span>
                      <span>•</span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {post.authorDepartment && (
                          <Badge variant="secondary" className="text-xs font-normal">
                            Dept: {post.authorDepartment}
                          </Badge>
                        )}
                        {post.authorYearOfStudy && (
                          <Badge variant="outline" className="text-xs font-normal">
                            Year: {post.authorYearOfStudy}
                          </Badge>
                        )}
                        {post.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="border-border py-0 text-[10px] font-normal text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex min-w-[60px] flex-col items-center justify-center border border-border bg-muted/40 px-3 py-1.5 text-center rounded-md">
                    <span className="text-xs font-bold text-foreground">
                      {postScore}
                    </span>
                    <span className="mt-0.5 text-[9px] font-medium text-muted-foreground uppercase">
                      votes
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* User's Answers */}
      <div className="space-y-4 pt-4">
        <h2 className="flex items-center gap-2 border-b border-border pb-2 text-base font-bold text-foreground">
          <ChatTeardropTextIcon className="h-5 w-5 text-primary" />
          Answers ({userAnswers.length})
        </h2>

        {userAnswers.length === 0 ? (
          <div className="border border-dashed rounded-lg p-8 text-center text-sm text-muted-foreground">
            {isOwnProfile
              ? "You haven't answered any questions yet."
              : "No answers posted by this contributor yet."}
          </div>
        ) : (
          <div className="divide-y divide-border overflow-hidden border rounded-lg bg-card">
            {userAnswers.map((answer) => {
              const answerScore =
                answer.upvotes.length - answer.downvotes.length
              return (
                <div
                  key={answer.id}
                  className="flex items-start justify-between gap-4 p-4 transition-colors hover:bg-muted/30 sm:p-5"
                >
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <Link
                      href={`/posts/${answer.postId}`}
                      className="block truncate text-sm font-semibold text-foreground transition-colors hover:text-primary sm:text-base"
                    >
                      {answer.postTitle}
                    </Link>
                    <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {answer.content}
                    </p>
                    <span className="text-[10px] text-muted-foreground">
                      Answered {formatTimeAgo(answer.timestamp)}
                    </span>
                  </div>

                  <div className="flex min-w-[60px] shrink-0 flex-col items-center justify-center border border-border bg-muted/40 px-3 py-1.5 text-center rounded-md">
                    <span className="text-xs font-bold text-foreground">
                      {answerScore}
                    </span>
                    <span className="mt-0.5 text-[9px] font-medium text-muted-foreground uppercase">
                      votes
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
