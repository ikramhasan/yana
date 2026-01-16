'use client';

import { useEffect } from 'react';
import { Crepe } from '@milkdown/crepe';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { fileTreeService } from "@/services/file-tree-service";
import { useDebouncedCallback } from "use-debounce";

interface MilkdownEditorProps {
  markdown?: string;
  fileId?: string;
  filePath?: string;
}

const MilkdownEditorInner = ({ markdown, fileId, filePath }: MilkdownEditorProps) => {
  const saveFile = useDebouncedCallback((path: string, content: string) => {
    fileTreeService.saveFile(path, content);
  }, 1000);

  const { get, loading } = useEditor((root) => {
    const crepe = new Crepe({
      root,
      defaultValue: markdown ?? "",
      featureConfigs: {
        // Ensure block edit is explicitly enabled and configured if needed
        [Crepe.Feature.BlockEdit]: {
        }
      }
    });

    crepe.on((listener) => {
      listener.markdownUpdated((ctx, markdown, prevMarkdown) => {
        if (filePath && markdown !== prevMarkdown) {
          saveFile(filePath, markdown);
        }
      });
    });

    return crepe;
  }, [fileId]);

  useEffect(() => {
    if (!filePath) return;
    return () => {
      saveFile.flush();
    };
  }, [saveFile, fileId, filePath]);

  return (
    <div className="milkdown-crepe-wrapper relative mx-auto w-full max-w-[800px] px-12">
      <Milkdown />
    </div>
  );
};

export function MilkdownEditor(props: MilkdownEditorProps) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="absolute top-2 left-2 z-50">
        <SidebarTrigger className="pt-1" />
      </div>
      <div className="milkdown-container yana-milkdown h-full w-full overflow-y-auto scrollbar-hide">
        <MilkdownProvider>
          <MilkdownEditorInner {...props} />
        </MilkdownProvider>
      </div>
    </div>
  );
}

