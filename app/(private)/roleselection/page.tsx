"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Heart, Brain, Stethoscope } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

// Example medical messages and icons
const medicalMessages = [
  "Did you know? The human heart beats about 115,000 times each day.",
  "Fun fact: The human brain processes images in just 13 milliseconds.",
  "Interesting: Your lungs can hold about 1.5 gallons of air.",
  "Amazing: There are more bacteria in your mouth than there are people on Earth!",
  "Wow: Your body produces about 25 million new cells each second.",
];

const icons = [Heart, Brain, Stethoscope];

export default function LoadingScreen() {
  const router = useRouter();
  const [messageIndex, setMessageIndex] = useState(0);
  const Icon = icons[messageIndex % icons.length];
  const { user } = useUser();
  const loggedInEmail = user?.emailAddresses[0]?.emailAddress || "";

  // Query to fetch user role from the database
  const userExists = useQuery(api.users.checkUserEmail, {
    email: loggedInEmail,
  });

  useEffect(() => {
    const messageTimer = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % medicalMessages.length);
    }, 3000);

    const navigationTimer = setTimeout(() => {
      if (userExists?.role) {
        // Define role-based routes
        const roleDashboards = {
          Doctor: "/dashboard",
          Desk: "/registrationdesk",
          Patient: "/homepage",
          Admin: "/hospitals",
        };

        // Get the role path or fallback to "/"
        const rolePath = roleDashboards[userExists.role] || "/";
        router.push(rolePath);
      } else {
        // If role is not found, fallback to a default route
        router.push("/");
      }
    }, 3000); // 15 seconds delay to show all messages

    return () => {
      clearInterval(messageTimer);
      clearTimeout(navigationTimer);
    };
  }, [router, userExists]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 via-blue-300 to-blue-500">
      <Card className="w-[350px] bg-white/80 backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-center p-6">
          <div className="relative">
            <Loader2 className="h-24 w-24 animate-spin text-blue-600" />
            <Icon className="h-12 w-12 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-6 text-xl font-bold text-center text-blue-800">
            Preparing Your Medical Dashboard
          </p>
          <p className="mt-2 text-sm text-blue-600 text-center">
            Your health insights are just a moment away...
          </p>
          <div className="mt-6 p-4 bg-blue-100 rounded-lg">
            <p className="text-sm text-blue-800 text-center italic">
              {medicalMessages[messageIndex]}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
