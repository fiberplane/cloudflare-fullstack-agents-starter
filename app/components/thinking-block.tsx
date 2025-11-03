import { Brain, ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { Markdown } from "@/app/components/Markdown";

interface ThinkingBlockProps {
  content: string;
  isStreaming: boolean;
  defaultExpanded?: boolean;
}

export function ThinkingBlock({
  content,
  isStreaming,
  defaultExpanded = false,
}: ThinkingBlockProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!content) {
    return null;
  }

  const label = "Thinking";

  return (
    <button
      type="button"
      onClick={() => setIsExpanded(!isExpanded)}
      className="group w-full rounded-lg border bg-muted/20 p-3 mb-3 relative overflow-hidden text-left hover:bg-muted/30 hover:border-muted-foreground/30 transition-all cursor-pointer"
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
        {isStreaming ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground group-hover:text-foreground flex-shrink-0 transition-colors" />
        ) : (
          <Brain className="h-4 w-4 text-muted-foreground group-hover:text-foreground flex-shrink-0 transition-colors" />
        )}
        <span className="flex-1 font-medium hover:text-foreground transition-colors">
          {isStreaming ? "Thinking..." : label}
        </span>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 flex-shrink-0 hover:text-foreground transition-colors" />
        ) : (
          <ChevronRight className="h-4 w-4 flex-shrink-0 hover:text-foreground transition-colors" />
        )}
      </div>

      {isExpanded && (
        <Markdown isStreaming={isStreaming} className="mt-3 text-sm" compact>
          {content}
        </Markdown>
      )}
    </button>
  );
}
