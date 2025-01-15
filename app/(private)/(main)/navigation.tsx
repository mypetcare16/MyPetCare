"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  UserCheck,
  Search,
  Calendar,
  FileText,
  Settings,
  Plus,
  Menu,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Logo from "@/components/common/Logo";
import {
  AuthLoading,
  Authenticated,
  Unauthenticated,
  useQuery,
} from "convex/react";
import { Loading } from "@/components/shared/Loading";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const doctorMenuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Consultation", icon: Users, path: "/consultation" },
  { name: "Add Pet Details", icon: UserPlus, path: "/registerpatient" },
];

const patientMenuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/patientdashboard" },
  { name: "Appointments", icon: Calendar, path: "/appointments" },
  { name: "Medical Records", icon: FileText, path: "/medicalrecords" },
];

const adminMenuItems = [
  { name: "Create Hospital", icon: LayoutDashboard, path: "/hospitals" },
  { name: "Create User", icon: Calendar, path: "/users" },
];

const deskMenuItems = [
  {
    name: "Registration Desk",
    icon: LayoutDashboard,
    path: "/registrationdesk",
  },
  // { name: "Add Patient", icon: UserPlus, path: "/registerpatient" },
  { name: "Appointment", icon: Plus, path: "/appointment" },
];

export default function FixedNavigation() {
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [initialRedirect, setInitialRedirect] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  const loggedInEmail = user?.emailAddresses[0]?.emailAddress || "";
  const userId = user?.id || "";

  const userExists = useQuery(api.users.checkUserEmail, {
    email: loggedInEmail,
  });

  const patients = useQuery(api.patientsearch.searchPatients, {
    searchTerm,
    doctorId: userId,
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleResultClick = (patientId: string) => {
    router.push(`/consultation?patientId=${encodeURIComponent(patientId)}`);
    setIsOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    if (userExists) {
      switch (userExists.role) {
        case "Doctor":
          router.push("/dashboard");
          break;
        case "Desk":
          router.push("/registrationdesk");
          break;
        case "Patient":
          router.push("/homepage");
          break;
        case "Admin":
          router.push("/hospitals");
          break;
        default:
          router.push("/");
      }
    } else {
      router.push("/");
    }
  };

  const handleMenuItemClick = (path: string) => {
    router.push(path);
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    if (userExists && !initialRedirect) {
      const currentPath = pathname.split("/")[1];
      const roleDashboards = {
        Doctor: "dashboard",
        Desk: "registrationdesk",
        Patient: "homepage",
        Admin: "hospitals",
      };

      const userRole = userExists.role as keyof typeof roleDashboards;
      const correctDashboard = roleDashboards[userRole];

      if (
        currentPath !== correctDashboard &&
        !sessionStorage.getItem("redirected")
      ) {
        router.push(`/${correctDashboard}`);
        sessionStorage.setItem("redirected", "true");
        setInitialRedirect(true);
      }
    }
  }, [userExists, pathname, router, initialRedirect]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getMenuItems = () => {
    if (!userExists) return [];
    switch (userExists.role) {
      case "Doctor":
        return doctorMenuItems;
      case "Desk":
        return deskMenuItems;
      // case "Patient":
      //   return patientMenuItems;
      case "Admin":
        return adminMenuItems;
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  const renderMenuItems = (isMobile: boolean) => (
    <>
      {menuItems.map((item) => (
        <Button
          key={item.name}
          variant="ghost"
          className={`text-gray-600 hover:text-gray-800 flex items-center ${
            pathname === item.path ? "bg-gray-100" : ""
          } ${isMobile ? "w-full justify-start" : ""}`}
          onClick={() => handleMenuItemClick(item.path)}
        >
          <item.icon className="mr-2 h-4 w-4" />
          {item.name}
        </Button>
      ))}
      {!userExists && (
        <Button
          variant="ghost"
          className={`text-gray-600 hover:text-gray-800 flex items-center ${isMobile ? "w-full justify-start" : ""}`}
          onClick={() => handleMenuItemClick("/docprofile")}
        >
          <UserCheck className="mr-2 h-4 w-4" />
          Update Profile
        </Button>
      )}
      <Button
        variant="ghost"
        className={`text-gray-600 hover:text-gray-800 flex items-center ${isMobile ? "w-full justify-start" : ""}`}
        onClick={() => handleMenuItemClick("/docprofile")}
      >
        <Settings className="mr-2 h-4 w-4" />
        Settings
      </Button>
    </>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-10">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        <div
          className="flex items-center cursor-pointer"
          onClick={handleLogoClick}
        >
          <Logo />
        </div>
        <div className="flex items-center space-x-4">
          {userExists?.role === "Doctor" && (
            <div className="relative w-64 hidden md:block" ref={searchRef}>
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Search "
                aria-label="Search "
                value={searchTerm}
                onChange={handleSearch}
                onFocus={() => setIsOpen(true)}
              />
              {isOpen && (
                <div className="absolute z-10 left-0 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                  {patients ? (
                    patients.length > 0 ? (
                      <ul
                        className="max-h-60 overflow-auto py-1"
                        role="listbox"
                      >
                        {patients.map((patient) => (
                          <li
                            key={patient._id}
                            className="px-2 py-1 text-sm hover:bg-gray-100 cursor-pointer truncate"
                            role="option"
                            onClick={() => handleResultClick(patient._id)}
                          >
                            {patient.firstName} {patient.lastName}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="p-2 text-sm text-muted-foreground">
                        No Pet found
                      </p>
                    )
                  ) : (
                    <p className="p-2 text-sm text-muted-foreground">
                      Loading...
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
          <div className="hidden md:flex items-center space-x-4">
            {renderMenuItems(false)}
          </div>
          <AuthLoading>
            <Loading />
          </AuthLoading>
          <Unauthenticated>
            <SignInButton>
              <Button
                variant="ghost"
                className="text-lg text-gray-700 dark:text-gray-300 hover:text-blue-500"
              >
                Sign In
              </Button>
            </SignInButton>
          </Unauthenticated>
          <Authenticated>
            <UserButton />
          </Authenticated>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open Menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-4">
                {userExists?.role === "Doctor" && (
                  <div className="relative w-full" ref={searchRef}>
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-8"
                      placeholder="Search Patient"
                      aria-label="Search Patient"
                      value={searchTerm}
                      onChange={handleSearch}
                      onFocus={() => setIsOpen(true)}
                    />
                    {isOpen && (
                      <div className="absolute z-10 left-0 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                        {patients ? (
                          patients.length > 0 ? (
                            <ul
                              className="max-h-60 overflow-auto py-1"
                              role="listbox"
                            >
                              {patients.map((patient) => (
                                <li
                                  key={patient._id}
                                  className="px-2 py-1 text-sm hover:bg-gray-100 cursor-pointer truncate"
                                  role="option"
                                  onClick={() => handleResultClick(patient._id)}
                                >
                                  {patient.firstName} {patient.lastName}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="p-2 text-sm text-muted-foreground">
                              No pet found
                            </p>
                          )
                        ) : (
                          <p className="p-2 text-sm text-muted-foreground">
                            Loading...
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {renderMenuItems(true)}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
