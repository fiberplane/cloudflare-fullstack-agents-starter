import {
  type ComponentProps,
  type ComponentType,
  isValidElement,
  memo,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { cn } from "@/app/lib/utils";

import styles from "./Markdown.module.css";
export { styles as markdownStyles };

import rehypeShikiFromHighlighter, { type RehypeShikiCoreOptions } from "@shikijs/rehype/core";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { remarkLinkify } from "remark-linkify";
import type { PluggableList } from "unified";
import { CopyButton } from "@/app/components/copy-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { useAdvancedStreaming } from "@/app/hooks/useAdvancedStreaming";
import { createHighlighter } from "../SourceCode";
import { shikiClassName, shikiLineClassName } from "../SourceCode/SourceCode";
import { DATA_FP_TOC, rehypeTableOfContents } from "./rehypeTableOfContents";
import { useTableOfContents } from "./useTableOfContents";

export type SyntaxHighlighterOptions = {
  className?: string;
  showLineNumbers?: boolean;
};

interface MarkdownProps {
  children: string;
  className?: string;
  syntaxHighlighterOptions?: SyntaxHighlighterOptions;
  isStreaming?: boolean;
  SkeletonComponent?: ComponentType<{ className?: string }>;
  withTableOfContents?: boolean;
  compact?: boolean;
}

interface CodeProps extends ComponentProps<"code"> {
  inline?: boolean;
}

// Helper function to filter out internal ReactMarkdown props
const filterProps = (props: Record<string, unknown>) => {
  const { node: _node, ...filteredProps } = props;

  // Remove the data-fp-toc attribute from the props as it's only used for
  // targeting ToC elements in the Markdown renderer.
  if (DATA_FP_TOC in filteredProps) {
    return { ...filteredProps, [DATA_FP_TOC]: undefined };
  }

  return filteredProps;
};

function hasChildrenProp(obj: unknown): obj is { children: React.ReactNode } {
  return typeof obj === "object" && obj !== null && "children" in obj;
}

function getTextContent(node: React.ReactNode): string {
  if (typeof node === "string") {
    return node;
  }
  if (typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(getTextContent).join("");
  }
  if (isValidElement(node) && hasChildrenProp(node.props)) {
    return getTextContent(node.props.children);
  }
  return "";
}

const streamingComponents = {
  h1: ({ children, className, ...props }: ComponentProps<"h1">) => (
    <h1
      className={cn(className, styles.h1, "animate-fadeIn duration-1000")}
      {...filterProps(props)}
    >
      {children}
    </h1>
  ),
  h2: ({ children, className, ...props }: ComponentProps<"h2">) => (
    <h2
      className={cn(className, styles.h2, "animate-fadeIn duration-1000")}
      {...filterProps(props)}
    >
      {children}
    </h2>
  ),
  h3: ({ children, className, ...props }: ComponentProps<"h3">) => (
    <h3
      className={cn(className, styles.h3, "animate-fadeIn duration-1000")}
      {...filterProps(props)}
    >
      {children}
    </h3>
  ),
  h4: ({ children, className, ...props }: ComponentProps<"h4">) => (
    <h4
      className={cn(className, styles.h4, "animate-fadeIn duration-1000")}
      {...filterProps(props)}
    >
      {children}
    </h4>
  ),
  h5: ({ children, className, ...props }: ComponentProps<"h5">) => (
    <h5
      className={cn(className, styles.h5, "animate-fadeIn duration-1000")}
      {...filterProps(props)}
    >
      {children}
    </h5>
  ),
  h6: ({ children, className, ...props }: ComponentProps<"h6">) => (
    <h6
      className={cn(className, styles.h6, "animate-fadeIn duration-1000")}
      {...filterProps(props)}
    >
      {children}
    </h6>
  ),
  p: ({ children, className, ...props }: ComponentProps<"p">) => (
    <p
      className={cn(className, styles.paragraph, "animate-fadeIn duration-1000")}
      {...filterProps(props)}
    >
      {children}
    </p>
  ),
  ul: ({ children, className, ...props }: ComponentProps<"ul">) => {
    const isTocList = DATA_FP_TOC in props;
    if (isTocList) {
      return (
        <ul className={className} {...filterProps(props)}>
          {children}
        </ul>
      );
    }

    return (
      <ul
        className={cn(
          className,
          styles.unorderedList,
          // "animate-fadeIn duration-1000",
        )}
        {...filterProps(props)}
      >
        {children}
      </ul>
    );
  },
  ol: ({ children, className, ...props }: ComponentProps<"ol">) => (
    <ol
      className={cn(className, styles.orderedList, "animate-fadeIn duration-1000")}
      {...filterProps(props)}
    >
      {children}
    </ol>
  ),
  li: ({ children, className, ...props }: ComponentProps<"li">) => {
    const isTocItem = DATA_FP_TOC in props;
    if (isTocItem) {
      return (
        <li className={className} {...filterProps(props)}>
          {children}
        </li>
      );
    }

    return (
      <li
        className={cn(
          className,
          styles.listItem,
          // "animate-fadeIn duration-1000",
        )}
        {...filterProps(props)}
      >
        {children}
      </li>
    );
  },
  blockquote: ({ children, className, ...props }: ComponentProps<"blockquote">) => (
    <blockquote
      className={cn(className, styles.blockquote, "animate-fadeIn duration-1000")}
      {...filterProps(props)}
    >
      {children}
    </blockquote>
  ),
  pre: ({ children, className, ...props }: ComponentProps<"pre">) => {
    const textContent = getTextContent(children);

    return (
      <div className="relative group">
        <pre
          className={cn(className, styles.preformatted, "animate-fadeIn duration-1000")}
          {...filterProps(props)}
        >
          {children}
        </pre>
        {textContent && (
          <CopyButton
            value={textContent}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200"
          />
        )}
      </div>
    );
  },
  code: ({ inline, className, children, ...props }: CodeProps) => {
    const filteredProps = filterProps(props);
    return inline ? (
      <code
        className={cn(className, styles.code, "animate-fadeIn duration-1000")}
        {...filteredProps}
      >
        {children}
      </code>
    ) : (
      <code
        className={cn(className, styles.code, "animate-fadeIn duration-1000")}
        {...filteredProps}
      >
        {children}
      </code>
    );
  },
  table: ({ children, className, ...props }: ComponentProps<"table">) => (
    <Table className={cn(className, "animate-fadeIn duration-1000")} {...filterProps(props)}>
      {children}
    </Table>
  ),
  thead: ({ children, className, ...props }: ComponentProps<"thead">) => (
    <TableHeader className={cn(className, "animate-fadeIn duration-1000")} {...filterProps(props)}>
      {children}
    </TableHeader>
  ),
  tbody: ({ children, className, ...props }: ComponentProps<"tbody">) => (
    <TableBody className={cn(className, "animate-fadeIn duration-1000")} {...filterProps(props)}>
      {children}
    </TableBody>
  ),
  tr: ({ children, className, ...props }: ComponentProps<"tr">) => (
    <TableRow className={cn(className, "animate-fadeIn duration-1000")} {...filterProps(props)}>
      {children}
    </TableRow>
  ),
  th: ({ children, className, ...props }: ComponentProps<"th">) => (
    <TableHead className={cn(className, "animate-fadeIn duration-1000")} {...filterProps(props)}>
      {children}
    </TableHead>
  ),
  td: ({ children, className, ...props }: ComponentProps<"td">) => (
    <TableCell className={cn(className, "animate-fadeIn duration-1000")} {...filterProps(props)}>
      {children}
    </TableCell>
  ),
  hr: ({ className, ...props }: ComponentProps<"hr">) => (
    <hr
      className={cn(className, styles.horizontalRule, "animate-fadeIn duration-1000")}
      {...filterProps(props)}
    />
  ),
  strong: ({ children, className, ...props }: ComponentProps<"strong">) => (
    <strong
      className={cn(className, styles.strong, "animate-fadeIn duration-1000")}
      {...filterProps(props)}
    >
      {children}
    </strong>
  ),
  em: ({ children, className, ...props }: ComponentProps<"em">) => (
    <em
      className={cn(className, styles.emphasis, "animate-fadeIn duration-1000")}
      {...filterProps(props)}
    >
      {children}
    </em>
  ),
  a: ({ children, className, ...props }: ComponentProps<"a">) => {
    const isTocLink = DATA_FP_TOC in props;
    if (isTocLink) {
      return (
        <a className={className} {...filterProps(props)}>
          {children}
        </a>
      );
    }

    return (
      <a
        className={cn(className, styles.link, "animate-fadeIn duration-1000")}
        {...filterProps(props)}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  },
  img: ({ className, alt = "", ...props }: ComponentProps<"img">) => (
    <img
      className={cn(className, styles.image, "animate-fadeIn duration-1000")}
      {...filterProps(props)}
      alt={alt}
    />
  ),
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
          className={cn(className, shikiLineClassName, styles.span, "animate-fadeIn duration-1000")}
          {...filterProps(props)}
        >
          {children}
        </span>
      );
    }

    return (
      <span className={cn(className, styles.span)} style={_style} {...filterProps(props)}>
        {children}
      </span>
    );
  },
} as const;

