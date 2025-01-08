import { Play } from "lucide-react";
import Image from "next/image";

interface VideoCardProps {
  imageUrl: string;
  name: string;
}

export function VideoCard({ imageUrl, name }: VideoCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl group cursor-pointer">
      <div className="aspect-[4/5] relative">
        <Image src={imageUrl} alt={name} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-white/90 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>
      <div className="absolute bottom-4 left-4 right-4">
        <h3 className="text-lg font-semibold text-white">{name}</h3>
      </div>
    </div>
  );
}
