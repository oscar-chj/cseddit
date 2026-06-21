"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpIcon, ArrowDownIcon, ChatIcon, ImageIcon, LinkIcon, ChartBarIcon } from "@phosphor-icons/react";
import { getPosts, votePost, getCurrentUserId } from "@/lib/mockDb";
import { Post } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatTimeAgo, getPostTypeIcon } from "@/lib/utils";

export default function Dashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<"latest" | "trending">("latest");
  const [visibleCount, setVisibleCount] = useState(5);
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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-8 animate-pulse">
        <div className="h-6 w-48 bg-muted rounded-none" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-none" />
          ))}
        </div>
        <div className="h-10 w-full bg-muted rounded-none" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-none" />
          ))}
        </div>
      </div>
    );
  }

  // Filter posts
  const featuredPosts = posts.filter((p) => p.isFeatured).slice(0, 3);
  const feedPosts = [...posts];

  if (activeTab === "latest") {
    feedPosts.sort((a, b) => b.timestamp - a.timestamp);
  } else {
    feedPosts.sort((a, b) => {
      const scoreA = a.upvotes.length - a.downvotes.length;
      const scoreB = b.upvotes.length - b.downvotes.length;
      return scoreB - scoreA;
    });
  }

  const displayedPosts = feedPosts.slice(0, visibleCount);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-8">
      {/* Featured Section */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Featured Questions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredPosts.map((post) => {
            const score = post.upvotes.length - post.downvotes.length;
            return (
              <Card key={post.id} className="border-border rounded-none hover:border-blue-500/50 transition-colors flex flex-col justify-between">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px] bg-blue-100 text-blue-800">
                          {post.authorAvatar}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground font-medium truncate max-w-[120px]">
                        {post.authorName}
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-normal px-2 bg-blue-50 text-blue-700 hover:bg-blue-50 border-none">
                      {post.tags[0]}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm font-bold line-clamp-2 hover:text-blue-600 transition-colors flex items-center gap-1.5">
                    {getPostTypeIcon(post.postType)}
                    <Link href={`/posts/${post.id}`}>{post.title}</Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-xs text-muted-foreground flex items-center justify-between mt-auto">
                  <span>{formatTimeAgo(post.timestamp)}</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-medium text-foreground">
                      <ArrowUpIcon className="h-3.5 w-3.5 text-blue-600" />
                      {score}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Main feed list */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-3">
          <h2 className="text-lg font-bold text-foreground">Recent Discussions</h2>
          <Tabs
            defaultValue="latest"
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as "latest" | "trending")}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid grid-cols-2 w-full sm:w-[200px] h-9">
              <TabsTrigger value="latest" className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Latest
              </TabsTrigger>
              <TabsTrigger value="trending" className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Trending
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Chronological feed post cards */}
        <div className="divide-y divide-border border rounded-none overflow-hidden bg-card">
          {displayedPosts.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No discussions found.
            </div>
          ) : (
            displayedPosts.map((post) => {
              const score = post.upvotes.length - post.downvotes.length;
              return (
                <div
                  key={post.id}
                  className="p-5 hover:bg-muted/30 transition-colors flex flex-col md:flex-row md:items-start gap-4"
                >
                  {/* Scores Sidebar (Desktop) */}
                  <div className="hidden md:flex flex-col items-center justify-center gap-1.5 text-center min-w-[50px] py-2 bg-muted/20 border border-border rounded-none">
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
                        <div className="flex items-center border border-border bg-muted/20 rounded-none h-7 overflow-hidden">
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
                          Answer
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
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
              className="rounded-none border-border hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              Load more
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
