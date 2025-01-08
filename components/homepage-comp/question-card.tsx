import { Play } from "lucide-react";
import Image from "next/image";

interface QuestionCardProps {
  question: string;
  answers: number;
  expertImage: string;
}

export function QuestionCard({
  question,
  answers,
  expertImage,
}: QuestionCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white/10 p-4 hover:bg-white/20 transition-colors">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h3 className="text-black font-medium">{question}</h3>
          <p className="text-sm text-black">{answers} Answers</p>
        </div>
        <div className="relative h-12 w-12 shrink-0">
          <Image
            src={expertImage}
            alt="Expert"
            fill
            className="rounded-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full bg-blue-500/90 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Play className="h-4 w-4 text-black" fill="currentColor" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
