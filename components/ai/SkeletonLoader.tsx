import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonLoader() {
  return (
    <div className="flex flex-col space-y-3">
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />

        {/* <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-11/12 " />
        <Skeleton className="h-4 w-11/12 justify-self-end" />
        <Skeleton className="h-4 w-full" /> */}
      </div>
    </div>
  );
}

export const VideoSkeletonLoader = () => {
  return (
    <div className="flex gap-1 justify-start items-center">
      <Skeleton className="h-[225px] w-[250px] rounded-xl" />
      <Skeleton className="h-[225px] w-[250px] rounded-xl" />
      <Skeleton className="h-[225px] w-[250px] rounded-xl" />
      <Skeleton className="h-[225px] w-[250px] rounded-xl" />
    </div>
  );
};