export function MarkdownSkeleton() {
  return (
    <div className="opacity-0 animate-fadeIn delay-300 duration-700">
      <div className="space-y-4">
        <Skeleton className="h-4 w-3/4 bg-secondary" />
        <Skeleton className="h-4 w-full bg-secondary" />
      </div>
    </div>
  );
}

export const Markdown = memo(function Markdown(props: MarkdownProps) {
  const {
    children: rawChildren,
    className,
    isStreaming,
    SkeletonComponent = MarkdownSkeleton,
    syntaxHighlighterOptions = {},
    withTableOfContents = false,
    compact = false,
  } = props;

  const { className: codingBlockClassName = "", showLineNumbers = false } =
    syntaxHighlighterOptions;

  const { displayedText: children } = useAdvancedStreaming(rawChildren, {
    enabled: isStreaming,
    delayMs: 50,
    minBufferSize: 80,
    maxCharsPerRelease: 200,
    useWordBoundaries: true,
  });

  const markdownRef = useTableOfContents({ withTableOfContents });

  // Fallback to rawChildren if streaming returns empty
  const content = children || rawChildren;
  const [highlighter, setHighlighter] = useState<Awaited<
    ReturnType<typeof createHighlighter>
  > | null>(null);

  useEffect(() => {
    let mounted = true;
    createHighlighter().then((hl) => {
      if (mounted) {
        setHighlighter(hl);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const shikiOptions = useMemo(() => {
    const options = {
      themes: { light: "CUSTOM", dark: "CUSTOM" },
      transformers: [
        {
          name: "add-classname",
          pre(node) {
            if (!node?.properties) {
              return;
            }
            const combined = cn(
              shikiClassName,
              codingBlockClassName,
              "compact",
              "overflow-x-auto min-w-0 max-w-full",
            );
            node.properties.class = combined;
          },
        },
      ],
    } satisfies RehypeShikiCoreOptions;

    if (showLineNumbers) {
      options.transformers.push({
        name: "add-classname",
        pre(node) {
          if (!node?.properties) {
            return;
          }
          if (typeof node.properties.class === "string") {
            node.properties.class = `${node.properties.class} ${shikiClassName}`;
          } else if (Array.isArray(node.properties.class)) {
            node.properties.class.push(shikiClassName);
          } else {
            node.properties.class = `${shikiClassName}`;
          }
        },
      });
    }

    return options;
  }, [codingBlockClassName, showLineNumbers]);

  const remarkPlugins = useMemo(() => {
    return [remarkGfm, remarkLinkify] satisfies PluggableList;
  }, []);
  const rehypePlugins = useMemo(() => {
    const tableOfContentsPlugins = withTableOfContents ? [rehypeSlug, rehypeTableOfContents] : [];

    return [
      rehypeSanitize,
      ...tableOfContentsPlugins,
      // pass factory + highlighter + options as a tuple:
      [rehypeShikiFromHighlighter, highlighter, shikiOptions],
    ] satisfies PluggableList;
  }, [highlighter, shikiOptions, withTableOfContents]);

  if (!highlighter) {
    return <SkeletonComponent />;
  }

  return (
    <div className={cn(styles.markdown, compact && styles.compact, className)} ref={markdownRef}>
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={streamingComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});
