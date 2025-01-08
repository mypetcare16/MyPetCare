"use client";

import FixedNavigation from "@/app/(private)/(main)/navigation";
import RoleSelection from "@/app/(private)/roleselection/page";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

export default function RoleBasedNavigation({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const { user, isSignedIn } = useUser();
  const loggedInEmail = user?.emailAddresses[0]?.emailAddress || "";
  const userId = user?.id || "";
  const pathname = usePathname();
  const router = useRouter();

  // Query to check if user email is present in users table
  const userExists = useQuery(api.users.checkUserEmail, {
    email: loggedInEmail,
  });

  useEffect(() => {
    if (userExists) {
      const currentPath = pathname.split("/")[1]; // Get the first part of the path
      const roleDashboards = {
        Doctor: "/dashboard",
        Desk: "/registrationdesk",
        Patient: "/homepage",
        Admin: "/hospitals",
      };

      const userRole = userExists.role as keyof typeof roleDashboards;
      const correctDashboard = roleDashboards[userRole];

      // Only redirect if the user is not on their correct dashboard
      if (currentPath !== correctDashboard) {
        router.push(`/${correctDashboard}`);
      }
    }
  }, [userExists, pathname, router]);

  const handleRoleSelected = (role: string) => {
    setUserRole(role);
    setShowRoleSelection(true);
  };

  return (
    <>
      {showRoleSelection ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <FixedNavigation />
          </div>
        </div>
      ) : (
        children
      )}
    </>
  );
}
