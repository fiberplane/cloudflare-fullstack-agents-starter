import { useEffect, useRef } from "react";
import { throttle } from "throttle-debounce";
import { MCP_FITNESS_CHECK_RESULT_ID } from "@/app/constants";
import { useHandler } from "@/app/hooks/useHandler";
import styles from "./Markdown.module.css";

type TableOfContents = {
  withTableOfContents?: boolean;
};

const THROTTLE_DELAY_MS = 100;

/**
 * This hook is used to track the active heading in the table of contents.
 * It is used to highlight the active heading in the table of contents.
 *
 * @param withTableOfContents - Whether to show the table of contents.
 * @returns A ref to the markdown element.
 */
export function useTableOfContents({ withTableOfContents }: TableOfContents) {
  const cleanupRef = useRef<() => void>(null);

  const ref = useHandler((markdownElement: HTMLDivElement | null) => {
    // Clean up any existing listeners & observers before creating new ones.
    // Especially handy when hot reloading during development
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    if (!markdownElement || !withTableOfContents) {
      return;
    }

    const tocElement = document.getElementById(styles.fpTableOfContents);
    const tocHoverElement = document.getElementById(styles.fpHeadingAbstractions);
    if (!tocElement || !tocHoverElement) {
      return;
    }

    // Track which headings are currently intersecting
    const intersectingHeadings = new Set<Element>();
    let lastActiveId: string | null = null;

    // Select the currently visible heading nodes. Intended for static,
    // non-streaming content. The update function is used to re-select the
    // heading nodes when the markdown element changes - e.g. during streaming.
    let headingNodes = selectHeadingElements(markdownElement);
    const updateHeadingNodes = () => {
      headingNodes = selectHeadingElements(markdownElement);
    };

    // Find the topmost intersecting heading and update the active heading in
    // the table of contents.
    const updateActiveHeading = throttle(THROTTLE_DELAY_MS, () => {
      let topmostHeading: Element | null = null;
      let topmostTop = Number.POSITIVE_INFINITY;

      for (const heading of intersectingHeadings) {
        const rect = heading.getBoundingClientRect();
        if (rect.top < topmostTop) {
          topmostTop = rect.top;
          topmostHeading = heading;
        }
      }

      // Update all headings - only the topmost should be active
      for (const heading of headingNodes) {
        const headingId = heading.id;
        if (!headingId) {
          continue;
        }

        const tocLiElement = getTocLiElement(tocHoverElement, headingId);
        const tocAnchorElement = getTocAnchorElement(tocElement, headingId);
        if (!tocLiElement || !tocAnchorElement) {
          continue;
        }

        const isActive = topmostHeading === heading;
        tocLiElement.dataset.isActive = String(isActive);
        tocAnchorElement.dataset.isActive = String(isActive);

        if (isActive) {
          lastActiveId = headingId;
        }
      }

      // If there are no intersecting headings, update the last active id. This
      // allows for highlighting the last active heading when the user scrolls
      // and no heading is intersecting.
      if (intersectingHeadings.size === 0 && lastActiveId) {
        const tocLiElement = getTocLiElement(tocHoverElement, lastActiveId);
        const tocAnchorElement = getTocAnchorElement(tocElement, lastActiveId);
        if (!tocLiElement || !tocAnchorElement) {
          return;
        }
        tocLiElement.dataset.isActive = "true";
        tocAnchorElement.dataset.isActive = "true";
      }
    });

    const intersectionObserver = new IntersectionObserver(
      (entries: Array<IntersectionObserverEntry>) => {
        // Update the set of intersecting headings
        for (const { target, isIntersecting } of entries) {
          intersectingHeadings[isIntersecting ? "add" : "delete"](target);
        }
        updateActiveHeading();
      },
      /* observe brainstorm scroll container */
      { root: document.getElementById(MCP_FITNESS_CHECK_RESULT_ID) },
    );

    // Observe headings on initial render. Great for non-streaming, static content
    for (const node of headingNodes) {
      intersectionObserver.observe(node);
    }

    // Observe dynamically added headings during streaming/content updates
    const mutationObserver = new MutationObserver((mutationList) => {
      for (const mutation of mutationList) {
        if (mutation.type !== "childList") {
          continue;
        }

        for (const addedEl of mutation.addedNodes) {
          if (addedEl instanceof Element && isHeadingElement(addedEl)) {
            intersectionObserver.observe(addedEl);
          }
        }

        // Clean up removed headings from the intersecting set
        for (const removedEl of mutation.removedNodes) {
          if (removedEl instanceof Element && isHeadingElement(removedEl)) {
            intersectionObserver.unobserve(removedEl);
            intersectingHeadings.delete(removedEl);
          }
        }

        // After handling the mutations, update the heading nodes and the active
        // heading.
        updateHeadingNodes();
        updateActiveHeading();
      }
    });

    mutationObserver.observe(markdownElement, {
      childList: true,
      subtree: true,
    });

    // Define event handlers
    const handleMouseEnter = () => {
      tocElement.dataset.fpTocIsActive = "true";
      tocHoverElement.dataset.fpTocIsActive = "true";
    };

    const handleMouseLeave = () => {
      tocElement.dataset.fpTocIsActive = "false";
      tocHoverElement.dataset.fpTocIsActive = "false";
    };

    // Add event listeners
    tocHoverElement.addEventListener("mouseenter", handleMouseEnter);
    tocHoverElement.addEventListener("mouseleave", handleMouseLeave);
    tocElement.addEventListener("mouseenter", handleMouseEnter);
    tocElement.addEventListener("mouseleave", handleMouseLeave);

    // Store cleanup function on the ref for later cleanup
    cleanupRef.current = () => {
      tocHoverElement.removeEventListener("mouseenter", handleMouseEnter);
      tocHoverElement.removeEventListener("mouseleave", handleMouseLeave);
      tocElement.removeEventListener("mouseenter", handleMouseEnter);
      tocElement.removeEventListener("mouseleave", handleMouseLeave);
      intersectionObserver.disconnect();
      mutationObserver.disconnect();
      updateActiveHeading.cancel();
    };
  });

  // Effect that solely cleans up the listeners on unmount
  useEffect(() => {
    return () => {
      const cleanup = cleanupRef.current;
      if (cleanup) {
        cleanup();
      }
    };
  }, []);

  return ref;
}

const getTocLiElement = (tocHoverElement: HTMLElement, headingId: string) => {
  return tocHoverElement.querySelector<HTMLLIElement>(`li[data-id="${headingId}"]`);
};

const getTocAnchorElement = (tocElement: HTMLElement, headingId: string) => {
  return tocElement.querySelector<HTMLAnchorElement>(`a[data-id="${headingId}"]`);
};

function selectHeadingElements(node: Element) {
  return node.querySelectorAll<HTMLElement>("h1, h2, h3, h4, h5, h6");
}

function isHeadingElement(node: Element) {
  return /^H[1-6]$/.test(node.tagName);
}
