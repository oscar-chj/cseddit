"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUp,
  ArrowDown,
  Chat,
  Plus,
  Share,
  Chats,
  Circle
} from "@phosphor-icons/react";
import {
  getPostById,
  votePost,
  voteAnswer,
  createAnswer,
  createComment,
  getCurrentUserId,
  getUserById
} from "@/lib/mockDb";
import { PostDetail, AnswerWithComments, Comment } from "@/types";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

function formatTimeAgo(timestamp: number) {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface InlineCommentSectionProps {
  parentId: string;
  comments: Comment[];
  onCommentAdded: () => void;
}

function InlineCommentSection({ parentId, comments, onCommentAdded }: InlineCommentSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [commentText, setCommentText] = useState("");
  const currentUserId = getCurrentUserId();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    createComment({
      parentId,
      content: commentText.trim(),
      authorId: currentUserId,
    });

    setCommentText("");
    setShowForm(false);
    onCommentAdded();
    toast("Comment posted");
  };

  return (
    <div className="mt-4 pl-4 border-l-2 border-muted space-y-3">
      <div className="space-y-2">
        {comments.map((comment) => (
          <div key={comment.id} className="text-xs py-1.5 flex items-start gap-2">
            <Avatar className="h-4 w-4 mt-0.5">
              <AvatarFallback className="text-[6px] bg-blue-50 text-blue-700">
                {comment.authorAvatar}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <span className="font-semibold text-foreground mr-1.5">{comment.authorName}</span>
              <span className="text-muted-foreground">{comment.content}</span>
              <span className="text-[10px] text-muted-foreground ml-2">
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
              toast.error("Anonymous users cannot add comments");
              return;
            }
            setShowForm(true);
          }}
          className="text-xs text-blue-600 hover:underline font-medium block"
        >
          Add a comment
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2 items-center max-w-lg mt-1">
          <Input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a helpful comment..."
            className="h-8 text-xs focus-visible:ring-blue-500"
          />
          <Button type="submit" size="sm" className="h-8 bg-blue-600 text-white hover:bg-blue-700 text-xs px-3">
            Comment
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowForm(false)}
            className="h-8 text-xs text-muted-foreground px-2"
          >
            Cancel
          </Button>
        </form>
      )}
    </div>
  );
}

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const postId = resolvedParams.id;

  const [postDetail, setPostDetail] = useState<PostDetail | null>(null);
  const [answerContent, setAnswerContent] = useState("");
  const [sortBy, setSortBy] = useState<"top" | "latest">("top");
  const [mounted, setMounted] = useState(false);
  const [currentUserId, setCurrentUserIdState] = useState("");

  const loadData = () => {
    const detail = getPostById(postId);
    if (!detail) {
      toast.error("Question not found");
      router.push("/");
      return;
    }
    setPostDetail(detail);
    setCurrentUserIdState(getCurrentUserId());
  };

  useEffect(() => {
    setMounted(true);
    loadData();
  }, [postId]);

  const handlePostVote = (type: "up" | "down") => {
    if (!postDetail) return;
    if (currentUserId === "anonymous") {
      toast.error("Anonymous users cannot vote");
      return;
    }
    if (postDetail.authorId === currentUserId) {
      toast.error("You cannot vote on your own question");
      return;
    }

    votePost(postDetail.id, currentUserId, type);
    loadData();
    toast(`Vote recorded`);
  };

  const handleAnswerVote = (answerId: string, authorId: string, type: "up" | "down") => {
    if (currentUserId === "anonymous") {
      toast.error("Anonymous users cannot vote");
      return;
    }
    if (authorId === currentUserId) {
      toast.error("You cannot vote on your own answer");
      return;
    }

    voteAnswer(answerId, currentUserId, type);
    loadData();
    toast(`Vote recorded`);
  };

  const handlePostAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerContent.trim()) {
      toast.error("Please enter answer content");
      return;
    }

    createAnswer({
      postId,
      content: answerContent.trim(),
      authorId: currentUserId,
    });

    setAnswerContent("");
    loadData();
    toast("Answer posted");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast("Link copied to clipboard");
  };

  if (!mounted || !postDetail) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6 space-y-6 animate-pulse">
        <div className="h-8 w-2/3 bg-muted rounded" />
        <div className="h-4 w-1/3 bg-muted rounded" />
        <div className="flex gap-4">
          <div className="w-10 h-24 bg-muted rounded" />
          <div className="flex-1 h-48 bg-muted rounded" />
        </div>
      </div>
    );
  }

  const score = postDetail.upvotes.length - postDetail.downvotes.length;
  const postAuthor = getUserById(postDetail.authorId);

  // Sort answers
  const sortedAnswers = [...postDetail.answers];
  if (sortBy === "top") {
    sortedAnswers.sort((a, b) => {
      const scoreA = a.upvotes.length - a.downvotes.length;
      const scoreB = b.upvotes.length - b.downvotes.length;
      return scoreB - scoreA;
    });
  } else {
    sortedAnswers.sort((a, b) => b.timestamp - a.timestamp);
  }

  const hasUpvotedPost = postDetail.upvotes.includes(currentUserId);
  const hasDownvotedPost = postDetail.downvotes.includes(currentUserId);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 space-y-8">
      {/* Header Info */}
      <div className="border-b border-border pb-4 space-y-3">
        <h1 className="text-xl md:text-2xl font-bold text-foreground leading-tight">
          {postDetail.title}
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-[8px] bg-blue-100 text-blue-800">
                {postDetail.authorAvatar}
              </AvatarFallback>
            </Avatar>
            <span className="font-semibold text-foreground">{postDetail.authorName}</span>
            {postAuthor && (
              <Badge variant="outline" className="text-[9px] font-normal text-muted-foreground border-border py-0 px-1 bg-muted/40">
                {postAuthor.title}
              </Badge>
            )}
          </div>
          <span>•</span>
          <span>Asked {formatTimeAgo(postDetail.timestamp)}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            Active User:{" "}
            <span className="font-bold text-foreground">
              {currentUserId === "anonymous" ? "Anonymous" : currentUserId}
            </span>
          </span>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Post and answers */}
        <div className="lg:col-span-9 space-y-8">
          {/* Question Details */}
          <div className="flex gap-4">
            {/* Voting block */}
            <div className="flex flex-col items-center gap-1.5 pt-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handlePostVote("up")}
                className={`h-9 w-9 border border-border rounded-full ${
                  hasUpvotedPost ? "bg-blue-50 text-blue-600 border-blue-200" : "text-muted-foreground"
                }`}
              >
                <ArrowUp className="h-5 w-5" weight={hasUpvotedPost ? "bold" : "regular"} />
              </Button>
              <span className="text-sm font-bold text-foreground">{score}</span>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handlePostVote("down")}
                className={`h-9 w-9 border border-border rounded-full ${
                  hasDownvotedPost ? "bg-red-50 text-red-600 border-red-200" : "text-muted-foreground"
                }`}
              >
                <ArrowDown className="h-5 w-5" weight={hasDownvotedPost ? "bold" : "regular"} />
              </Button>
            </div>

            {/* Post text and tags */}
            <div className="flex-1 space-y-4">
              <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
                {postDetail.content}
              </p>

              {/* Tags list */}
              <div className="flex flex-wrap gap-1.5">
                {postDetail.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs font-normal text-muted-foreground border-border hover:bg-blue-50 hover:text-blue-600 transition-colors"
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
                  className="text-muted-foreground hover:text-blue-600 text-xs gap-1.5 h-8"
                >
                  <Share className="h-4 w-4" />
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
                Comments/Answers ({postDetail.answers.length})
              </h2>
              <Select
                value={sortBy}
                onValueChange={(val) => setSortBy(val as "top" | "latest")}
              >
                <SelectTrigger className="w-[140px] h-8 text-xs border-border">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top" className="text-xs">Top Comments</SelectItem>
                  <SelectItem value="latest" className="text-xs">Latest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Answers List */}
            <div className="space-y-6">
              {sortedAnswers.map((answer) => {
                const answerScore = answer.upvotes.length - answer.downvotes.length;
                const hasUpvotedAnswer = answer.upvotes.includes(currentUserId);
                const hasDownvotedAnswer = answer.downvotes.includes(currentUserId);
                const authorUser = getUserById(answer.authorId);

                return (
                  <div key={answer.id} className="flex gap-4 p-4 rounded-lg border border-border bg-card">
                    {/* Vote Sidebar */}
                    <div className="flex flex-col items-center gap-1 pt-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleAnswerVote(answer.id, answer.authorId, "up")}
                        className={`h-8 w-8 border border-border rounded-full ${
                          hasUpvotedAnswer ? "bg-blue-50 text-blue-600 border-blue-200" : "text-muted-foreground"
                        }`}
                      >
                        <ArrowUp className="h-4 w-4" weight={hasUpvotedAnswer ? "bold" : "regular"} />
                      </Button>
                      <span className="text-xs font-bold text-foreground">{answerScore}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleAnswerVote(answer.id, answer.authorId, "down")}
                        className={`h-8 w-8 border border-border rounded-full ${
                          hasDownvotedAnswer ? "bg-red-50 text-red-600 border-red-200" : "text-muted-foreground"
                        }`}
                      >
                        <ArrowDown className="h-4 w-4" weight={hasDownvotedAnswer ? "bold" : "regular"} />
                      </Button>
                    </div>

                    {/* Answer content */}
                    <div className="flex-1 space-y-3">
                      {/* Author Info */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-[8px] bg-blue-100 text-blue-800">
                              {answer.authorAvatar}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-semibold text-foreground">{answer.authorName}</span>
                          {authorUser && (
                            <Badge variant="outline" className="text-[9px] font-normal text-muted-foreground border-border py-0 px-1">
                              {authorUser.title}
                            </Badge>
                          )}
                        </div>
                        <span>Answered {formatTimeAgo(answer.timestamp)}</span>
                      </div>

                      <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
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
                );
              })}
            </div>
          </div>

          {/* Add Answer Box */}
          <div className="border-t border-border pt-6 space-y-4">
            <h3 className="text-base font-bold text-foreground">Your Answer</h3>
            <form onSubmit={handlePostAnswer} className="space-y-4">
              <Textarea
                placeholder="Write your answer details here. Be specific and provide code examples..."
                value={answerContent}
                onChange={(e) => setAnswerContent(e.target.value)}
                className="min-h-[160px] p-4 text-sm focus-visible:ring-blue-500 border-border"
              />
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                Post Answer
              </Button>
            </form>
          </div>
        </div>

        {/* Right column: Sticky guidelines / tips */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-border bg-muted/20">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Peer Review Tips
              </h3>
              <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-4 leading-relaxed">
                <li>Provide clean code blocks using standard Markdown.</li>
                <li>Stay polite and constructive when commenting.</li>
                <li>Upvote solutions that are optimized and easy to comprehend.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
