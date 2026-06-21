"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getUsers } from "@/lib/mockDb"
import { User } from "@/types"
import { StarIcon, ThumbsUpIcon, TrophyIcon } from "@phosphor-icons/react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function LeaderboardPage() {
  const [users, setUsers] = useState<User[]>([])
  const [sortBy, setSortBy] = useState<"reputation" | "likes">("reputation")
  const [deptFilter, setDeptFilter] = useState<string>("all")
  const [yosFilter, setYosFilter] = useState<string>("all")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const list = getUsers()
    setTimeout(() => {
      setMounted(true)
      setUsers(list)
    }, 0)
  }, [])

  if (!mounted) {
    return (
      <div className="mx-auto max-w-4xl animate-pulse space-y-6 px-4 py-6">
        <div className="h-8 w-64 rounded-none bg-muted" />
        <div className="h-48 rounded-none bg-muted" />
      </div>
    )
  }

  // Filter users based on selected department and year of study
  const filteredUsers = users.filter((user) => {
    const matchesDept = deptFilter === "all" || user.department === deptFilter
    const matchesYos = yosFilter === "all" || user.yearOfStudy === yosFilter
    return matchesDept && matchesYos
  })

  // Sort filtered users based on selected ranking preference
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === "likes") {
      return b.likes - a.likes
    } else {
      return b.reputation - a.reputation
    }
  })

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      {/* Title & Filter Options */}
      <div className="flex flex-col gap-4 border-b border-border pb-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-0.5">
          <h1 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <TrophyIcon className="h-6 w-6 text-yellow-500" weight="fill" />
            Contributor Leaderboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Top active experts in the community ranked by reputation and
            engagement.
          </p>
        </div>

        {/* Filter selects */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold whitespace-nowrap text-muted-foreground">
              Department
            </span>
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="h-9 w-[160px] border-border text-xs">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">
                  All Departments
                </SelectItem>
                <SelectItem value="Computer Science" className="text-xs">
                  Computer Science
                </SelectItem>
                <SelectItem value="Software Engineering" className="text-xs">
                  Software Engineering
                </SelectItem>
                <SelectItem value="Networking" className="text-xs">
                  Networking
                </SelectItem>
                <SelectItem value="Multimedia" className="text-xs">
                  Multimedia
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Year of Study Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold whitespace-nowrap text-muted-foreground">
              Year of Study
            </span>
            <Select value={yosFilter} onValueChange={setYosFilter}>
              <SelectTrigger className="h-9 w-[140px] border-border text-xs">
                <SelectValue placeholder="All Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">
                  All Years
                </SelectItem>
                <SelectItem value="1st Year" className="text-xs">
                  1st Year
                </SelectItem>
                <SelectItem value="2nd Year" className="text-xs">
                  2nd Year
                </SelectItem>
                <SelectItem value="3rd Year" className="text-xs">
                  3rd Year
                </SelectItem>
                <SelectItem value="4th Year" className="text-xs">
                  4th Year
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort by Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold whitespace-nowrap text-muted-foreground">
              Sort by
            </span>
            <Select
              value={sortBy}
              onValueChange={(val) => setSortBy(val as "reputation" | "likes")}
            >
              <SelectTrigger className="h-9 w-[130px] border-border text-xs">
                <SelectValue placeholder="Ranking Criteria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reputation" className="text-xs">
                  Reputation
                </SelectItem>
                <SelectItem value="likes" className="text-xs">
                  Total Likes
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Rankings List/Table */}
      <div className="overflow-hidden rounded-none border border-border bg-card">
        {sortedUsers.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No contributors found matching the selected filters.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {sortedUsers.map((user, idx) => {
              const rank = idx + 1
              const isFirst = rank === 1

              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-muted/30"
                >
                  {/* Left side: Rank + Avatar + Name + Title */}
                  <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
                    {/* Rank badge */}
                    <div className="flex h-8 w-8 min-w-[32px] items-center justify-center rounded-none border border-border bg-muted">
                      {isFirst ? (
                        <TrophyIcon
                          className="h-4 w-4 text-yellow-500"
                          weight="fill"
                        />
                      ) : (
                        <span className="text-xs font-bold text-muted-foreground">
                          {rank}
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/profiles/${user.id}`}
                      className="flex min-w-0 flex-1 items-center gap-3 hover:opacity-85 sm:gap-4"
                    >
                      {/* Avatar */}
                      <Avatar className="flex h-10 w-10 items-center justify-center border border-border">
                        <AvatarFallback className="bg-blue-50 text-lg font-semibold text-blue-800">
                          {user.avatar}
                        </AvatarFallback>
                      </Avatar>

                      {/* User details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate text-sm font-bold text-foreground transition-colors hover:text-blue-600">
                            {user.name}
                          </span>
                          {isFirst && (
                            <Badge className="rounded-none border-none bg-yellow-500 px-1.5 py-0 text-[9px] font-bold tracking-wide text-white uppercase hover:bg-yellow-600">
                              Top Contributor
                            </Badge>
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-[11px] leading-relaxed text-muted-foreground">
                          {user.title}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <Badge
                            variant="outline"
                            className="rounded-none border-border px-1.5 py-0 text-[9px] font-medium text-muted-foreground"
                          >
                            Dept: {user.department}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="rounded-none border-border px-1.5 py-0 text-[9px] font-medium text-muted-foreground"
                          >
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
                    ) : (
                      <div className="flex items-center gap-1.5 text-blue-600">
                        <StarIcon className="h-4 w-4" weight="fill" />
                        <span className="text-sm font-bold">
                          {user.reputation}
                        </span>
                      </div>
                    )}
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
