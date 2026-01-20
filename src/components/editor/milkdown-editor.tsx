'use client';

import { useEffect, useRef } from 'react';
import { Crepe } from '@milkdown/crepe';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import { convertFileSrc } from '@tauri-apps/api/core';

import { fileTreeService } from "@/services/file-tree-service";
import { useDebouncedCallback } from "use-debounce";
import { useFileTree, calculateStats } from "@/contexts/file-tree-context";

interface MilkdownEditorProps {
  markdown?: string;
  fileId?: string;
  filePath?: string;
}

// Regex to match markdown images: ![alt](src "title") or ![alt](src)
const IMAGE_REGEX = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

/**
 * Check if a URL is a relative path (not http/https/blob/data/asset)
 */
function isRelativePath(src: string): boolean {
  return !src.startsWith('http://') &&
         !src.startsWith('https://') &&
         !src.startsWith('blob:') &&
         !src.startsWith('data:') &&
         !src.startsWith('asset://');
}

/**
 * Get the directory path from a file path
 */
function getDirectory(filePath: string): string {
  const lastSlash = filePath.lastIndexOf('/');
  return lastSlash !== -1 ? filePath.substring(0, lastSlash) : filePath;
}

/**
 * Convert relative image paths in markdown to asset:// URLs for display
 */
function convertToAssetUrls(markdown: string, mdFilePath: string): string {
  const mdDir = getDirectory(mdFilePath);

  return markdown.replace(IMAGE_REGEX, (match, alt, src) => {
    if (isRelativePath(src)) {
      const absolutePath = `${mdDir}/${src}`;
      const assetUrl = convertFileSrc(absolutePath);
      // Preserve the rest of the match structure
      return match.replace(src, assetUrl);
    }
    return match;
  });
}

/**
 * Convert asset:// URLs back to relative paths for saving
 */
function convertToRelativePaths(markdown: string, mdFilePath: string): string {
  const mdDir = getDirectory(mdFilePath);
  // Match asset://localhost/ URLs and convert back to relative paths
  const assetUrlPrefix = convertFileSrc(mdDir + '/');

  // Replace and decode URL-encoded characters (e.g., %2F -> /)
  return markdown.replaceAll(assetUrlPrefix, '').replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    (match, alt, src) => {
      // Only decode if it looks URL-encoded
      if (src.includes('%')) {
        try {
          const decoded = decodeURIComponent(src);
          return `![${alt}](${decoded})`;
        } catch {
          return match;
        }
      }
      return match;
    }
  );
}

const MilkdownEditorInner = ({ markdown, fileId, filePath }: MilkdownEditorProps) => {
  const filePathRef = useRef(filePath);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Keep the ref updated with the latest filePath
  useEffect(() => {
    filePathRef.current = filePath;
  }, [filePath]);

  // Pre-process markdown: convert relative paths to asset:// URLs for display
  const displayMarkdown = filePath && markdown
    ? convertToAssetUrls(markdown, filePath)
    : markdown ?? "";

  const saveFile = useDebouncedCallback((path: string, content: string) => {
    // Convert asset:// URLs back to relative paths before saving
    const markdownToSave = convertToRelativePaths(content, path);
    fileTreeService.saveFile(path, markdownToSave);
  }, 1000);

  const { updateStats } = useFileTree();

  const { loading } = useEditor((root) => {
    const crepe = new Crepe({
      root,
      defaultValue: displayMarkdown,
      featureConfigs: {
        [Crepe.Feature.BlockEdit]: {
        },
        [Crepe.Feature.ImageBlock]: {
          onUpload: async (file: File) => {
            const currentFilePath = filePathRef.current;
            if (!currentFilePath) {
              // Fallback to blob URL if no file path available
              return URL.createObjectURL(file);
            }

            try {
              // Save image to attachments folder and get relative path
              const relativePath = await fileTreeService.saveImageToAttachments(currentFilePath, file);
              // Convert to asset:// URL for display
              const mdDir = getDirectory(currentFilePath);
              const absolutePath = `${mdDir}/${relativePath}`;
              return convertFileSrc(absolutePath);
            } catch {
              // Fallback to blob URL on error
              return URL.createObjectURL(file);
            }
          },
        },
      }
    });

    crepe.on((listener) => {
      listener.markdownUpdated((ctx, markdown, prevMarkdown) => {
        if (filePath && markdown !== prevMarkdown) {
          saveFile(filePath, markdown);
          
          // Calculate stats locally and update context
          const stats = calculateStats(markdown);
          if (stats) {
            updateStats(stats);
          }
        }
      });
    });

    return crepe;
  }, [fileId]);

  // Focus editor when file changes or loads, but don't steal focus from inputs (like rename)
  useEffect(() => {
    if (!loading && wrapperRef.current) {
      // Check if user is currently typing in an input (e.g. renaming a file)
      const active = document.activeElement;
      const isInput = active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement;
      
      if (!isInput) {
        // Small timeout to ensure DOM is ready and selection is stable
        setTimeout(() => {
          const editor = wrapperRef.current?.querySelector('.ProseMirror') as HTMLElement;
          editor?.focus();
        }, 0);
      }
    }
  }, [loading, filePath]);

  useEffect(() => {
    if (!filePath) return;
    return () => {
      saveFile.flush();
    };
  }, [saveFile, fileId, filePath]);

  return (
    <div ref={wrapperRef} className="milkdown-crepe-wrapper relative mx-auto w-full max-w-[800px] px-12">
      <Milkdown />
    </div>
  );
};

export function MilkdownEditor(props: MilkdownEditorProps) {
  return (
    <div className="relative h-full w-full overflow-hidden">

      <div className="milkdown-container yana-milkdown h-full w-full overflow-y-auto scrollbar-hide">
        <MilkdownProvider>
          <MilkdownEditorInner {...props} />
        </MilkdownProvider>
      </div>
    </div>
  );
}

