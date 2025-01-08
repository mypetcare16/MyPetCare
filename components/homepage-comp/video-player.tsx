"use client";

import { ArrowLeft, PlayCircle, ChevronRight } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface VideoPlayerProps {
  onBack: () => void;
  questionId: string;
}

interface RelatedQuestion {
  id: string;
  title: string;
  answers: number;
  expertImage: string;
}

const relatedQuestions: RelatedQuestion[] = [
  {
    id: "1",
    title: "What is classic PCOS?",
    answers: 2,
    expertImage: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "2",
    title: "What are the most common symptoms of PCOS?",
    answers: 2,
    expertImage: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "3",
    title: "What is lean PCOS?",
    answers: 2,
    expertImage: "/placeholder.svg?height=100&width=100",
  },
];

export function VideoPlayer({ onBack, questionId }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0F5C] text-white">
      <div className="max-w-[1400px] mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-white/80"
              onClick={onBack}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 rounded-full overflow-hidden">
                <Image
                  src="/placeholder.svg?height=100&width=100"
                  alt="Expert"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h2 className="font-semibold">Heather Huddleston</h2>
                <p className="text-sm text-gray-300">
                  Reproductive Endocrinology
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              <div className="relative h-8 w-8 rounded-full overflow-hidden border-2 border-[#0A0F5C]">
                <Image
                  src="/placeholder.svg?height=100&width=100"
                  alt="Viewer"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative h-8 w-8 rounded-full overflow-hidden border-2 border-[#0A0F5C]">
                <Image
                  src="/placeholder.svg?height=100&width=100"
                  alt="Viewer"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Section */}
          <div className="lg:col-span-2">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/20">
              <Image
                src="/placeholder.svg?height=720&width=1280"
                alt="Video thumbnail"
                fill
                className="object-cover"
              />
              {!isPlaying && (
                <button
                  className="absolute inset-0 flex items-center justify-center"
                  onClick={() => setIsPlaying(true)}
                >
                  <PlayCircle className="h-16 w-16 text-white opacity-80 hover:opacity-100 transition-opacity" />
                </button>
              )}
            </div>
            <div className="mt-6">
              <h1 className="text-2xl font-semibold mb-4">What is PCOS?</h1>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="text-white border-white/20"
                >
                  Save
                </Button>
                <Button
                  variant="outline"
                  className="text-white border-white/20"
                >
                  Share
                </Button>
                <Button
                  variant="outline"
                  className="text-white border-white/20"
                >
                  Read
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="mb-8">
              <div className="flex items-center justify-between text-lg font-semibold mb-4">
                <span>Next in What is PCOS?</span>
                <ChevronRight className="h-5 w-5" />
              </div>
              <div className="bg-white/10 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-white/15 transition-colors">
                <div className="flex-1">
                  <h3 className="font-medium">
                    What is the typical story of someone who is diagnosed with
                    PCOS?
                  </h3>
                </div>
                <PlayCircle className="h-8 w-8 flex-shrink-0" />
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">People Also Ask</h2>
              <div className="space-y-4">
                {relatedQuestions.map((question) => (
                  <div
                    key={question.id}
                    className="bg-white/10 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-white/15 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium">{question.title}</h3>
                      <p className="text-sm text-gray-300">
                        {question.answers} Answers
                      </p>
                    </div>
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={question.expertImage}
                        alt="Expert"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <PlayCircle className="h-8 w-8" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
