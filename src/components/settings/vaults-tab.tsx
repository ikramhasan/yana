"use client";

import * as React from "react";
import { useVault } from "@/contexts/vault-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import {
  IconPlus,
  IconCheck,
  IconX,
  IconPencil,
  IconTrash,
  IconCircleCheck,
} from "@tabler/icons-react";

export function VaultsTab() {
  const { vaults, isLoading, addVault, setDefaultVault, removeVault, updateVaultName } = useVault();
  const [isAddingVault, setIsAddingVault] = React.useState(false);
  const [editingVaultId, setEditingVaultId] = React.useState<string | null>(null);
  const [editingName, setEditingName] = React.useState("");

  const handleAddVault = async () => {
    setIsAddingVault(true);
    try {
      await addVault();
    } finally {
      setIsAddingVault(false);
    }
  };

  const handleStartEdit = (vaultId: string, currentName: string) => {
    setEditingVaultId(vaultId);
    setEditingName(currentName);
  };

  const handleSaveEdit = async (vaultId: string) => {
    if (editingName.trim()) {
      await updateVaultName(vaultId, editingName.trim());
    }
    setEditingVaultId(null);
    setEditingName("");
  };

  const handleCancelEdit = () => {
    setEditingVaultId(null);
    setEditingName("");
  };

  const handleRemoveVault = async (vaultId: string) => {
    if (confirm("Are you sure you want to remove this vault?")) {
      await removeVault(vaultId);
    }
  };

  const handleSetDefault = async (vaultId: string) => {
    await setDefaultVault(vaultId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="size-6" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-sm font-medium">Manage Vaults</h3>
        <p className="text-xs text-muted-foreground">
          Add, edit, or remove your note vaults
        </p>
      </div>

      {vaults.length > 0 && (
        <div className="space-y-2">
          {vaults.map((vault) => (
            <Card
              key={vault.id}
              className="rounded-none border shadow-none bg-transparent"
            >
              <CardContent className="flex items-center justify-between gap-3">
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  {editingVaultId === vault.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="h-7 text-sm"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSaveEdit(vault.id);
                          } else if (e.key === "Escape") {
                            handleCancelEdit();
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={() => handleSaveEdit(vault.id)}
                      >
                        <IconCheck className="size-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={handleCancelEdit}
                      >
                        <IconX className="size-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {vault.isDefault && (
                        <IconCircleCheck className="size-4 text-green-500 shrink-0" />
                      )}
                      <span className="font-bold text-sm text-foreground truncate">
                        {vault.name}
                      </span>
                    </div>
                  )}
                  <span className="text-xs text-muted-foreground truncate">
                    {vault.path}
                  </span>
                </div>

                {editingVaultId !== vault.id && (
                  <div className="flex items-center gap-1 shrink-0">
                    {!vault.isDefault && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={() => handleSetDefault(vault.id)}
                        title="Set as default"
                      >
                        <IconCircleCheck className="size-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => handleStartEdit(vault.id, vault.name)}
                      title="Edit name"
                    >
                      <IconPencil className="size-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 hover:text-red-500"
                      onClick={() => handleRemoveVault(vault.id)}
                      title="Remove vault"
                    >
                      <IconTrash className="size-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Button
        variant="outline"
        className="w-full h-12 border-dashed border-2 hover:bg-neutral-50 hover:border-neutral-300 transition-colors"
        onClick={handleAddVault}
        disabled={isAddingVault}
      >
        {isAddingVault ? (
          <Spinner className="size-4" />
        ) : (
          <>
            <IconPlus className="size-4 mr-2" />
            <span className="font-medium uppercase tracking-wide text-xs">
              Add Vault
            </span>
          </>
        )}
      </Button>
    </div>
  );
}
