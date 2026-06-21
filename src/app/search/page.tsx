"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowUpIcon, ChatIcon } from "@phosphor-icons/react";
import { getPosts } from "@/lib/mockDb";
import { Post } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

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

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [posts, setPosts] = useState<Post[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const allPosts = getPosts();
    setTimeout(() => {
      setMounted(true);
      setPosts(allPosts);
    }, 0);
  }, []);

  if (!mounted) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6 animate-pulse">
        <div className="h-6 w-64 bg-muted rounded" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded" />
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

      <div className="divide-y divide-border border rounded-lg overflow-hidden bg-card">
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
                <Button size="sm" variant="outline" className="border-border hover:bg-blue-50 hover:text-blue-600 transition-colors">
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
                <div className="hidden md:flex flex-col items-center justify-center gap-1 text-center min-w-[70px] py-1 bg-muted/40 rounded-md border border-border">
                  <span className="text-sm font-bold text-foreground">{score}</span>
                  <span className="text-[10px] text-muted-foreground uppercase font-medium">votes</span>
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
                        <span className="inline-flex items-center gap-0.5 text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded text-[10px]">
                          Featured
                        </span>
                      </>
                    )}
                  </div>

                  <Link href={`/posts/${post.id}`} className="block group">
                    <h3 className="text-base font-bold text-foreground group-hover:text-blue-600 transition-colors">
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
                      <span className="flex items-center gap-1">
                        <ArrowUpIcon className="h-3.5 w-3.5" />
                        {score}
                      </span>
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
