"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { getCurrentUser, getUsers, setCurrentUserId } from "@/lib/mockDb"
import { User } from "@/types"
import {
  ChatsIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TrophyIcon,
} from "@phosphor-icons/react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"
import { toast } from "sonner"

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const user = getCurrentUser()
    const users = getUsers()
    setTimeout(() => {
      setMounted(true)
      setCurrentUser(user)
      setAllUsers(users)
    }, 0)
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleUserSwitch = (userId: string, userName: string) => {
    setCurrentUserId(userId)
    toast(`Logged in as ${userName}`)
    window.location.reload()
  }

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <span className="text-lg font-bold text-blue-600">CSeddit</span>
          </div>
          <div className="h-8 w-8 animate-pulse rounded-none bg-muted" />
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand & Left Navigation */}
        <div className="flex items-center gap-6 md:gap-8">
          <Link href="/" className="flex items-center gap-2">
            <ChatsIcon className="h-6 w-6 text-blue-600" weight="fill" />
            <span className="hidden text-xl font-extrabold tracking-tight text-blue-600 sm:inline">
              CSeddit
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <Link
              href="/"
              className={`transition-colors hover:text-blue-600 ${
                pathname === "/" ? "text-blue-600" : "text-muted-foreground"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/leaderboard"
              className={`flex items-center gap-1 transition-colors hover:text-blue-600 ${
                pathname === "/leaderboard"
                  ? "text-blue-600"
                  : "text-muted-foreground"
              }`}
            >
              <TrophyIcon className="h-4 w-4" />
              Leaderboard
            </Link>
          </nav>
        </div>

        {/* Global Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="mx-1 max-w-xs flex-1 sm:mx-8 sm:max-w-md"
        >
          <div className="relative flex items-center">
            <MagnifyingGlassIcon className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-none border-muted bg-muted/50 pl-9 pr-14 focus-visible:ring-blue-500"
            />
            {searchQuery.trim() !== "" && (
              <div className="absolute right-3 hidden items-center text-[9px] font-mono text-muted-foreground border border-border px-1 py-0.5 rounded-none bg-background select-none pointer-events-none sm:flex">
                ↵ Enter
              </div>
            )}
          </div>
        </form>

        {/* Right Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/create">
            <Button
              size="sm"
              className="flex gap-1 rounded-none bg-blue-600 text-white hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4" weight="bold" />
              <span className="hidden sm:inline">Ask Question</span>
            </Button>
          </Link>

          {/* Leaderboard Icon (Mobile only) */}
          <Link href="/leaderboard" className="md:hidden">
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 rounded-none"
            >
              <TrophyIcon className="h-5 w-5 text-muted-foreground" />
            </Button>
          </Link>

          {/* Switchable User Dropdown Switcher */}
          {currentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-none border border-muted/50 p-0"
                >
                  <Avatar className="flex h-8 w-8 items-center justify-center">
                    <AvatarFallback className="bg-blue-100 text-base font-semibold text-blue-800">
                      {currentUser.avatar}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-none">
                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                  Logged in as
                </DropdownMenuLabel>
                <div className="flex items-center gap-2 p-2">
                  <span className="text-xl">{currentUser.avatar}</span>
                  <div className="flex flex-col">
                    <span className="text-sm leading-none font-medium">
                      {currentUser.name}
                    </span>
                    <span className="mt-0.5 text-xs text-muted-foreground">
                      @{currentUser.username}
                    </span>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href={`/profiles/${currentUser.id}`}
                    className="w-full cursor-pointer"
                  >
                    View profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                  Simulate switching user
                </DropdownMenuLabel>
                {allUsers.map((user) => (
                  <DropdownMenuItem
                    key={user.id}
                    onClick={() => handleUserSwitch(user.id, user.name)}
                    className={`flex cursor-pointer items-center justify-between ${
                      user.id === currentUser.id ? "bg-muted font-medium" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{user.avatar}</span>
                      <span>{user.name}</span>
                    </div>
                    {user.id === currentUser.id && (
                      <span className="h-1.5 w-1.5 rounded-none bg-blue-500" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}
