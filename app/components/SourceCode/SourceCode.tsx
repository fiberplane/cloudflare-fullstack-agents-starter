import { type Options as JsxRuntimeOptions, toJsxRuntime } from "hast-util-to-jsx-runtime";
import {
  type ComponentProps,
  type ComponentType,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useStickToBottom } from "use-stick-to-bottom";
import { useAdvancedStreaming } from "@/app/hooks/useAdvancedStreaming";
import { useHandler } from "@/app/hooks/useHandler";
import { cn, parameterAwareDebounce } from "@/app/lib/utils";
import styles from "./SourceCode.module.css";
import { TextFileSkeleton } from "./TextFileSkeleton";

export const shikiClassName = styles.shiki;
export const shikiLineClassName = styles.line;

// This is a type from hast-util-to-jsx-runtime
type Nodes = Parameters<typeof toJsxRuntime>[0];

interface CodeProps extends ComponentProps<"code"> {
  inline?: boolean;
}

// Helper function to filter out internal ReactMarkdown props
const filterProps = (props: Record<string, unknown>) => {
  const { node: _node, ...filteredProps } = props;
  return filteredProps;
};

/**
 * Binds the duration ref to the motion components.
 */
function createStreamingComponents(durationRef: React.MutableRefObject<string>) {
  return {
    span: ({ children, style: _style, className = "", ...props }: ComponentProps<"span">) => {
      const isLine = className.includes("line");

      if (isLine) {
        const lineNumber =
          props && "data-line" in props && typeof props["data-line"] === "number"
            ? props["data-line"]
            : null;

        return (
          <span
            key={lineNumber ?? undefined}
            className={cn(className, shikiLineClassName, "animate-fadeIn", durationRef.current)}
            {...filterProps(props)}
          >
            {children}
          </span>
        );
      }

      return (
        <span
          className={cn(className, "animate-fadeIn duration-300", durationRef.current)}
          style={_style}
          {...filterProps(props)}
        >
          {children}
        </span>
      );
    },
    pre: ({ children, className, style: _style, ...props }: ComponentProps<"pre">) => (
      <pre {...filterProps(props)} className={cn(className, "animate-fadeIn", durationRef.current)}>
        {children}
      </pre>
    ),
    code: ({ inline, className, children, style: _style, ...props }: CodeProps) => {
      return inline ? (
        <code
          className={cn(className, "animate-fadeIn", durationRef.current)}
          {...filterProps(props)}
        >
          {children}
        </code>
      ) : (
        <code
          key="block"
          className={cn(className, "animate-fadeIn", durationRef.current)}
          {...filterProps(props)}
        >
          {children}
        </code>
      );
    },
  } as const;
}

// Custom JSX runtime with motion components
const createMotionJsxRuntime = (durationRef: React.MutableRefObject<string>): JsxRuntimeOptions => {
  return {
    jsx,
    jsxs,
    components: createStreamingComponents(durationRef),
    Fragment,
    development: false,
  };
};

function selectDuration(isStreaming: boolean) {
  return isStreaming ? "duration-700" : "duration-500";
}

