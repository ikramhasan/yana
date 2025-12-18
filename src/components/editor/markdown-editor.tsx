'use client';
import { Plate, usePlateEditor } from "platejs/react";

import { EditorKit } from "@/components/editor/editor-kit";
import {
  Editor ,
  EditorContainer,
} from "@/components/editor/ui/editor";
import { MarkdownPlugin } from "@platejs/markdown";

export function MarkdownEditor({markdown}: {
  markdown?: string
}) {
  const editor = usePlateEditor({
    plugins: EditorKit,
    value: (editor) => editor.getApi(MarkdownPlugin).markdown.deserialize(markdown ?? ""),
  });

  return (
    <Plate editor={editor}>
      <EditorContainer>
        <Editor variant="demo" />
      </EditorContainer>
    </Plate>
  );
}
