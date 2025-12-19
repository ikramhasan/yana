'use client';
import { useEffect, useRef } from 'react';
import { Plate, usePlateEditor } from "platejs/react";

import { EditorKit } from "@/components/editor/editor-kit";
import {
  Editor ,
  EditorContainer,
} from "@/components/editor/ui/editor";
import { MarkdownPlugin } from "@platejs/markdown";

import { fileTreeService } from "@/services/file-tree-service";
import { useDebouncedCallback } from "use-debounce";

export function MarkdownEditor({markdown, fileId, filePath}: {
  markdown?: string;
  fileId?: string;
  filePath?: string;
}) {
  const previousFileIdRef = useRef<string | undefined>(fileId);
  const isProgrammaticUpdate = useRef(false);

  const saveFile = useDebouncedCallback((path: string, content: string) => {
    fileTreeService.saveFile(path, content);
  }, 1000);

  const editor = usePlateEditor({
    id: fileId,
    plugins: EditorKit,
    value: (editor) => editor.getApi(MarkdownPlugin).markdown.deserialize(markdown ?? ""),
  });

  // Flush pending saves when fileId changes or component unmounts
  useEffect(() => {
    // Return early if no filePath
    if (!filePath) return;
    
    return () => {
      saveFile.flush();
    };
  }, [saveFile, fileId, filePath]);

  // Update editor content when file changes
  useEffect(() => {
    // Only update if the file actually changed
    // We check against ref to ensure we only reset when the fileId prop actually shifts
    if (fileId !== previousFileIdRef.current) {
        // FLUSH FIRST to save changes from previous file
        saveFile.flush();

        const markdownApi = editor.getApi(MarkdownPlugin).markdown;
        const newValue = markdownApi.deserialize(markdown ?? "");
        
        // Prevent auto-save triggering from this update
        isProgrammaticUpdate.current = true;
        editor.tf.setValue(newValue);
        // Reset flag after a short delay to allow React/Slate event loop to process
        setTimeout(() => {
            isProgrammaticUpdate.current = false;
        }, 0);

        previousFileIdRef.current = fileId;
    }
  }, [markdown, fileId, editor, saveFile]);

  return (
    <Plate 
      editor={editor}
      onValueChange={({ editor }) => {
        // Skip save if this change was programmatic
        if (isProgrammaticUpdate.current) return;

        // serialize content
        const content = editor.getApi(MarkdownPlugin).markdown.serialize();
        if (filePath) {
            saveFile(filePath, content); 
        }
      }}
    >
      <EditorContainer>
        <Editor variant="demo" />
      </EditorContainer>
    </Plate>
  );
}

