import type { Element, Root, RootContent } from "hast";
import { h } from "hastscript";
import type { Transformer } from "unified";
import styles from "./Markdown.module.css";

// Constants for ToC visual line calculations
const TOC_LINE_BASE_WIDTH = 100;
const TOC_LINE_WIDTH_REDUCTION_PER_LEVEL = 15;

/**
 * Used to identify the table of contents element in the DOM.
 */
export const DATA_FP_TOC = "data-fp-toc";

type HeadingWithLevel = {
  element: Element;
  level: number;
};

type HeadingsWithLevels = Array<HeadingWithLevel>;

/**
 * Rehype plugin used to generate a table of contents for the markdown content.
 * Used in conjunction with the `rehypeSlug` plugin & the `useTableOfContents`
 * hook.
 *
 * @returns A transformer function that generates the table of contents and
 * mutates the root node with the table of contents.
 */
export function rehypeTableOfContents(): Transformer<Root> {
  return (root) => {
    const headingNodes = root.children.filter(filterHeadingNodes);
    if (headingNodes.length === 0) {
      return root;
    }

    const headingsWithLevels: HeadingsWithLevels = headingNodes.map((element) => {
      const level = Number.parseInt(element.tagName.slice(1), 10);
      return {
        element,
        level,
      };
    });

    const nestedHeadings = buildNestedHeadingStructure(headingsWithLevels);

    const fpHeadingAbstractions = h(
      "div",
      {
        id: styles.fpHeadingAbstractions,
      },
      h(
        "ul",
        { [DATA_FP_TOC]: true },
        headingsWithLevels.map(({ element, level }) => {
          const width = TOC_LINE_BASE_WIDTH - (level - 1) * TOC_LINE_WIDTH_REDUCTION_PER_LEVEL;

          return h("li", {
            style: { width: `${width}%` },
            [DATA_FP_TOC]: true,
            "data-id": element.properties?.id,
          });
        }),
      ),
    );

    const tableOfContentsElement = h(
      "aside",
      {
        id: styles.fpTableOfContents,
        "data-fp-toc-is-active": String(false),
        "aria-label": "Table of contents",
        role: "navigation",
      },
      nestedHeadings,
    );

    // Mutate the root and return it
    root.children.push(fpHeadingAbstractions, tableOfContentsElement);
    return root;
  };
}

function buildNestedHeadingStructure(headingNodes: HeadingsWithLevels): Element {
  const result = buildNestedList(headingNodes);

  return h("ul", { [DATA_FP_TOC]: true }, result);
}

function buildNestedList(headings: HeadingsWithLevels): Element[] {
  const result: Element[] = [];
  let currentIndex = 0;

  while (currentIndex < headings.length) {
    const currentHeading = headings[currentIndex];
    const { element, level } = currentHeading;

    // Create the anchor link for this heading
    const linkElement = h(
      "a",
      {
        [DATA_FP_TOC]: true,
        href: `#${element.properties?.id}`,
        "data-id": element.properties?.id,
      },
      element.children,
    );

    // Find all immediate child headings (deeper level)
    const { childHeadings, nextSiblingIndex } = findChildHeadings(headings, currentIndex, level);

    // Build the list item content
    const listItemContent = [linkElement];

    if (childHeadings.length > 0) {
      const nestedList = h(
        "ul",
        {
          [DATA_FP_TOC]: true,
          "data-is-nested": true,
        },
        buildNestedList(childHeadings),
      );
      listItemContent.push(nestedList);
    }

    const listItem = h("li", { [DATA_FP_TOC]: true }, listItemContent);

    result.push(listItem);
    currentIndex = nextSiblingIndex;
  }

  return result;
}

function findChildHeadings(
  headings: HeadingsWithLevels,
  startIndex: number,
  parentLevel: number,
): { childHeadings: HeadingsWithLevels; nextSiblingIndex: number } {
  const childHeadings: HeadingsWithLevels = [];
  let searchIndex = startIndex + 1;

  while (searchIndex < headings.length) {
    const heading = headings[searchIndex];

    // If we encounter a heading at the same level or higher (lower number),
    // we've found the next sibling
    if (heading.level <= parentLevel) {
      break;
    }

    // This is a child heading (deeper level)
    childHeadings.push(heading);
    searchIndex++;
  }

  return {
    childHeadings,
    nextSiblingIndex: searchIndex,
  };
}

function filterHeadingNodes(node: RootContent): node is Element {
  return (
    node.type === "element" &&
    typeof node.properties?.id === "string" &&
    (node.tagName === "h1" ||
      node.tagName === "h2" ||
      node.tagName === "h3" ||
      node.tagName === "h4" ||
      node.tagName === "h5" ||
      node.tagName === "h6")
  );
}
