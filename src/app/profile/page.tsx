"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentUser, updateUserProfile, getPosts } from "@/lib/mockDb";
import { User, Post } from "@/types";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Star, ThumbsUp, ThumbsDown, BookOpen } from "@phosphor-icons/react";

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

export default function UserProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [mounted, setMounted] = useState(false);

  const loadData = () => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      const allPosts = getPosts();
      const filtered = allPosts.filter((p) => p.authorId === currentUser.id);
      setUserPosts(filtered);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  const handleToggleAnonymity = (checked: boolean) => {
    if (!user) return;
    const updated = updateUserProfile(user.id, { anonymousByDefault: checked });
    if (updated) {
      setUser(updated);
      toast(checked ? "Anonymous by default enabled" : "Anonymous by default disabled");
    }
  };

  if (!mounted || !user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6 space-y-6 animate-pulse">
        <div className="h-48 bg-muted rounded-lg" />
        <div className="h-32 bg-muted rounded-lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-8">
      {/* Profile Header Card */}
      <Card className="border-border overflow-hidden bg-card">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
            {/* Left Column: Avatar & Badges */}
            <div className="flex flex-col items-center gap-4 min-w-[150px]">
              <Avatar className="h-24 w-24 border-2 border-blue-500/20 shadow-md flex items-center justify-center">
                <AvatarFallback className="bg-blue-100 text-blue-800 text-4xl font-semibold">
                  {user.avatar}
                </AvatarFallback>
              </Avatar>

              {/* Badges Shelf */}
              <div className="space-y-1.5 text-center">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                  Earned Badges
                </span>
                <div className="flex items-center gap-1.5 justify-center bg-muted/40 px-3 py-1.5 rounded-full border border-border">
                  {user.badges.map((badge, idx) => (
                    <span
                      key={idx}
                      className="text-lg hover:scale-125 transition-transform cursor-help"
                      title={`Earned badge ${badge}`}
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Name, Title, Bio, Settings */}
            <div className="flex-1 space-y-4 text-center md:text-left w-full">
              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">{user.name}</h1>
                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">
                  {user.title}
                </p>
                <p className="text-xs text-muted-foreground">@{user.username}</p>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {user.bio || "No biography provided."}
              </p>

              {/* Stats Counters */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6 pt-2">
                <div className="flex items-center gap-2 bg-blue-50/50 border border-blue-100 px-3.5 py-2 rounded-lg">
                  <Star className="h-5 w-5 text-blue-600" weight="fill" />
                  <div className="text-left">
                    <span className="block text-sm font-bold text-foreground leading-none">
                      {user.reputation}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">Reputation</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-emerald-50/50 border border-emerald-100 px-3.5 py-2 rounded-lg">
                  <ThumbsUp className="h-5 w-5 text-emerald-600" weight="fill" />
                  <div className="text-left">
                    <span className="block text-sm font-bold text-foreground leading-none">
                      {user.likes}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">Likes</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-red-50/50 border border-red-100 px-3.5 py-2 rounded-lg">
                  <ThumbsDown className="h-5 w-5 text-red-600" weight="fill" />
                  <div className="text-left">
                    <span className="block text-sm font-bold text-foreground leading-none">
                      {user.dislikes}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">Dislikes</span>
                  </div>
                </div>
              </div>

              {/* Default Anonymity Setting Toggle */}
              <div className="flex items-center justify-center md:justify-start gap-3 pt-4 border-t border-border">
                <Switch
                  id="default-anonymity"
                  checked={user.anonymousByDefault}
                  onCheckedChange={handleToggleAnonymity}
                  className="data-[state=checked]:bg-blue-600"
                />
                <Label htmlFor="default-anonymity" className="text-xs font-semibold cursor-pointer">
                  Publish questions anonymously by default
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User's Created Posts Feed */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          My Questions ({userPosts.length})
        </h2>

        {userPosts.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm border border-dashed rounded-lg">
            You haven&apos;t asked any questions yet.
          </div>
        ) : (
          <div className="divide-y divide-border border rounded-lg overflow-hidden bg-card">
            {userPosts.map((post) => {
              const postScore = post.upvotes.length - post.downvotes.length;
              return (
                <div
                  key={post.id}
                  className="p-4 sm:p-5 hover:bg-muted/30 transition-colors flex items-start justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <Link
                      href={`/posts/${post.id}`}
                      className="text-sm sm:text-base font-bold text-foreground hover:text-blue-600 transition-colors block"
                    >
                      {post.title}
                    </Link>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span>Asked {formatTimeAgo(post.timestamp)}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        {post.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-[10px] font-normal text-muted-foreground py-0 border-border hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center px-3 py-1.5 bg-muted/40 rounded-md border border-border min-w-[60px] text-center">
                    <span className="text-xs font-bold text-foreground">{postScore}</span>
                    <span className="text-[9px] text-muted-foreground uppercase font-medium mt-0.5">
                      votes
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
