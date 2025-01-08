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

//TODO: write content
export const metadata: Metadata = {
  metadataBase: new URL("https://www.mymedirecords.com"), // Replace with your deployed URL
  title: {
    default: "Your AI Doctor",
    template: "%s | MyMediRecords",
  },
  description:
    "Revolutionize your health records with AI-powered insights and seamless organization.",
  keywords:
    "AI doctor, medical records, health insights, healthcare AI, medical organization",
  openGraph: {
    title: "Your AI Doctor - Organize and Optimize Your Health",
    description:
      "Your trusted platform for AI-powered medical records and health insights.",
    url: "https://www.mymedirecords.com",
    type: "website",
    siteName: "MyMediRecords",
    images: [
      {
        url: "opengraph-image.png", // Ensure the file exists in your public folder
        width: 1200,
        height: 630,
        alt: "MyMediRecords - Your AI doctor",
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
