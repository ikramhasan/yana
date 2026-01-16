"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GeneralTab } from "./general-tab";
import { VaultsTab } from "./vaults-tab";

export function SettingsDialog({
  children,
  open,
  onOpenChange,
}: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-6 gap-6">
        <DialogHeader className="p-0">
          <DialogTitle className="text-xl font-bold uppercase tracking-wide">
            Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList variant="line" className="w-full justify-start border-b">
            <TabsTrigger value="general" className="text-sm pb-4">
              General
            </TabsTrigger>
            <TabsTrigger value="vaults" className="text-sm pb-4">
              Vaults
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6">
            <GeneralTab />
          </TabsContent>

          <TabsContent value="vaults" className="mt-6">
            <VaultsTab />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
