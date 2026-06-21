"use client";

import React, { useEffect, useState } from "react";
import { getUsers } from "@/lib/mockDb";
import { User } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrophyIcon, StarIcon, ThumbsUpIcon, ThumbsDownIcon } from "@phosphor-icons/react";

export default function LeaderboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [sortBy, setSortBy] = useState<"reputation" | "likes" | "dislikes">("reputation");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const list = getUsers();
    setTimeout(() => {
      setMounted(true);
      setUsers(list);
    }, 0);
  }, []);

  if (!mounted) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6 space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-muted rounded" />
        <div className="h-48 bg-muted rounded-lg" />
      </div>
    );
  }

  // Sort users based on selected ranking preference
  const sortedUsers = [...users].sort((a, b) => {
    if (sortBy === "likes") {
      return b.likes - a.likes;
    } else if (sortBy === "dislikes") {
      return b.dislikes - a.dislikes;
    } else {
      return b.reputation - a.reputation;
    }
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
      {/* Title & Filter Options */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4 gap-4">
        <div className="space-y-0.5">
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <TrophyIcon className="h-6 w-6 text-yellow-500" weight="fill" />
            Contributor Leaderboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Top active experts in the community ranked by reputation and engagement.
          </p>
        </div>

        {/* Filter select */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Sort by</span>
          <Select
            value={sortBy}
            onValueChange={(val) => setSortBy(val as "reputation" | "likes" | "dislikes")}
          >
            <SelectTrigger className="w-[150px] h-9 text-xs border-border">
              <SelectValue placeholder="Ranking Criteria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="reputation" className="text-xs">Reputation</SelectItem>
              <SelectItem value="likes" className="text-xs">Total Likes</SelectItem>
              <SelectItem value="dislikes" className="text-xs">Total Dislikes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Rankings List/Table */}
      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <div className="divide-y divide-border">
          {sortedUsers.map((user, idx) => {
            const rank = idx + 1;
            const isFirst = rank === 1;

            return (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors gap-4"
              >
                {/* Left side: Rank + Avatar + Name + Title */}
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  {/* Rank badge */}
                  <div className="flex items-center justify-center h-8 w-8 min-w-[32px] rounded-full bg-muted border border-border">
                    {isFirst ? (
                      <TrophyIcon className="h-4 w-4 text-yellow-500" weight="fill" />
                    ) : (
                      <span className="text-xs font-bold text-muted-foreground">{rank}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <Avatar className="h-10 w-10 border border-border flex items-center justify-center">
                    <AvatarFallback className="bg-blue-50 text-blue-800 text-lg font-semibold">
                      {user.avatar}
                    </AvatarFallback>
                  </Avatar>

                  {/* User details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-foreground truncate">{user.name}</span>
                      {isFirst && (
                        <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white text-[9px] font-bold px-1.5 py-0 border-none uppercase tracking-wide">
                          Top Contributor
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate leading-relaxed mt-0.5">
                      {user.title}
                    </p>
                  </div>
                </div>

                {/* Right side: Stats value */}
                <div className="flex items-center gap-4 text-right">
                  {sortBy === "likes" ? (
                    <div className="flex items-center gap-1.5 text-emerald-600">
                      <ThumbsUpIcon className="h-4 w-4" weight="fill" />
                      <span className="text-sm font-bold">{user.likes}</span>
                    </div>
                  ) : sortBy === "dislikes" ? (
                    <div className="flex items-center gap-1.5 text-red-600">
                      <ThumbsDownIcon className="h-4 w-4" weight="fill" />
                      <span className="text-sm font-bold">{user.dislikes}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-blue-600">
                      <StarIcon className="h-4 w-4" weight="fill" />
                      <span className="text-sm font-bold">{user.reputation}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
