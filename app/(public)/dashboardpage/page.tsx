"use client";

import { useState } from "react";
import { Sidebar } from "@/components/homepage-comp/sidebar";
import { Explore } from "@/components/homepage-comp/explore";
import { FileText, Stethoscope, ClipboardList } from "lucide-react";
import { ExpertCard } from "@/components/homepage-comp/expert-card";
import { QuestionCard } from "@/components/homepage-comp/question-card";
import { SearchBar } from "@/components/homepage-comp/search-bar";
import { TopicCard } from "@/components/homepage-comp/topic-card";
import { VideoCard } from "@/components/homepage-comp/video-card";
import { ExpertsSection } from "@/components/sections/experts-section";

const experts = [
  {
    name: "Opoku-Anane",
    specialty: "GYNECOLOGIC SURGERY",
    imageUrl: "/placeholder.svg?height=400&width=300",
  },
  {
    name: "Jessica Wang",
    specialty: "GYNECOLOGIC SURGERY",
    imageUrl: "/placeholder.svg?height=400&width=300",
  },
  {
    name: "Tessa Rodeman",
    specialty: "REPRODUCTIVE ENDOCRINOLOGY",
    imageUrl: "/placeholder.svg?height=400&width=300",
  },
  {
    name: "Ishami-Abed",
    specialty: "REPRODUCTIVE ENDOCRINOLOGY",
    imageUrl: "/placeholder.svg?height=400&width=300",
  },
  {
    name: "Jon Einarsson",
    specialty: "GYNECOLOGIC SURGERY",
    imageUrl: "/placeholder.svg?height=400&width=300",
  },
  {
    name: "Amanda Adeleye",
    specialty: "REPRODUCTIVE ENDOCRINOLOGY",
    imageUrl: "/placeholder.svg?height=400&width=300",
  },
  {
    name: "Antonio Gargiulo",
    specialty: "GYNECOLOGIC SURGERY",
    imageUrl: "/placeholder.svg?height=400&width=300",
  },
  {
    name: "Jeannette Lager",
    specialty: "GYNECOLOGIC SURGERY",
    imageUrl: "/placeholder.svg?height=400&width=300",
  },
];

const recommendedQuestions = [
  {
    question: "Why does it take so long to get a diagnosis of endometriosis?",
    answers: 2,
    expertImage: "/placeholder.svg?height=100&width=100",
  },
  {
    question: "What causes endometriosis?",
    answers: 2,
    expertImage: "/placeholder.svg?height=100&width=100",
  },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("Home");

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Explore":
        return <Explore onBack={() => handleTabChange("Home")} />;
      case "Experts":
        return <ExpertsSection />;
      case "Profile":
        return <div>Profile Content</div>;
      case "Home":
      default:
        return (
          <div className="px-8 py-6">
            <SearchBar />

            <div className="mt-16">
              <h2 className="text-2xl font-semibold mb-8">Topics For You</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <TopicCard title="PCOS Basics" icon={FileText} />
                <TopicCard title="Symptoms" icon={Stethoscope} />
                <TopicCard title="Diagnosis" icon={ClipboardList} />
              </div>
            </div>

            <div className="mt-16">
              <h2 className="text-2xl font-semibold text-black mb-8">
                Experts For You
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {experts.map((expert) => (
                  <ExpertCard
                    key={expert.name}
                    name={expert.name}
                    specialty={expert.specialty}
                    imageUrl={expert.imageUrl}
                    onClick={() => handleTabChange("Explore")}
                  />
                ))}
              </div>
            </div>

            <div className="mt-16">
              <h2 className="text-2xl font-semibold text-black mb-8">
                Recommended questions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 text-black gap-6">
                {recommendedQuestions.map((question) => (
                  <QuestionCard
                    key={question.question}
                    question={question.question}
                    answers={question.answers}
                    expertImage={question.expertImage}
                  />
                ))}
              </div>
            </div>

            <div className="mt-16">
              <h2 className="text-2xl font-semibold mb-8">Guides For You</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <VideoCard
                  imageUrl="/placeholder.svg?height=400&width=300"
                  name="Dr. Sarah Johnson"
                />
                <VideoCard
                  imageUrl="/placeholder.svg?height=400&width=300"
                  name="Dr. Maria Rodriguez"
                />
                <VideoCard
                  imageUrl="/placeholder.svg?height=400&width=300"
                  name="Dr. Emily Parker"
                />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar
        className="fixed left-0 top-0 z-20 h-screen"
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      <main className="flex-1 pl-64">{renderContent()}</main>
    </div>
  );
}
