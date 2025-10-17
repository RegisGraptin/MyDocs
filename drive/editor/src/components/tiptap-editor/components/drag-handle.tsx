import React, { useCallback, useMemo, useState } from "react";

import TiptapDragHandle from "@tiptap/extension-drag-handle-react";

import MenuButton from "./menu-button";
import { useTiptapEditor } from "./provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown";
import { getSelectedDOM, moveNode } from "../helpers/tiptap";

import type { Middleware } from "@floating-ui/dom";
import type { Node as TiptapNode } from "@tiptap/pm/model";

export const DragHandle = () => {
  const { editor } = useTiptapEditor();
  const [node, setNode] = useState<TiptapNode | null>(null);
  const [nodePos, setNodePos] = useState<number>(-1);
  const [open, setOpen] = useState(false);

  const scrollToNode = useCallback(() => {
    requestAnimationFrame(() => {
      const domNode = getSelectedDOM(editor);
      domNode?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    });
  }, [editor]);

  const refreshDragHandle = useCallback(() => {
    requestAnimationFrame(() => {
      const domNode = getSelectedDOM(editor);
      if (!domNode) return;

      const rect = domNode.getBoundingClientRect();
      const event = new MouseEvent("mousemove", {
        bubbles: true,
        cancelable: true,
        clientX: rect.left + 10,
        clientY: rect.top + rect.height / 2,
      });
      editor.view.dom.dispatchEvent(event);
    });
  }, [editor]);

  const menuPosition = useMemo(() => {
    return {
      middleware: [
        {
          name: "customPosition",
          fn: ({ rects }) => {
            const contentEl = editor.view.dom;
            const contentStyle = getComputedStyle(contentEl);
            const paddingLeft = parseFloat(contentStyle.paddingLeft);

            return {
              x: paddingLeft - rects.floating.width - 8,
              y: rects.reference.y,
            };
          },
        },
      ] as Middleware[],
    };
  }, [editor]);

  const handleNodeChange = useCallback((data: any) => {
    if (data.node) setNode(data.node);
    setNodePos(data.pos);
  }, []);

  const handleMove = useCallback(
    (direction: "up" | "down") => {
      const success = moveNode(editor, direction);
      if (success) {
        refreshDragHandle();
        scrollToNode();
      }
    },
    [editor]
  );

  const handleCopy = useCallback(async () => {
    if (!editor || !node || nodePos < 0) return false;

    const { state, view } = editor;

    const slice = state.doc.slice(nodePos, nodePos + node.nodeSize);

    const textContent = slice.content.textBetween(0, slice.size, "\n");
    const htmlContent = view.serializeForClipboard(slice).dom.innerHTML;

    const blobText = new Blob([textContent], { type: "text/plain" });
    const blobHtml = new Blob([htmlContent], { type: "text/html" });

    const clipboardItem = new ClipboardItem({
      "text/plain": blobText,
      "text/html": blobHtml,
    });

    await navigator.clipboard.write([clipboardItem]);
    return true;
  }, [editor, node, nodePos]);

  const handleCut = useCallback(async () => {
    const success = await handleCopy();
    if (success) {
      handleDelete();
    }
  }, [editor, node, nodePos]);

  const handleDuplicate = useCallback(() => {
    if (!editor || !node || nodePos < 0) return false;

    return editor.commands.insertContentAt(
      nodePos + node.nodeSize,
      node.toJSON()
    );
  }, [editor, node, nodePos]);

  const handleDelete = useCallback(() => {
    if (!editor || !node || nodePos < 0) return false;

    return editor.commands.deleteRange({
      from: nodePos,
      to: nodePos + node.nodeSize,
    });
  }, [editor, node, nodePos]);

  if (!editor) return null;

  return (
    <TiptapDragHandle
      editor={editor}
      onNodeChange={handleNodeChange}
      computePositionConfig={menuPosition}
    >
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <div style={{ position: "relative", cursor: "grab" }}>
          <MenuButton
            icon="GripVertical"
            buttonStyle={{ height: "1.5rem", zIndex: open ? 0 : 1 }}
            onMouseDown={() => editor.commands.setNodeSelection(nodePos)}
            onMouseUp={() => {
              setOpen(!open);
              editor.commands.setMeta("hideBubbleMenu", true);
            }}
          />
          <DropdownMenuTrigger style={{ position: "absolute", inset: 0 }} />
        </div>

        <DropdownMenuContent
          style={{ minWidth: "12rem" }}
          side="bottom"
          align="start"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
            <MenuButton
              text="Move up"
              hideText={false}
              tooltip={false}
              icon="ArrowUp"
              onClick={() => handleMove("up")}
            />
          </DropdownMenuItem>
          <DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
            <MenuButton
              text="Move down"
              hideText={false}
              tooltip={false}
              icon="ArrowDown"
              onClick={() => handleMove("down")}
            />
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <MenuButton
              text="Copy"
              hideText={false}
              tooltip={false}
              icon="Clipboard"
              onClick={handleCopy}
            />
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <MenuButton
              text="Cut"
              hideText={false}
              tooltip={false}
              icon="Scissors"
              onClick={handleCut}
            />
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <MenuButton
              text="Duplicate"
              hideText={false}
              tooltip={false}
              icon="Copy"
              onClick={handleDuplicate}
            />
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <MenuButton
              text="Delete"
              hideText={false}
              tooltip={false}
              icon="Trash"
              buttonStyle={{ color: "#fb2c36" }}
              onClick={handleDelete}
            />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TiptapDragHandle>
  );
};
