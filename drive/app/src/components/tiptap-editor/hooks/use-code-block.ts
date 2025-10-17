import { useCallback } from "react";

import { useEditorState, type Editor } from "@tiptap/react";

import { useTiptapEditor } from "../components/provider";
import { getClosestDOM } from "../helpers/tiptap";

// Utility functions
export function canToggleCodeBlock(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;
  return editor.can().toggleCodeBlock();
}

export function isCodeBlockActive(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;
  return editor.isActive("codeBlock");
}

export function getCodeBlockLanguage(editor: Editor | null): string | null {
  if (!editor) return null;
  return editor.getAttributes("codeBlock").language || null;
}

export function toggleCodeBlock(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!canToggleCodeBlock(editor)) return false;
  return editor.chain().focus().toggleCodeBlock().run();
}
export function getCodeBlockContent(editor: Editor | null): string {
  if (!editor) return "";
  const node = getClosestDOM(editor, (node) => node.nodeName === "PRE");
  return node?.textContent || "";
}

// Hook
export function useCodeBlock() {
  const { editor } = useTiptapEditor();

  const editorState = useEditorState({
    editor,
    selector({ editor }) {
      return {
        isActive: isCodeBlockActive(editor),
        canToggle: canToggleCodeBlock(editor),
        language: getCodeBlockLanguage(editor),
        shouldShow: isCodeBlockActive(editor),
      };
    },
  });

  const toggleBlock = useCallback(() => {
    return toggleCodeBlock(editor);
  }, [editor]);

  const setLanguage = useCallback(
    (language: string) => {
      return editor
        .chain()
        .focus()
        .updateAttributes("codeBlock", { language })
        .run();
    },
    [editor]
  );

  const deleteBlock = useCallback(() => {
    return editor.chain().focus().deleteNode("codeBlock").run();
  }, [editor]);

  const getContent = useCallback(() => {
    return getCodeBlockContent(editor);
  }, [editor]);

  return {
    ...editorState,
    toggleBlock,
    deleteBlock,
    setLanguage,
    getContent,
  };
}
