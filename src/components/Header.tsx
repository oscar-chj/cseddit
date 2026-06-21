"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MagnifyingGlass, Bell, Trophy, Plus, Chats } from "@phosphor-icons/react";
import { getCurrentUser, getUsers, setCurrentUserId } from "@/lib/mockDb";
import { User } from "@/types";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrentUser(getCurrentUser());
    setAllUsers(getUsers());
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleUserSwitch = (userId: string, userName: string) => {
    setCurrentUserId(userId);
    toast(`Logged in as ${userName}`);
    window.location.reload();
  };

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <span className="text-lg font-bold text-blue-600">CSeddit</span>
          </div>
          <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md border-border">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand & Left Navigation */}
        <div className="flex items-center gap-6 md:gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Chats className="h-6 w-6 text-blue-600" weight="fill" />
            <span className="text-xl font-extrabold tracking-tight text-blue-600">CSeddit</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
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
                pathname === "/leaderboard" ? "text-blue-600" : "text-muted-foreground"
              }`}
            >
              <Trophy className="h-4 w-4" />
              Leaderboard
            </Link>
          </nav>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md mx-4 sm:mx-8">
          <div className="relative flex items-center">
            <MagnifyingGlass className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 w-full bg-muted/50 border-muted focus-visible:ring-blue-500"
            />
          </div>
        </form>

        {/* Right Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/create">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-1 flex">
              <Plus className="h-4 w-4" weight="bold" />
              <span className="hidden sm:inline">Ask Question</span>
            </Button>
          </Link>

          {/* Leaderboard Icon (Mobile only) */}
          <Link href="/leaderboard" className="md:hidden">
            <Button size="icon" variant="ghost" className="h-9 w-9">
              <Trophy className="h-5 w-5 text-muted-foreground" />
            </Button>
          </Link>

          {/* Notifications Bell */}
          <Button size="icon" variant="ghost" className="relative h-9 w-9">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-blue-600" />
          </Button>

          {/* Switchable User Dropdown Switcher */}
          {currentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 border border-muted/50">
                  <Avatar className="h-8 w-8 flex items-center justify-center">
                    <AvatarFallback className="bg-blue-100 text-blue-800 text-base font-semibold">
                      {currentUser.avatar}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-semibold text-xs text-muted-foreground">
                  Logged in as
                </DropdownMenuLabel>
                <div className="flex items-center gap-2 p-2">
                  <span className="text-xl">{currentUser.avatar}</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium leading-none">{currentUser.name}</span>
                    <span className="text-xs text-muted-foreground mt-0.5">@{currentUser.username}</span>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="w-full cursor-pointer">
                    View profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="font-semibold text-xs text-muted-foreground">
                  Simulate switching user
                </DropdownMenuLabel>
                {allUsers.map((user) => (
                  <DropdownMenuItem
                    key={user.id}
                    onClick={() => handleUserSwitch(user.id, user.name)}
                    className={`flex items-center justify-between cursor-pointer ${
                      user.id === currentUser.id ? "bg-muted font-medium" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{user.avatar}</span>
                      <span>{user.name}</span>
                    </div>
                    {user.id === currentUser.id && (
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
