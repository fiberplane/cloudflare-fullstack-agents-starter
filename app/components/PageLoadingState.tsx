import { Loader2 } from "lucide-react";

interface PageLoadingStateProps {
  message?: string;
}

export function PageLoadingState({ message = "Loading..." }: PageLoadingStateProps) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>{message}</span>
      </div>
    </div>
  );
}
