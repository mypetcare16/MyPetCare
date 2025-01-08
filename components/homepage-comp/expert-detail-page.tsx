"use client";

import { Play } from "lucide-react";
import Image from "next/image";

interface Question {
  id: string;
  title: string;
  answers: number;
  expertImage: string;
}

const fertilityQuestions: Question[] = [
  {
    id: "1",
    title:
      "What's your best advice for someone starting their fertility journey?",
    answers: 12,
    expertImage: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "2",
    title: "What do you think every woman should know about female fertility?",
    answers: 2,
    expertImage: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "3",
    title: "What are the biggest myths about female fertility?",
    answers: 2,
    expertImage: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "4",
    title:
      "As a doctor, what do you want every person to know before trying to conceive?",
    answers: 2,
    expertImage: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "5",
    title: "When is a woman least fertile in her menstrual cycle?",
    answers: 1,
    expertImage: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "6",
    title:
      "What do you wish you had known about fertility when you started the process of building a family?",
    answers: 5,
    expertImage: "/placeholder.svg?height=100&width=100",
  },
];

export function ExpertDetailPage() {
  return (
    <div className="min-h-screen bg-[#0A0F5C] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-semibold mb-8">Female Fertility Basics</h1>

        <div className="flex gap-4 mb-8">
          <button className="bg-white text-[#0A0F5C] px-4 py-2 rounded-full">
            All (24)
          </button>
          <button className="bg-[#1A1F6C] px-4 py-2 rounded-full">
            Unwatched (24)
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fertilityQuestions.map((question) => (
            <div
              key={question.id}
              className="bg-[#1A1F6C] rounded-2xl p-6 flex items-start gap-4 group cursor-pointer hover:bg-[#2A2F7C] transition-colors"
            >
              <div className="flex-1">
                <h3 className="text-lg font-medium mb-2">{question.title}</h3>
                <p className="text-sm text-gray-300">
                  {question.answers} Answers
                </p>
              </div>
              <div className="relative w-20 h-20 flex-shrink-0">
                <Image
                  src={question.expertImage}
                  alt="Expert"
                  fill
                  className="object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center">
                  <Play className="w-8 h-8 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
