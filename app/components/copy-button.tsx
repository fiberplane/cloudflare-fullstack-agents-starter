import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/app/lib/utils";

interface CopyButtonProps {
  value: string;
  className?: string;
}

export function CopyButton({ value, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      // Silently fail if clipboard access is denied
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={copyToClipboard}
      className={cn("shrink-0 h-6 w-6", className)}
    >
      {copied ? (
        <Check className="h-3 w-3 text-primary" />
      ) : (
        <Copy className="h-3 w-3 text-muted-foreground" />
      )}
    </Button>
  );
}
