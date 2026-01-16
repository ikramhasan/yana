'use client';

import React, { memo } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { WindowControls } from "./window-controls";
import { cn } from "@/lib/utils";

export const FloatingHeader = memo(function FloatingHeader({ className }: { className?: string }) {
  return (
    <div 
      className={cn(
        "absolute top-0 inset-x-0 z-50 flex h-12 items-center justify-between px-2 pointer-events-none",
        className
      )}
    >
      <div className="flex items-center pointer-events-auto">
        <SidebarTrigger className="h-8 w-8" />
      </div>
      <div 
        data-tauri-drag-region 
        className="flex-1 h-full pointer-events-auto cursor-default" 
      />
      <div className="flex items-center pointer-events-auto">
        <WindowControls />
      </div>
    </div>
  );
});

