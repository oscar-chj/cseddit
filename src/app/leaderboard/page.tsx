"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
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
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [yosFilter, setYosFilter] = useState<string>("all");
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
        <div className="h-8 w-64 bg-muted rounded-none" />
        <div className="h-48 bg-muted rounded-none" />
      </div>
    );
  }

  // Filter users based on selected department and year of study
  const filteredUsers = users.filter((user) => {
    const matchesDept = deptFilter === "all" || user.department === deptFilter;
    const matchesYos = yosFilter === "all" || user.yearOfStudy === yosFilter;
    return matchesDept && matchesYos;
  });

  // Sort filtered users based on selected ranking preference
  const sortedUsers = [...filteredUsers].sort((a, b) => {
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-border pb-4 gap-4">
        <div className="space-y-0.5">
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <TrophyIcon className="h-6 w-6 text-yellow-500" weight="fill" />
            Contributor Leaderboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Top active experts in the community ranked by reputation and engagement.
          </p>
        </div>

        {/* Filter selects */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Department</span>
            <Select
              value={deptFilter}
              onValueChange={setDeptFilter}
            >
              <SelectTrigger className="w-[160px] h-9 text-xs border-border">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Departments</SelectItem>
                <SelectItem value="Computer Science" className="text-xs">Computer Science</SelectItem>
                <SelectItem value="Software Engineering" className="text-xs">Software Engineering</SelectItem>
                <SelectItem value="Networking" className="text-xs">Networking</SelectItem>
                <SelectItem value="Multimedia" className="text-xs">Multimedia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Year of Study Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Year of Study</span>
            <Select
              value={yosFilter}
              onValueChange={setYosFilter}
            >
              <SelectTrigger className="w-[140px] h-9 text-xs border-border">
                <SelectValue placeholder="All Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Years</SelectItem>
                <SelectItem value="1st Year" className="text-xs">1st Year</SelectItem>
                <SelectItem value="2nd Year" className="text-xs">2nd Year</SelectItem>
                <SelectItem value="3rd Year" className="text-xs">3rd Year</SelectItem>
                <SelectItem value="4th Year" className="text-xs">4th Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort by Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Sort by</span>
            <Select
              value={sortBy}
              onValueChange={(val) => setSortBy(val as "reputation" | "likes" | "dislikes")}
            >
              <SelectTrigger className="w-[130px] h-9 text-xs border-border">
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
      </div>

      {/* Rankings List/Table */}
      <div className="border border-border rounded-none bg-card overflow-hidden">
        {sortedUsers.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No contributors found matching the selected filters.
          </div>
        ) : (
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
                    <div className="flex items-center justify-center h-8 w-8 min-w-[32px] rounded-none bg-muted border border-border">
                      {isFirst ? (
                        <TrophyIcon className="h-4 w-4 text-yellow-500" weight="fill" />
                      ) : (
                        <span className="text-xs font-bold text-muted-foreground">{rank}</span>
                      )}
                    </div>

                    <Link href={`/profiles/${user.id}`} className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 hover:opacity-85">
                      {/* Avatar */}
                      <Avatar className="h-10 w-10 border border-border flex items-center justify-center">
                        <AvatarFallback className="bg-blue-50 text-blue-800 text-lg font-semibold">
                          {user.avatar}
                        </AvatarFallback>
                      </Avatar>

                      {/* User details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-foreground truncate hover:text-blue-600 transition-colors">
                            {user.name}
                          </span>
                          {isFirst && (
                            <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white text-[9px] font-bold px-1.5 py-0 border-none uppercase tracking-wide rounded-none">
                              Top Contributor
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate leading-relaxed mt-0.5">
                          {user.title}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <Badge variant="outline" className="text-[9px] font-medium px-1.5 py-0 border-border text-muted-foreground rounded-none">
                            Dept: {user.department}
                          </Badge>
                          <Badge variant="outline" className="text-[9px] font-medium px-1.5 py-0 border-border text-muted-foreground rounded-none">
                            Year: {user.yearOfStudy}
                          </Badge>
                        </div>
                      </div>
                    </Link>
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
        )}
      </div>
    </div>
  );
}

