'use client';
// import { useEffect, useRef } from 'react';
import { Plate, usePlateEditor } from "platejs/react";

import { EditorKit } from "@/components/editor/editor-kit";
import {
  Editor ,
  EditorContainer,
} from "@/components/editor/ui/editor";
import { MarkdownPlugin } from "@platejs/markdown";

export function MarkdownEditor({markdown, fileId}: {
  markdown?: string;
  fileId?: string;
}) {
  const editor = usePlateEditor({
    id: fileId,
    plugins: EditorKit,
    value: (editor) => editor.getApi(MarkdownPlugin).markdown.deserialize(markdown ?? ""),
  });
  // const previousFileIdRef = useRef<string | undefined>(fileId);
  // const previousMarkdownRef = useRef<string | undefined>(markdown);

  // // Update editor content when file changes
  // useEffect(() => {
  //   // Only update if the file actually changed
  //   if (fileId !== previousFileIdRef.current && markdown !== previousMarkdownRef.current) {
  //     const markdownApi = editor.getApi(MarkdownPlugin).markdown;
  //     const newValue = markdownApi.deserialize(markdown ?? "");
  //     editor.tf.setValue(newValue);
  //     previousFileIdRef.current = fileId;
  //     previousMarkdownRef.current = markdown;
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [markdown, fileId]);

  return (
    <Plate editor={editor}>
      <EditorContainer>
        <Editor variant="demo" />
      </EditorContainer>
    </Plate>
  );
}
