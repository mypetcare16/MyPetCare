"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import {
  AuthLoading,
  Authenticated,
  Unauthenticated,
  useQuery,
} from "convex/react";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { Loading } from "@/components/shared/Loading";
import Logo from "@/components/common/Logo";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const loggedInEmail = user?.emailAddresses[0]?.emailAddress || "";

  // Query to fetch user role from the database
  const userExists = useQuery(api.users.checkUserEmail, {
    email: loggedInEmail,
  });

  const closeMenu = () => setMenuOpen(false);

  const handleDashboardNavigation = () => {
    if (userExists?.role) {
      const roleDashboards: Record<string, string> = {
        Doctor: "/dashboard",
        Desk: "/registrationdesk",
        Patient: "/homepage",
        Admin: "/hospitals",
      };
      const rolePath = roleDashboards[userExists.role] || "/";
      router.push(rolePath);
      closeMenu();
    }
  };

  return (
    <header className="bg-white dark:bg-blue-500 shadow-md sticky top-0 z-50 w-full px-5">
      <div className="container w-full mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <Logo />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <a
            href="#features"
            className="text-lg text-blue-500 dark:text-gray-300 hover:text-blue-500"
          >
            Features
          </a>
          <a
            href="#benefits"
            className="text-lg text-blue-500 dark:text-gray-300 hover:text-blue-500"
          >
            Benefits
          </a>
          <a
            href="#testimonials"
            className="text-lg text-blue-500 dark:text-gray-300 hover:text-blue-500"
          >
            Testimonials
          </a>
          <AuthLoading>
            <Loading />
          </AuthLoading>
          <Unauthenticated>
            <SignInButton>
              <Button
                variant="ghost"
                className="text-base font-bold text-[#2178e9] hover:text-blue-500"
              >
                Log in
              </Button>
            </SignInButton>
            <SignInButton>
              <Button className="bg-[#2178e9] text-white hover:bg-[#0067ee]">
                Get Started
              </Button>
            </SignInButton>
          </Unauthenticated>
          <Authenticated>
            <UserButton />
            <Button
              className="bg-[#2178e9] text-white hover:bg-[#0769e9]"
              onClick={handleDashboardNavigation}
            >
              Dashboard
            </Button>
          </Authenticated>
        </nav>

        {/* Mobile Menu Button (Only visible on mobile) */}
        <div className="flex items-center md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMenuOpen(!menuOpen)}
            className="ml-auto"
          >
            <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <nav className="md:hidden flex flex-col absolute top-16 left-0 w-full bg-white dark:bg-gray-800 p-4 shadow-lg z-50 space-y-4">
          <a
            href="#features"
            className="text-lg text-gray-700 dark:text-gray-300 hover:text-blue-500"
            onClick={closeMenu}
          >
            Features
          </a>
          <a
            href="#benefits"
            className="text-lg text-gray-700 dark:text-gray-300 hover:text-blue-500"
            onClick={closeMenu}
          >
            Benefits
          </a>
          <a
            href="#testimonials"
            className="text-lg text-gray-700 dark:text-gray-300 hover:text-blue-500"
            onClick={closeMenu}
          >
            Testimonials
          </a>
          <AuthLoading>
            <Loading />
          </AuthLoading>
          <Unauthenticated>
            <SignInButton>
              <Button
                variant="ghost"
                className="text-base font-bold text-[#3292f7] hover:text-blue-500"
                onClick={closeMenu}
              >
                Log in
              </Button>
            </SignInButton>
            <SignInButton>
              <Button
                className="bg-[#3292f7] text-white hover:bg-[#1e7df8]"
                onClick={closeMenu}
              >
                Get Started
              </Button>
            </SignInButton>
          </Unauthenticated>
          <Authenticated>
            <UserButton />
            <Button
              className="bg-[#3292f7] text-white hover:bg-[#2a83f7] w-full mt-4"
              onClick={handleDashboardNavigation}
            >
              Dashboard
            </Button>
          </Authenticated>
        </nav>
      )}
    </header>
  );
}
