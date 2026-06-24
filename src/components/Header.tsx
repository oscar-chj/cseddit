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
            <span className="text-lg font-bold text-primary">CSeddit</span>
          </div>
          <div className="h-8 w-8 animate-pulse bg-muted" />
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
            <ChatsIcon className="h-6 w-6 text-primary" weight="fill" />
            <span className="hidden text-xl font-extrabold tracking-tight text-primary sm:inline">
              CSeddit
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <Link
              href="/"
              className={`transition-colors hover:text-primary ${
                pathname === "/" ? "text-primary font-semibold" : "text-muted-foreground"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/leaderboard"
              className={`flex items-center gap-1 transition-colors hover:text-primary ${
                pathname === "/leaderboard"
                  ? "text-primary font-semibold"
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
              placeholder="Search discussions…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full border border-muted-foreground/50 bg-background/50 pr-14 pl-9 focus-visible:border-ring focus-visible:ring-ring"
              aria-label="Search discussions"
            />
            {searchQuery.trim() !== "" && (
              <div className="pointer-events-none absolute right-3 hidden items-center border border-border bg-background px-1 py-0.5 font-mono text-[9px] text-muted-foreground select-none sm:flex">
                ↵ Enter
              </div>
            )}
          </div>
        </form>
 
        {/* Right Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Button
            size="sm"
            className="flex gap-1"
            asChild
          >
            <Link href="/create">
              <PlusIcon className="h-4 w-4" weight="bold" />
              <span className="hidden sm:inline">Ask Question</span>
            </Link>
          </Button>
 
          {/* Leaderboard Icon (Mobile only) */}
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9 md:hidden"
            aria-label="View Leaderboard"
            asChild
          >
            <Link href="/leaderboard">
              <TrophyIcon className="h-5 w-5 text-muted-foreground" />
            </Link>
          </Button>
 
          {/* Switchable User Dropdown Switcher */}
          {currentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 border border-border p-0"
                >
                  <Avatar className="flex h-8 w-8 items-center justify-center">
                    <AvatarFallback className="text-base font-semibold">
                      {currentUser.avatar}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
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
                      <span className="h-1.5 w-1.5 bg-primary" />
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
