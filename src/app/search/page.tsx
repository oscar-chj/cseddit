"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowUpIcon, ArrowDownIcon, ChatIcon, ImageIcon, LinkIcon, ChartBarIcon } from "@phosphor-icons/react";
import { getPosts, votePost, getCurrentUserId } from "@/lib/mockDb";
import { Post } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatTimeAgo, getPostTypeIcon } from "@/lib/postUtils";

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [posts, setPosts] = useState<Post[]>([]);
  const [mounted, setMounted] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
    const allPosts = getPosts();
    setTimeout(() => {
      setMounted(true);
      setPosts(allPosts);
      setCurrentUserId(getCurrentUserId());
    }, 0);
  }, []);

  const handleVote = (postId: string, type: "up" | "down", authorId: string) => {
    if (currentUserId === "anonymous") {
      toast.error("Anonymous users cannot vote");
      return;
    }
    if (authorId === currentUserId) {
      toast.error("You cannot vote on your own question");
      return;
    }
    votePost(postId, currentUserId, type);
    const allPosts = getPosts();
    setPosts(allPosts);
    toast("Vote recorded");
  };

  if (!mounted) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6 animate-pulse">
        <div className="h-6 w-64 bg-muted rounded-none" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-none" />
          ))}
        </div>
      </div>
    );
  }

  // Filter posts based on query matching title or content or tags
  const lowercaseQuery = query.toLowerCase().trim();
  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(lowercaseQuery) ||
      post.content.toLowerCase().includes(lowercaseQuery) ||
      post.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">
          {query ? `Search results for "${query}"` : "All Discussions"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Found {filteredPosts.length} {filteredPosts.length === 1 ? "result" : "results"}
        </p>
      </div>

      <div className="divide-y divide-border border rounded-none overflow-hidden bg-card">
        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="text-muted-foreground text-sm font-medium">
              We couldn&apos;t find any matches.
            </p>
            <p className="text-xs text-muted-foreground">
              Try checking your spelling or searching for generic keywords.
            </p>
            <div className="pt-2">
              <Link href="/">
                <Button size="sm" variant="outline" className="rounded-none border-border hover:bg-blue-50 hover:text-blue-600 transition-colors">
                  Go back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const score = post.upvotes.length - post.downvotes.length;
            return (
              <div
                key={post.id}
                className="p-5 hover:bg-muted/30 transition-colors flex flex-col md:flex-row md:items-start gap-4"
              >
                {/* Scores Sidebar (Desktop) */}
                <div className="hidden md:flex flex-col items-center justify-center gap-1.5 text-center min-w-[40px] py-1 bg-transparent rounded-none">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleVote(post.id, "up", post.authorId)}
                    className={`h-7 w-7 rounded-none ${
                      post.upvotes.includes(currentUserId)
                        ? "text-blue-600 bg-blue-50/50"
                        : "text-muted-foreground hover:text-blue-600"
                    }`}
                  >
                    <ArrowUpIcon
                      className="h-4 w-4"
                      weight={post.upvotes.includes(currentUserId) ? "bold" : "regular"}
                    />
                  </Button>
                  <span className="text-xs font-bold text-foreground">{score}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleVote(post.id, "down", post.authorId)}
                    className={`h-7 w-7 rounded-none ${
                      post.downvotes.includes(currentUserId)
                        ? "text-red-600 bg-red-50/50"
                        : "text-muted-foreground hover:text-red-600"
                    }`}
                  >
                    <ArrowDownIcon
                      className="h-4 w-4"
                      weight={post.downvotes.includes(currentUserId) ? "bold" : "regular"}
                    />
                  </Button>
                </div>

                {/* Main content body */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-[8px] bg-blue-100 text-blue-800">
                        {post.authorAvatar}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-foreground">{post.authorName}</span>
                    <span>•</span>
                    <span>{formatTimeAgo(post.timestamp)}</span>
                    {post.isFeatured && (
                      <>
                        <span>•</span>
                        <span className="inline-flex items-center gap-0.5 text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded-none text-[10px]">
                          Featured
                        </span>
                      </>
                    )}
                  </div>

                  <Link href={`/posts/${post.id}`} className="block group">
                    <h3 className="text-base font-bold text-foreground group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                      {getPostTypeIcon(post.postType)}
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {post.content}
                    </p>
                  </Link>

                  <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                    {/* Tags */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {post.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-xs font-normal text-muted-foreground border-border hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Vote summary for mobile */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground md:hidden">
                      <div className="flex items-center bg-transparent rounded-none h-7 overflow-hidden">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleVote(post.id, "up", post.authorId)}
                          className={`h-7 w-7 rounded-none ${
                            post.upvotes.includes(currentUserId)
                              ? "text-blue-600 bg-blue-50/50"
                              : "text-muted-foreground"
                          }`}
                        >
                          <ArrowUpIcon
                            className="h-3.5 w-3.5"
                            weight={post.upvotes.includes(currentUserId) ? "bold" : "regular"}
                          />
                        </Button>
                        <span className="px-2 font-bold text-foreground text-xs">{score}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleVote(post.id, "down", post.authorId)}
                          className={`h-7 w-7 rounded-none ${
                            post.downvotes.includes(currentUserId)
                              ? "text-red-600 bg-red-50/50"
                              : "text-muted-foreground"
                          }`}
                        >
                          <ArrowDownIcon
                            className="h-3.5 w-3.5"
                            weight={post.downvotes.includes(currentUserId) ? "bold" : "regular"}
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
            );
          })
        )}
      </div>
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6 animate-pulse">
        <div className="h-6 w-64 bg-muted rounded" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded" />
          ))}
        </div>
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}
