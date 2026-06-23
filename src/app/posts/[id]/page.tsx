"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  createAnswer,
  createComment,
  getCurrentUserId,
  getPostById,
  voteAnswer,
  votePoll,
  votePost,
} from "@/lib/mockDb"
import { formatTimeAgo } from "@/lib/postUtils"
import { Comment, PostDetail } from "@/types"
import { Spinner } from "@/components/ui/spinner"
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowUpIcon,
  CheckIcon,
  LinkIcon,
  ShareIcon,
} from "@phosphor-icons/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React, { use, useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

interface InlineCommentSectionProps {
  parentId: string
  comments: Comment[]
  onCommentAdded: () => void
}

function InlineCommentSection({
  parentId,
  comments,
  onCommentAdded,
}: InlineCommentSectionProps) {
  const [showForm, setShowForm] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [isPosting, setIsPosting] = useState(false)
  const currentUserId = getCurrentUserId()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim() || isPosting) return

    setIsPosting(true)

    // Simulated 500ms delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    createComment({
      parentId,
      content: commentText.trim(),
      authorId: currentUserId,
    })

    setCommentText("")
    setShowForm(false)
    setIsPosting(false)
    onCommentAdded()
    toast.success("Comment posted successfully")
  }

  return (
    <div className="mt-4 space-y-3 border-l-2 border-muted pl-4">
      <div className="space-y-2">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="flex items-start gap-2 py-1.5 text-xs"
          >
            <Avatar className="mt-0.5 h-4 w-4">
              <AvatarFallback className="bg-blue-50 text-[6px] text-blue-700">
                {comment.authorAvatar}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <span className="mr-1.5 font-semibold text-foreground">
                {comment.authorName}
              </span>
              <span className="text-muted-foreground">{comment.content}</span>
              <span className="ml-2 text-[10px] text-muted-foreground">
                {formatTimeAgo(comment.timestamp)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {!showForm ? (
        <button
          onClick={() => {
            if (currentUserId === "anonymous") {
              toast.error("Anonymous users cannot add comments")
              return
            }
            setShowForm(true)
          }}
          className="block text-xs font-medium text-blue-600 hover:underline"
        >
          Add a comment
        </button>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-1 flex max-w-lg items-center gap-2"
        >
          <Input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            disabled={isPosting}
            placeholder="Add a helpful comment..."
            className="h-8 rounded-none text-xs focus-visible:ring-blue-500"
          />
          <Button
            type="submit"
            disabled={commentText.trim() === "" || isPosting}
            size="sm"
            className="h-8 rounded-none bg-blue-600 px-3 text-xs text-white hover:bg-blue-700 flex items-center justify-center gap-1"
          >
            {isPosting ? <Spinner className="text-white" /> : "Comment"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isPosting}
            onClick={() => setShowForm(false)}
            className="h-8 rounded-none px-2 text-xs text-muted-foreground"
          >
            Cancel
          </Button>
        </form>
      )}
    </div>
  )
}

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const postId = resolvedParams.id

  const [postDetail, setPostDetail] = useState<PostDetail | null>(null)
  const [answerContent, setAnswerContent] = useState("")
  const [sortBy, setSortBy] = useState<"top" | "latest">("top")
  const [mounted, setMounted] = useState(false)
  const [currentUserId, setCurrentUserIdState] = useState("")
  const [isPostingAnswer, setIsPostingAnswer] = useState(false)

  const loadData = useCallback(() => {
    const detail = getPostById(postId)
    if (!detail) {
      toast.error("Question not found")
      router.push("/")
      return
    }
    setPostDetail(detail)
    setCurrentUserIdState(getCurrentUserId())
  }, [postId, router])

  useEffect(() => {
    setTimeout(() => {
      setMounted(true)
      loadData()
    }, 0)
  }, [loadData])

  const handlePostVote = (type: "up" | "down") => {
    if (!postDetail) return
    if (currentUserId === "anonymous") {
      toast.error("Anonymous users cannot vote")
      return
    }
    if (postDetail.authorId === currentUserId) {
      toast.error("You cannot vote on your own question")
      return
    }

    votePost(postDetail.id, currentUserId, type)
    loadData()
    toast(`Vote recorded`)
  }

  const handleAnswerVote = (
    answerId: string,
    authorId: string,
    type: "up" | "down"
  ) => {
    if (currentUserId === "anonymous") {
      toast.error("Anonymous users cannot vote")
      return
    }
    if (authorId === currentUserId) {
      toast.error("You cannot vote on your own answer")
      return
    }

    voteAnswer(answerId, currentUserId, type)
    loadData()
    toast(`Vote recorded`)
  }

  const handlePostAnswer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!answerContent.trim() || isPostingAnswer) {
      return
    }

    setIsPostingAnswer(true)

    // Simulated 500ms delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    createAnswer({
      postId,
      content: answerContent.trim(),
      authorId: currentUserId,
    })

    setAnswerContent("")
    setIsPostingAnswer(false)
    loadData()
    toast.success("Answer posted successfully")
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast("Link copied to clipboard")
  }

  if (!mounted || !postDetail) {
    return (
      <div className="mx-auto max-w-5xl animate-pulse space-y-6 px-4 py-6">
        <div className="h-8 w-2/3 rounded-none bg-muted" />
        <div className="h-4 w-1/3 rounded-none bg-muted" />
        <div className="flex gap-4">
          <div className="h-24 w-10 rounded-none bg-muted" />
          <div className="h-48 flex-1 rounded-none bg-muted" />
        </div>
      </div>
    )
  }

  const score = postDetail.upvotes.length - postDetail.downvotes.length

  // Sort answers
  const sortedAnswers = [...postDetail.answers]
  if (sortBy === "top") {
    sortedAnswers.sort((a, b) => {
      const scoreA = a.upvotes.length - a.downvotes.length
      const scoreB = b.upvotes.length - b.downvotes.length
      return scoreB - scoreA
    })
  } else {
    sortedAnswers.sort((a, b) => b.timestamp - a.timestamp)
  }

  const hasUpvotedPost = postDetail.upvotes.includes(currentUserId)
  const hasDownvotedPost = postDetail.downvotes.includes(currentUserId)

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-6">
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-blue-600"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          <span>Back to Discussions</span>
        </Link>
      </div>

      {/* Header Info */}
      <div className="space-y-3 border-b border-border pb-4">
        <h1 className="text-xl leading-tight font-bold text-foreground md:text-2xl">
          {postDetail.title}
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarFallback className="bg-blue-100 text-[8px] text-blue-800">
                {postDetail.authorAvatar}
              </AvatarFallback>
            </Avatar>
            <span className="font-semibold text-foreground">
              {postDetail.authorName}
            </span>
          </div>
          <span>Asked {formatTimeAgo(postDetail.timestamp)}</span>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left column: Post and answers */}
        <div className="space-y-8 lg:col-span-9">
          {/* Question Details */}
          <div className="flex gap-4">
            {/* Voting block */}
            <div className="flex flex-col items-center gap-1.5 pt-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handlePostVote("up")}
                className={`h-9 w-9 rounded-none border border-border ${
                  hasUpvotedPost
                    ? "border-blue-200 bg-blue-50 text-blue-600"
                    : "text-muted-foreground"
                }`}
              >
                <ArrowUpIcon
                  className="h-5 w-5"
                  weight={hasUpvotedPost ? "bold" : "regular"}
                />
              </Button>
              <span className="text-sm font-bold text-foreground">{score}</span>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handlePostVote("down")}
                className={`h-9 w-9 rounded-none border border-border ${
                  hasDownvotedPost
                    ? "border-red-200 bg-red-50 text-red-600"
                    : "text-muted-foreground"
                }`}
              >
                <ArrowDownIcon
                  className="h-5 w-5"
                  weight={hasDownvotedPost ? "bold" : "regular"}
                />
              </Button>
            </div>

            {/* Post text and tags */}
            <div className="flex-1 space-y-4">
              {/* Dynamic Post Type Content */}
              {postDetail.postType === "image" && (
                <div className="space-y-4">
                  {postDetail.mediaUrl && (
                    <img
                      src={postDetail.mediaUrl}
                      alt={postDetail.title}
                      className="max-h-[450px] w-auto rounded-none border border-border object-contain"
                    />
                  )}
                  {postDetail.content && (
                    <p className="text-sm leading-relaxed whitespace-pre-line text-foreground">
                      {postDetail.content}
                    </p>
                  )}
                </div>
              )}

              {postDetail.postType === "link" && (
                <div className="space-y-4">
                  {postDetail.mediaUrl && (
                    <a
                      href={postDetail.mediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-none border border-border bg-muted/30 p-4 text-blue-600 transition-colors hover:bg-muted/50 hover:underline"
                    >
                      <LinkIcon className="h-5 w-5 shrink-0" />
                      <span className="truncate text-sm font-medium">
                        {postDetail.mediaUrl}
                      </span>
                    </a>
                  )}
                  {postDetail.content && (
                    <p className="text-sm leading-relaxed whitespace-pre-line text-foreground">
                      {postDetail.content}
                    </p>
                  )}
                </div>
              )}

              {postDetail.postType === "poll" && (
                <div className="space-y-4">
                  <div className="space-y-2 rounded-none border border-border bg-card p-4">
                    {(() => {
                      const totalVotes = postDetail.pollOptions
                        ? postDetail.pollOptions.reduce(
                            (acc, opt) => acc + opt.votes.length,
                            0
                          )
                        : 0
                      const userVotedOptionIndex = postDetail.pollOptions
                        ? postDetail.pollOptions.findIndex((opt) =>
                            opt.votes.includes(currentUserId)
                          )
                        : -1
                      const hasVoted = userVotedOptionIndex !== -1

                      if (hasVoted) {
                        return (
                          <div className="space-y-3">
                            {postDetail.pollOptions?.map((option, idx) => {
                              const pct =
                                totalVotes > 0
                                  ? Math.round(
                                      (option.votes.length / totalVotes) * 100
                                    )
                                  : 0
                              const isSelected = idx === userVotedOptionIndex
                              return (
                                <div
                                  key={idx}
                                  className="relative flex h-12 items-center justify-between overflow-hidden rounded-none border border-border p-3"
                                >
                                  <div
                                    className="absolute top-0 bottom-0 left-0 bg-blue-100 transition-all duration-300 dark:bg-blue-900/30"
                                    style={{ width: `${pct}%` }}
                                  />
                                  <div className="relative z-10 flex items-center gap-2 text-sm font-medium text-foreground">
                                    {option.text}
                                    {isSelected && (
                                      <CheckIcon className="h-4 w-4 shrink-0 font-bold text-blue-600" />
                                    )}
                                  </div>
                                  <div className="relative z-10 text-xs font-semibold text-muted-foreground">
                                    {pct}% ({option.votes.length}{" "}
                                    {option.votes.length === 1
                                      ? "vote"
                                      : "votes"}
                                    )
                                  </div>
                                </div>
                              )
                            })}
                            <div className="pt-1 text-xs text-muted-foreground">
                              Total votes: {totalVotes}
                            </div>
                          </div>
                        )
                      } else {
                        return (
                          <div className="space-y-2">
                            {postDetail.pollOptions?.map((option, idx) => (
                              <Button
                                key={idx}
                                variant="outline"
                                onClick={() => {
                                  if (currentUserId === "anonymous") {
                                    toast.error("Anonymous users cannot vote")
                                    return
                                  }
                                  votePoll(postDetail.id, idx, currentUserId)
                                  toast("Vote registered")
                                  loadData()
                                }}
                                className="h-auto w-full justify-start rounded-none border-border px-3 py-2 text-left text-sm font-normal hover:bg-muted/50"
                              >
                                {option.text}
                              </Button>
                            ))}
                            <div className="pt-1 text-xs text-muted-foreground">
                              Total votes: {totalVotes}
                            </div>
                          </div>
                        )
                      }
                    })()}
                  </div>
                  {postDetail.content && (
                    <p className="text-sm leading-relaxed whitespace-pre-line text-foreground">
                      {postDetail.content}
                    </p>
                  )}
                </div>
              )}

              {(!postDetail.postType || postDetail.postType === "text") &&
                postDetail.content && (
                  <p className="text-sm leading-relaxed whitespace-pre-line text-foreground">
                    {postDetail.content}
                  </p>
                )}

              {/* Tags list */}
              <div className="flex flex-wrap gap-1.5">
                {postDetail.authorDepartment && (
                  <Badge
                    variant="outline"
                    className="rounded-none bg-blue-50 text-blue-700 hover:bg-blue-50 border-none text-xs font-normal"
                  >
                    Dept: {postDetail.authorDepartment}
                  </Badge>
                )}
                {postDetail.authorYearOfStudy && (
                  <Badge
                    variant="outline"
                    className="rounded-none bg-purple-50 text-purple-700 hover:bg-purple-50 border-none text-xs font-normal"
                  >
                    Year: {postDetail.authorYearOfStudy}
                  </Badge>
                )}
                {postDetail.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="border-border text-xs font-normal text-muted-foreground transition-colors hover:bg-blue-50 hover:text-blue-600"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Actions row */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleShare}
                  className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-blue-600"
                >
                  <ShareIcon className="h-4 w-4" />
                  Share
                </Button>
              </div>

              {/* Threaded Comments */}
              <InlineCommentSection
                parentId={postDetail.id}
                comments={postDetail.comments}
                onCommentAdded={loadData}
              />
            </div>
          </div>

          {/* Answers Title & Filter */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h2 className="text-base font-bold text-foreground">
                Answers ({postDetail.answers.length})
              </h2>
              <Select
                value={sortBy}
                onValueChange={(val) => setSortBy(val as "top" | "latest")}
              >
                <SelectTrigger className="h-8 w-[140px] rounded-none border-border text-xs">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top" className="text-xs">
                    Top Answers
                  </SelectItem>
                  <SelectItem value="latest" className="text-xs">
                    Latest
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Answers List */}
            <div className="space-y-6">
              {sortedAnswers.map((answer) => {
                const answerScore =
                  answer.upvotes.length - answer.downvotes.length
                const hasUpvotedAnswer = answer.upvotes.includes(currentUserId)
                const hasDownvotedAnswer =
                  answer.downvotes.includes(currentUserId)

                return (
                  <div
                    key={answer.id}
                    className="flex gap-4 rounded-none border border-border bg-card p-4"
                  >
                    {/* Vote Sidebar */}
                    <div className="flex flex-col items-center gap-1 pt-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          handleAnswerVote(answer.id, answer.authorId, "up")
                        }
                        className={`h-8 w-8 rounded-none border border-border ${
                          hasUpvotedAnswer
                            ? "border-blue-200 bg-blue-50 text-blue-600"
                            : "text-muted-foreground"
                        }`}
                      >
                        <ArrowUpIcon
                          className="h-4 w-4"
                          weight={hasUpvotedAnswer ? "bold" : "regular"}
                        />
                      </Button>
                      <span className="text-xs font-bold text-foreground">
                        {answerScore}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          handleAnswerVote(answer.id, answer.authorId, "down")
                        }
                        className={`h-8 w-8 rounded-none border border-border ${
                          hasDownvotedAnswer
                            ? "border-red-200 bg-red-50 text-red-600"
                            : "text-muted-foreground"
                        }`}
                      >
                        <ArrowDownIcon
                          className="h-4 w-4"
                          weight={hasDownvotedAnswer ? "bold" : "regular"}
                        />
                      </Button>
                    </div>

                    {/* Answer content */}
                    <div className="flex-1 space-y-3">
                      {/* Author Info */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="bg-blue-100 text-[8px] text-blue-800">
                              {answer.authorAvatar}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-semibold text-foreground">
                            {answer.authorName}
                          </span>
                        </div>
                        <span>Answered {formatTimeAgo(answer.timestamp)}</span>
                      </div>

                      <p className="text-sm leading-relaxed whitespace-pre-line text-foreground">
                        {answer.content}
                      </p>

                      {/* Answer Comments */}
                      <InlineCommentSection
                        parentId={answer.id}
                        comments={answer.comments}
                        onCommentAdded={loadData}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Add Answer Box */}
          <div className="space-y-4 border-t border-border pt-6">
            <h3 className="text-base font-bold text-foreground">Your Answer</h3>
            <form onSubmit={handlePostAnswer} className="space-y-4">
              <Textarea
                placeholder="Write your answer details here. Be specific and provide code examples..."
                value={answerContent}
                onChange={(e) => setAnswerContent(e.target.value)}
                disabled={isPostingAnswer}
                className="min-h-[160px] rounded-none border-border p-4 text-sm focus-visible:ring-blue-500"
              />
              <Button
                type="submit"
                disabled={answerContent.trim() === "" || isPostingAnswer}
                className="rounded-none bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
              >
                {isPostingAnswer && <Spinner className="text-white" />}
                <span>Post Answer</span>
              </Button>
            </form>
          </div>
        </div>

        {/* Right column: Sticky guidelines / tips */}
        <div className="space-y-6 lg:col-span-3">
          <Card className="rounded-none border-border bg-muted/20">
            <CardContent className="space-y-3 p-4">
              <h3 className="text-xs font-bold tracking-wider text-foreground uppercase">
                Peer Review Tips
              </h3>
              <ul className="list-disc space-y-2 pl-4 text-xs leading-relaxed text-muted-foreground">
                <li>Provide clean code blocks using standard Markdown.</li>
                <li>Stay polite and constructive when commenting.</li>
                <li>
                  Upvote solutions that are optimized and easy to comprehend.
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
