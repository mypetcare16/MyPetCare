import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ConvexClientProvider from "@/app/ConvexClientProvider";
import { Toaster } from "@/components/ui/toaster";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.vetvault.in"),
  title: {
    default: "Your AI Veterinary Assistant",
    template: "%s | VetVaults",
  },
  description:
    "Revolutionize your veterinary practice with AI-powered insights and seamless pet health record organization.",
  keywords:
    "AI veterinarian, pet health records, veterinary insights, veterinary AI, pet care organization, VetVaults",
  openGraph: {
    title: "VetVaults - Your AI-Powered Veterinary Assistant",
    description:
      "Optimize pet health management with AI-driven veterinary records and insights.",
    url: "https://www.vetvault.in",
    type: "website",
    siteName: "VetVaults",
    images: [
      {
        url: "opengraph-image.png", // Ensure this file exists in your public folder
        width: 1200,
        height: 630,
        alt: "VetVaults - AI-Powered Veterinary Assistant",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ConvexClientProvider>{children}</ConvexClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
