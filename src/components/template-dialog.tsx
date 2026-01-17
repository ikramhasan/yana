"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TemplateEditor } from "@/components/editor/template-editor";
import { templateService } from "@/services/template-service";
import { IconFolder } from "@tabler/icons-react";

interface TemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderPath: string;
  folderName: string;
}

export function TemplateDialog({
  open,
  onOpenChange,
  folderPath,
  folderName,
}: TemplateDialogProps) {
  const [content, setContent] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (open && folderPath) {
      setIsLoading(true);
      const load = async () => {
        // Ensure templates are loaded into memory first
        await templateService.loadTemplates(); 
        const existing = templateService.getTemplate(folderPath);
        setContent(existing || "");
        setIsLoading(false);
      };
      load();
    }
  }, [open, folderPath]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (content.trim()) {
        await templateService.setTemplate(folderPath, content);
      } else {
        await templateService.removeTemplate(folderPath);
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save template", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col p-6 gap-6">
        <DialogHeader className="p-0 shrink-0">
          <DialogTitle className="text-xl font-bold tracking-wide flex gap-2">
            <span>Template for</span>
            <span className="flex items-center gap-2 bg-muted px-2 py-1 text-sm font-mono">
              <IconFolder className="w-4 h-4" />
              {folderName}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 border rounded-md overflow-hidden">
          {!isLoading && (
            <TemplateEditor
              initialContent={content}
              onChange={setContent}
              folderPath={folderPath}
            />
          )}
          {isLoading && (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Loading template...
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
