"use client";

import { MilkdownEditor } from "@/components/editor/milkdown-editor";
import { useFileTree } from "@/contexts/file-tree-context";
import { useState } from "react";
import { convertFileSrc } from "@tauri-apps/api/core";
import { SidebarTrigger } from "@/components/ui/sidebar";

// Image file extensions
const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp', 'ico'];

function isImageFile(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return IMAGE_EXTENSIONS.includes(ext);
}

export default function Page() {
  const { fileContent, selectedFile } = useFileTree();

  // If no file is selected, show only the sidebar trigger
  if (!selectedFile) {
    return (
      <div className="relative h-full w-full flex items-center justify-center">
        <div className="absolute top-2 left-2 z-50">
          <SidebarTrigger className="pt-1" />
        </div>
        <div className="text-muted-foreground text-sm">
          Select a file to start editing
        </div>
      </div>
    );
  }

  // Check if selected file is an image
  const isImage = isImageFile(selectedFile.name);

  // Render image viewer for image files
  if (isImage) {
    const imageSrc = convertFileSrc(selectedFile.path);
    return (
      <div className="relative h-full w-full overflow-hidden">
        <div className="absolute top-2 left-2 z-50">
          <SidebarTrigger className="pt-1" />
        </div>
        <div className="flex h-full w-full items-center justify-center overflow-auto p-8">
          <img
            src={imageSrc}
            alt={selectedFile.name}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <MilkdownEditor markdown={fileContent ?? ""} fileId={selectedFile?.id} filePath={selectedFile?.path} />
    </div>
  );
}