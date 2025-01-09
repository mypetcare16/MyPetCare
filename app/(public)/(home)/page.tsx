import HomeContent from "@/components/HomeContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "VetVaults - Your AI-Powered Veterinary Companion",
  description:
    "Revolutionize your veterinary practice with VetVaults. Enhance pet care, streamline workflows, and unlock the power of AI in veterinary medicine.",
};

export default function Home() {
  return <HomeContent />;
}
