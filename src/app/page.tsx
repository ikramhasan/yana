"use client";

import { MarkdownEditor } from "@/components/editor/markdown-editor";
import { useFileTree } from "@/contexts/file-tree-context";

let index = 0

export default function Page() {
  const { fileContent, selectedFile } = useFileTree();

  console.log("Page rendered", index++);

  // Use file content from context if available, otherwise show welcome message
  const markdown = fileContent ?? "# Welcome\n\nSelect a file from the sidebar to start editing.";

  return <MarkdownEditor markdown={markdown} fileId={selectedFile?.id} />;
}