export function SourceCode({
  content: rawContent,
  className,
  isStreaming = false,
  enableOverflow = false,
  SkeletonComponent = TextFileSkeleton,
  language = "ts",
  lineNumberOffset = 0,
}: {
  content?: string;
  className?: string;
  isStreaming?: boolean;
  enableOverflow?: boolean;
  SkeletonComponent?: ComponentType<{ className?: string }>;
  language?: string;
  lineNumberOffset?: number;
}) {
  // This is the processed content that is used to render the code.
  const [processedContent, setProcessedContent] = useState<ReactNode | null>(null);

  // This hooks controls the streaming of the content
  const { displayedText: content } = useAdvancedStreaming(rawContent ?? "", {
    enabled: isStreaming,
    maxCharsPerRelease: 200,
    minBufferSize: 50,
    delayMs: 33,
  });

  // This ref is used to bind the duration to the motion components.
  const durationRef = useRef(selectDuration(isStreaming));
  useEffect(() => {
    durationRef.current = selectDuration(isStreaming);
  }, [isStreaming]);

  // This is the motion runtime that is used to render the code.
  const motionRuntime = useMemo(() => {
    return createMotionJsxRuntime(durationRef);
  }, []);

  // This is the handler that is used to process the content.
  const processContent = useHandler((content: Nodes) => {
    setProcessedContent(toJsxRuntime(content, motionRuntime));
  });

  // This is the state that is used to control the worker.
  const [workerState, setWorkerState] = useState<{
    // Shows whether the worker is ready to process the content.
    isWorkerReady: boolean;
    // This is the function that is used to update the worker.
    // Note: this is rate limited and but will always update with the latest content.
    // This function should not be called when the worker is not ready (as it is a noop)
    updateWorker: (content: string, className: string) => void;

    // This is the function that is used to cancel any ongoing timers for the rate limited updateWorker function.
    cancel: () => void;
  } | null>(null);

  useEffect(() => {
    const worker = new Worker(new URL("./syntaxWorker.ts", import.meta.url), {
      type: "module",
    });

    const updateWorker = parameterAwareDebounce<
      (content: string, className: string) => void,
      [string, string]
    >((content, className) => {
      if (!ready) {
        return;
      }

      lastContentRef.current = content;
      worker.postMessage({
        content,
        language,
        className: cn(className, styles.shiki),
        lineNumberOffset,
      });

      // Rate limit is 30fps
    }, 1000 / 30);

    // Keep track internally if the worker is ready to process the content
    let ready = false;

    // This is the handler that is used to process the content.
    worker.onmessage = (e) => {
      const { type, hast, error } = e.data;
      if (type === "ready") {
        // Set the worker to ready
        ready = true;

        // Update the worker state
        setWorkerState({
          isWorkerReady: true,
          updateWorker,
          cancel: () => updateWorker.cancel(),
        });

        return;
      }

      // If the worker is ready and the content is valid, process the content
      if (type === "success" && hast) {
        // pass to processContent
        processContent(hast);
        return;
      }

      if (type === "error") {
        // Log error to console for (local) development purposes
        console.error("Syntax highlighting error:", error);
      }
    };
    // Initialize the worker state
    // but also set the worker to not ready
    setWorkerState({
      isWorkerReady: false,
      updateWorker,
      cancel: () => {
        updateWorker.cancel();
      },
    });

    return () => {
      updateWorker.cancel();
    };
  }, [processContent, language, lineNumberOffset]);

  // This is the last content that was sent to the worker.
  const lastContentRef = useRef<string | null>(null);

  // This is the effect that is used to update the worker.
  // biome-ignore lint/correctness/useExhaustiveDependencies: pretty sure it still works /shrug
  useEffect(() => {
    if (workerState?.isWorkerReady && workerState?.updateWorker) {
      workerState?.updateWorker?.(content, className ?? "");
    }
  }, [workerState?.isWorkerReady, workerState?.updateWorker, className, content]);

  // Use the useStickToBottom hook to scroll to the bottom of the content.
  const { scrollRef, contentRef, scrollToBottom, escapedFromLock } = useStickToBottom({
    initial: isStreaming ? "instant" : false,
  });

  // On content change, scroll to the bottom of the content (if enabled)
  useLayoutEffect(() => {
    if (processedContent && isStreaming && enableOverflow && !escapedFromLock) {
      scrollToBottom("smooth");
    }
  }, [processedContent, scrollToBottom, isStreaming, enableOverflow, escapedFromLock]);

  if (rawContent === undefined || !processedContent) {
    return (
      <div className={cn({ "overflow-y-auto": enableOverflow })}>
        <SkeletonComponent className={className} />
      </div>
    );
  }

  return (
    <div
      ref={enableOverflow ? scrollRef : undefined}
      className={cn({ "overflow-y-auto": enableOverflow })}
    >
      <div
        ref={enableOverflow ? contentRef : undefined}
        style={lineNumberOffset > 0 ? { counterReset: `line ${lineNumberOffset - 1}` } : undefined}
      >
        {processedContent}
      </div>
    </div>
  );
}
