'use client';

import { useRef, useEffect } from 'react';
import { Crepe } from '@milkdown/crepe';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import { convertFileSrc } from '@tauri-apps/api/core';
import { fileTreeService } from '@/services/file-tree-service';

interface TemplateEditorProps {
  initialContent: string;
  onChange: (markdown: string) => void;
  folderPath: string;
}

const TemplateEditorInner = ({ initialContent, onChange, folderPath }: TemplateEditorProps) => {
  const folderPathRef = useRef(folderPath);

  // Keep ref in sync
  useEffect(() => {
    folderPathRef.current = folderPath;
  }, [folderPath]);

  const { get, loading } = useEditor((root) => {
    const crepe = new Crepe({
      root,
      defaultValue: initialContent,
      featureConfigs: {
        [Crepe.Feature.BlockEdit]: {},
        [Crepe.Feature.ImageBlock]: {
          onUpload: async (file: File) => {
            const currentFolderPath = folderPathRef.current;
            if (!currentFolderPath) {
              return URL.createObjectURL(file);
            }

            try {
              // We pass a dummy file path so the service can correctly determine the parent directory
              const dummyFilePath = `${currentFolderPath}/template.md`;
              
              const relativePath = await fileTreeService.saveImageToAttachments(dummyFilePath, file);
              
              // absolute path to the image
              const absolutePath = `${currentFolderPath}/${relativePath}`;
              return convertFileSrc(absolutePath);
            } catch (err) {
              console.error("Failed to upload image in template", err);
              return URL.createObjectURL(file);
            }
          },
        },
      }
    });

    crepe.on((listener) => {
      listener.markdownUpdated((ctx, markdown, prevMarkdown) => {
        if (markdown !== prevMarkdown) {
          onChange(markdown);
        }
      });
    });

    return crepe;
  }, []);

  return (
    <div className="milkdown-crepe-wrapper relative mx-auto w-full h-full px-4">
      <Milkdown />
    </div>
  );
};

export function TemplateEditor(props: TemplateEditorProps) {
  return (
    <div className="relative h-full w-full overflow-hidden border rounded-md min-h-[400px]">
      <div className="milkdown-container yana-milkdown h-full w-full overflow-y-auto scrollbar-hide">
        <MilkdownProvider>
          <TemplateEditorInner {...props} />
        </MilkdownProvider>
      </div>
    </div>
  );
}
