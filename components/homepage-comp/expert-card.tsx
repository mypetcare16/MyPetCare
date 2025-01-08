import Image from "next/image";

interface ExpertCardProps {
  name: string;
  specialty: string;
  imageUrl: string;
  onClick: () => void;
}

export function ExpertCard({
  name,
  specialty,
  imageUrl,
  onClick,
}: ExpertCardProps) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-[3/4] relative">
        <Image src={imageUrl} alt={name} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>
      <div className="absolute bottom-4 left-4 right-4">
        <div className="space-y-1 text-white">
          <p className="text-xs font-medium uppercase tracking-wider opacity-90">
            {specialty}
          </p>
          <h3 className="text-lg font-semibold">Dr. {name}</h3>
        </div>
      </div>
    </div>
  );
}
