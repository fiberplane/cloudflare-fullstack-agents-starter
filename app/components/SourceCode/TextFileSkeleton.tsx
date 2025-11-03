import { Skeleton } from "@/app/components/ui/skeleton";
import { cn } from "@/app/lib/utils";

export function TextFileSkeleton(props: { className?: string }) {
  return (
    <div className={cn("space-y-12 py-8", props.className)}>
      {/* Title */}
      <Skeleton className="bg-secondary h-8 w-3/4" />

      {/* Subtitle */}
      <Skeleton className="bg-secondary h-6 w-2/3" />

      {/* Text content */}
      <div className="space-y-3">
        <Skeleton className="bg-secondary h-4 w-full" />
        <Skeleton className="bg-secondary h-4 w-full" />
        <Skeleton className="bg-secondary h-4 w-5/6" />
      </div>

      {/* Code block */}
      <div className="space-y-2 p-4 rounded-md mt-4">
        <Skeleton className="bg-secondary h-4 w-1/4" />
        <Skeleton className="bg-secondary h-4 w-3/4" />
        <Skeleton className="bg-secondary h-4 w-2/3" />
        <Skeleton className="bg-secondary h-4 w-1/2" />
      </div>

      {/* Another subtitle */}
      <Skeleton className="bg-secondary h-6 w-1/2 mt-6" />

      {/* Bullet points */}
      <div className="space-y-3 pl-4 mt-4">
        <div className="flex gap-2 items-center">
          <Skeleton className="bg-secondary h-2 w-2 rounded-full" />
          <Skeleton className="bg-secondary h-4 w-3/4" />
        </div>
        <div className="flex gap-2 items-center">
          <Skeleton className="bg-secondary h-2 w-2 rounded-full" />
          <Skeleton className="bg-secondary h-4 w-2/3" />
        </div>
        <div className="flex gap-2 items-center">
          <Skeleton className="bg-secondary h-2 w-2 rounded-full" />
          <Skeleton className="bg-secondary h-4 w-1/2" />
        </div>
      </div>

      {/* More text content */}
      <div className="space-y-3 mt-6">
        <Skeleton className="bg-secondary h-4 w-full" />
        <Skeleton className="bg-secondary h-4 w-4/5" />
        <Skeleton className="bg-secondary h-4 w-3/4" />
      </div>

      {/* Inline code and text */}
      <div className="space-y-3 mt-6">
        <div className="flex gap-2 items-center">
          <Skeleton className="bg-secondary h-4 w-1/4" />
          <Skeleton className="bg-secondary h-4 w-1/6 rounded-sm" />
          <Skeleton className="bg-secondary h-4 w-1/3" />
        </div>
        <Skeleton className="bg-secondary h-4 w-2/3" />
      </div>
    </div>
  );
}
