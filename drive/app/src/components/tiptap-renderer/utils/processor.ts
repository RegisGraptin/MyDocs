import { Root } from "hast";
import production from "react/jsx-runtime";
import rehypeParse from "rehype-parse";
import rehypeReact, { type Components } from "rehype-react";
import { unified } from "unified";
import { visit } from "unist-util-visit";

interface ProcessorOptions {
  components?: Partial<Components>;
}

const addHeadingIds = () => {
  return (tree: Root) => {
    visit(tree, "element", (node) => {
      if (["h2", "h3", "h4"].includes(node.tagName)) {
        const text =
          node.children[0].type === "text" ? node.children[0].value : "";
        node.properties = { ...node.properties, id: slugify(text) };
      }
    });
    return tree;
  };
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]+/g, "")
    .replace(/[-\s]+/g, "-")
    .trim()
    .replace(/^-+|-+$/g, "");
}

export function createProcessor({ components }: ProcessorOptions = {}) {
  return unified()
    .use(rehypeParse, { fragment: true })
    .use(addHeadingIds)
    .use(rehypeReact, {
      ...production,
      components,
    });
}
