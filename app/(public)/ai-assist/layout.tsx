import Header from "@/components/Header";
import type { Metadata } from "next";
import { Merriweather } from "next/font/google";

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400"],
});

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
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className={`${merriweather.className} min-h-[calc(100dvh-4.5rem)]`}>
        {children}
      </main>
    </>
  );
}
