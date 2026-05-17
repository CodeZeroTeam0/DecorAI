"use client";

import { CartSheet } from "@/components/cart-sheet";
import { BACKEND_URL } from "@/lib/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, User, LogOut, History, Settings, Menu } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const userInitials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  const navLinks = [
    { href: "/#products", label: "Shop" },
    { href: "/#collections", label: "Collections" },
    { href: "/ai-preview", label: "AI Preview" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[250px] sm:w-[300px] flex flex-col">
              <div className="flex flex-col gap-4 py-4 flex-1">
                <Link
                  href="/"
                  className="flex items-center space-x-2 mb-4"
                  onClick={() => setIsOpen(false)}
                >
                  <Sparkles className="h-6 w-6 text-primary" />
                  <span className="font-bold text-xl tracking-tight">DecorAI</span>
                </Link>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-lg font-medium transition-colors hover:text-primary"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="border-t pt-4 mt-auto">
                {session ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 px-2">
                      <Avatar className="h-10 w-10 border border-border">
                        <AvatarImage
                          src={session.user?.image ? (session.user.image.startsWith('http') ? session.user.image : `${BACKEND_URL}${session.user.image}`) : ""}
                          alt={session.user?.name || "User"}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium">{session.user?.name}</p>
                        <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full justify-start" asChild onClick={() => setIsOpen(false)}>
                      <Link href="/my-designs">
                        <History className="mr-2 h-4 w-4" />
                        My Designs
                      </Link>
                    </Button>
                    <Button variant="destructive" className="w-full justify-start" onClick={() => signOut()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </Button>
                  </div>
                ) : (
                  <Button className="w-full" asChild onClick={() => setIsOpen(false)}>
                    <Link href="/login">Log in</Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl tracking-tight hidden sm:inline-block">
              DecorAI
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground text-foreground/60"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          <CartSheet />
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8 border border-border">
                    <AvatarImage
                      src={session.user?.image ? (session.user.image.startsWith('http') ? session.user.image : `${BACKEND_URL}${session.user.image}`) : ""}
                      alt={session.user?.name || "User"}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session.user?.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/my-designs" className="cursor-pointer w-full flex items-center">
                    <History className="mr-2 h-4 w-4" />
                    <span>My Designs</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={() => signOut()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" className="hidden sm:inline-flex" asChild>
              <Link href="/login">Log in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
