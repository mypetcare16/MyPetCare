import type { Metadata } from "next";
import FixedNavigation from "./navigation";
import RoleSelection from "../roleselection/page";
import RoleBasedNavigation from "@/components/RoleBasedNavigation";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.vetvault.in"),
  title: {
    default: "Your AI Veterinary Assistant",
    template: "%s | VetVaults",
  },
  description:
    "Revolutionize your veterinary practice with AI-powered insights and seamless pet health record organization.",
  keywords:
    "AI veterinarian, pet health records, veterinary insights, veterinary AI, pet care organization",
  openGraph: {
    title: "Your AI Veterinary Assistant - Optimize Pet Health Management",
    description:
      "Your trusted platform for AI-powered veterinary records and pet health insights.",
    url: "https://www.vetvault.in",
    type: "website",
    siteName: "VetVaults",
    images: [
      {
        url: "opengraph-image.png", // Ensure this file exists in your public folder
        width: 1200,
        height: 630,
        alt: "VetVaults - Your AI Veterinary Assistant",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <FixedNavigation />
      <main className="flex min-h-[calc(100dvh-4rem)] flex-col items-center p-2 mt-16">
        {children}
      </main>
      <Toaster />
    </>
  );
}
