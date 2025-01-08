import { type LucideIcon } from "lucide-react";

interface TopicCardProps {
  title: string;
  icon: LucideIcon;
}

export function TopicCard({ title, icon: Icon }: TopicCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-blue-100 to-pink-100 hover:shadow-lg transition-all cursor-pointer group">
      <div className="flex flex-col gap-4">
        <div className="rounded-full bg-white p-3 w-fit">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
