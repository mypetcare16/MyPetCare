"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Header() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const navigation = [
    { name: "About", href: "/about" },
    { name: "Medical Team", href: "/medical-team" },
    { name: "Blog", href: "/blog" },
  ];

  const handleDashboardClick = () => {
    router.push("/dashboardpage");
    setIsSheetOpen(false);
  };

  if (!isLoaded) {
    return null; // or a loading spinner
  }

  return (
    <header className="px-4 lg:px-6 h-16 flex items-center justify-between border-b bg-white/50 backdrop-blur-sm fixed w-full z-50">
      <Link className="flex items-center justify-center" href="/homepage">
        <span className="font-bold text-xl md:text-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">
          MyMedirecords
        </span>
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-6">
        {navigation.map((item) => (
          <Link
            key={item.name}
            className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors relative after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-0 after:bg-blue-600 after:transition-all hover:after:w-full"
            href={item.href}
          >
            {item.name}
          </Link>
        ))}

        {isSignedIn ? (
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleDashboardClick}
              variant="ghost"
              className="text-sm font-medium hover:text-blue-600 transition-colors"
            >
              Dashboard
            </Button>
            <UserButton
              afterSignOutUrl="/homepage"
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9",
                },
              }}
            />
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <SignInButton mode="modal">
              <Button
                variant="ghost"
                className="text-sm font-medium hover:text-blue-600 transition-colors"
              >
                Login
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button className="bg-gradient-to-r from-blue-600 to-sky-400 text-white hover:opacity-90 transition-opacity">
                Sign Up
              </Button>
            </SignUpButton>
          </div>
        )}
      </nav>

      {/* Mobile Navigation */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button className="md:hidden" variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <div className="flex flex-col gap-6 mt-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                className="text-lg font-medium text-gray-600 hover:text-blue-600 transition-colors"
                href={item.href}
                onClick={() => setIsSheetOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {isSignedIn ? (
              <div className="flex flex-col gap-4">
                <Button
                  onClick={handleDashboardClick}
                  variant="ghost"
                  className="justify-start text-lg font-medium hover:text-blue-600"
                >
                  Dashboard
                </Button>
                <UserButton
                  afterSignOutUrl="/homepage"
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10",
                    },
                  }}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <SignInButton mode="modal">
                  <Button
                    variant="ghost"
                    className="justify-start text-lg font-medium"
                  >
                    Login
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button className="bg-gradient-to-r from-blue-600 to-sky-400 text-white hover:opacity-90 transition-opacity w-full justify-start text-lg font-medium">
                    Sign Up
                  </Button>
                </SignUpButton>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
