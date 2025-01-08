import { Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Search, Menu, ChevronLeft } from "lucide-react";
import { ExpertsSection } from "@/components/sections/experts-section";
import CTASection from "@/components/sections/cta-section";

const DynamicVideoPlayer = dynamic(() => import("@/components/VideoPlayer"), {
  ssr: false,
  loading: () => <p>Loading video player...</p>,
});

const DynamicAnimatedContent = dynamic(
  () => import("@/components/AnimatedContent"),
  {
    ssr: false,
    loading: () => <p>Loading animated content...</p>,
  }
);

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen font-sans">
      <main className="flex-1 pt-16">
        <section className="w-full min-h-[calc(100vh-4rem)] py-12 md:py-24 lg:py-32 bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-10 text-center">
              <DynamicAnimatedContent />
              <div className="relative w-full max-w-5xl h-[600px] mt-20">
                <Suspense fallback={<div>Loading content...</div>}>
                  <DynamicAnimatedContent isScreens={true} />
                  <DynamicVideoPlayer />
                </Suspense>
              </div>
            </div>
          </div>
        </section>
        <ExpertsSection />
        <CTASection />
      </main>
    </div>
  );
}
