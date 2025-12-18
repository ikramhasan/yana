'use client';

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { FolderOpen } from "lucide-react";
import { useVault } from "@/contexts/vault-context";

export function WelcomeScreen() {
  const { addVault, isLoading } = useVault();

  const handleSelectVault = async () => {
    await addVault();
  };

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderOpen className="size-4" />
          </EmptyMedia>
          <EmptyTitle>Welcome to Yana</EmptyTitle>
        </EmptyHeader>
        <EmptyContent>
          <EmptyDescription>
            If you give people nothingness, they can ponder what can be achieved from that nothingness.
            <br />
            <span className="text-muted-foreground/70">— Tadao Ando</span>
          </EmptyDescription>
          <Button 
            onClick={handleSelectVault} 
            disabled={isLoading}
            className="mt-4"
          >
            {isLoading ? "Opening..." : "Select Vault"}
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
